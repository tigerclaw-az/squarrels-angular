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

		this.model = {
			deck: {}
		};

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

				this.$log.info('dealCards:then()', cards, cardIds, this);

				this.playersApi
					.update(pl.id, { cardsInHand: cardIds, totalCards: cardIds.length })
					.then(res => {
						this.$log.info('playersApi:update()', res, this);
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
				this.$log.info('onSuccess()', res, this);

				if (res[0].status === 200 && res[1].status === 200 && nextPlayer) {
					this.playersStore.nextPlayer();
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			actions = [];

		this.$log.info('discard()', id, hoardDeck, this);

		if (this._.includes(cards, id)) {
			this.toastr.error(id, 'CARD ALREADY DISCARDED');
			return false;
		}

		cards.push(id);

		this.sounds.play('hoard');

		actions.push(
			this.decksApi.update(hoardDeck.id, { cards }),
			this.playerModel.discard(id)
		);

		this.$q.all(actions)
			.then(onSuccess, onError);
	}

	drawCard(numbersOnly = false) {
		let mainDeck = this.getByType('main'),
			drawDefer = this.$q.defer(),
			cardsFromDeck = {
				ids: mainDeck.cards.map(obj => { return obj.id }),
				toDraw: numbersOnly ? this._.filter(mainDeck.cards, { cardType: 'number' }) : mainDeck.cards,
			},
			cardDrawn = this._.sampleSize(cardsFromDeck.toDraw)[0];

		this.$log.info('drawCard()', mainDeck, this);

		this.$log.info('cardsFromDeck -> ', cardsFromDeck);
		this.$log.info('cardDrawn -> ', cardDrawn);

		this._.pull(cardsFromDeck.ids, cardDrawn.id);
		mainDeck.cards = this._.reject(mainDeck.cards, (o) => {
			return cardDrawn.id === o.id;
		});

		this.$log.info('remainingCards -> ', mainDeck.cards);

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
		this.model.deck = {};
	}

	get(id) {
		this.$log.info('get()', id, this);

		if (id) {
			return this.model.deck[id];
		}

		return this.model.deck;
	}

	getByType(type) {
		return this._.find(this.model.deck, function(o) {
			return o.deckType === type;
		});
	}

	insert(data) {
		this.$log.info('insert()', data, this);

		this.model.deck[data.id] = data;
	}

	update(id, data) {
		let deck = this.model.deck[id];

		Object.assign(deck, data);

		this.$log.info('update()', id, data, deck, this);

		return deck;
	}
}
