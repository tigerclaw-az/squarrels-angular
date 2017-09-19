export default class DeckStoreService {
	constructor($log, $http, $q, _, toastr, sounds, decksApi, playerModel, playersApi, playersStore) {
		'ngInject';

		this.$http = $http;
		this.$log = $log.getInstance(this.constructor.name);
		this.$q = $q;

		this._ = _;
		this.sounds = sounds;
		this.toastr = toastr;

		this.decksApi = decksApi;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.model = {};

		this.$log.debug('constructor()', this);
	}

	dealCards(pl) {
		let dealDefer = this.$q.defer(),
			drawPromises = [];

		for (let i = 0; i < this.playerModel.numDrawCards; ++i) {
			drawPromises.push(this.drawCard(true));
		}

		this.$q
			.all(drawPromises)
			.then(cards => {
				let cardIds = cards.map(card => {
					return card.id
				});

				this.$log.debug('dealCards:then()', cards, cardIds, this);

				this.playersApi
					.update(pl.id, { cardsInHand: cardIds })
					.then(res => {
						this.$log.debug('playersApi:update()', res, this);
						dealDefer.resolve(cards);
					})
					.catch(err => {
						this.$log.error('This is nuts! Error: ', err);
					});
			})
			.catch(err => {
				this.$log.error('This is nuts! Error: ', err);

				dealDefer.reject(err);
			});

		return dealDefer.promise;
	}

	discard(id, nextPlayer = true) {
		let hoardDeck = this.getByType('discard'),
			cards = hoardDeck.cards,
			onSuccess = (res => {
				this.$log.debug('onSuccess()', res, this);

				if (res[0].status === 200 && res[1].status === 200 && nextPlayer) {
					this.playersStore.nextPlayer();
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			actions = [];

		this.$log.debug('discard()', id, hoardDeck, this);

		if (this._.includes(cards, id)) {
			this.toastr.error(id, 'CARD ALREADY DISCARDED');
			return false;
		}

		cards.push(id);

		this.sounds.play('discard');

		actions.push(
			this.decksApi.update(hoardDeck.id, { cards }),
			this.playerModel.discard(id)
		);

		this.$q.all(actions)
			.then(onSuccess, onError);
	}

	drawCard(numbersOnly = false, adminCard) {
		let mainDeck = this.getByType('main'),
			drawDefer = this.$q.defer(),
			cardsFromDeck = {
				ids: mainDeck.cards.map(obj => { return obj.id }),
				toDraw: numbersOnly ? this._.filter(mainDeck.cards, { cardType: 'number' }) : mainDeck.cards,
			},
			cardDrawn;

		if (adminCard) {
			cardDrawn = this._.find(cardsFromDeck.toDraw, adminCard);
		} else {
			cardDrawn = this._.sampleSize(cardsFromDeck.toDraw)[0];
		}

		this.$log.debug('drawCard()', numbersOnly, adminCard, mainDeck, this);

		this.$log.debug('cardsFromDeck -> ', cardsFromDeck);
		this.$log.debug('cardDrawn -> ', cardDrawn);

		this._.pull(cardsFromDeck.ids, cardDrawn.id);
		mainDeck.cards = this._.reject(mainDeck.cards, (o) => {
			return cardDrawn.id === o.id;
		});

		this.$log.debug('remainingCards -> ', mainDeck.cards);

		this.decksApi
			.update(mainDeck.id, { cards: cardsFromDeck.ids })
			.then(() => {
				drawDefer.resolve(cardDrawn);
			})
			.catch(err => {
				this.$log.error(err);

				drawDefer.reject({ card: cardDrawn, error: err});
			});

		return drawDefer.promise;
	}

	empty() {
		this.model = {};
	}

	get(prop, value) {
		if (prop) {
			return this._.find(this.model, { prop: value });
		}

		return this.model;
	}

	getById(id) {
		return this.model[id] || {};
	}

	getByType(type) {
		return this._.find(this.model, function(o) {
			return o.deckType === type;
		});
	}

	insert(data) {
		this.$log.debug('insert()', data, this);

		this.model[data.id] = data;
	}

	update(id, data) {
		let deck = this.model[id];

		Object.assign(deck, data);

		this.$log.debug('update()', id, data, deck, this);

		return deck;
	}
}
