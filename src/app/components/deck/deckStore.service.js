export default class DeckStoreService {
	constructor($log, $http, $q, _, toastr, sounds, decksApi, gameModel, playerModel, playersApi, playersStore) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$q = $q;

		this._ = _;
		this.sounds = sounds;
		this.toastr = toastr;

		this.decksApi = decksApi;
		this.gameModel = gameModel;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.model = {
			deck: {}
		};

		this.$log.debug('constructor()', this);
	}

	discard(id) {
		let hoardDeck = this.getByType('discard'),
			cards = hoardDeck.cards,
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					this.playerModel
						.discard(id)
						.then(() => {
							this.playersStore.nextPlayer();
						})
						.catch(err => {
							this.$log.error(err);
						});
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.info('discard()', id, hoardDeck, this);

		cards.push(id);

		this.sounds.play('hoard');

		this.decksApi
			.update(hoardDeck.id, { cards })
			.then(onSuccess, onError);
	}

	drawCard(pl, count) {
		let mainDeck = this.getByType('main'),
			hoardDeck = this.getByType('discard'),
			cardsMerge = [],
			cardsFromDeck = {
				ids: mainDeck.cards.map(obj => { return obj.id }),
				toDraw: count > 1 ? this._.filter(mainDeck.cards, { cardType: 'number' }) : mainDeck.cards,
			},
			cardsDrawn = {
				cards: this._.sampleSize(cardsFromDeck.toDraw, count)
			},
			card = cardsDrawn.cards[0],
			cardAction = card.action,
			drawDefer = this.$q.defer(),
			plData = {};

		cardsDrawn.ids = cardsDrawn.cards.map(obj => { return obj.id });
		cardsMerge = cardsDrawn.ids;

		this.$log.info('drawCard()', pl, mainDeck, this);

		this.$log.info('cardsFromDeck -> ', cardsFromDeck);
		this.$log.info('cardsDrawn -> ', cardsDrawn);

		if (!cardAction) {
			// Player drew a non-"action" card, so add to their hand and update
			if (!this._.isEmpty(pl.cardsInHand)) {
				cardsMerge = this._.union(pl.cardsInHand, cardsDrawn.ids);
			}

			this.$log.info('cards:union -> ', cardsMerge);

			Object.assign(plData, {
				cardsInHand: cardsMerge,
				totalCards: cardsMerge.length
			});

			if (count === 1) {
				plData.isFirstTurn = plData.totalCards < this.playerModel.numDrawCards;
			}
		} else {
			this.toastr.info(`Action Card - ${cardAction}`);

			plData.actionCard = card;

			// FIXME: Only handling 'hoard' & 'winter' cards right now
			switch (cardAction) {
				case 'winter':
					plData.isActive = false;
					this.gameModel.endGame();
					break;

				case 'hoard':
					if (!hoardDeck.cards.length) {
						this.toastr.info('No cards to Hoard');
						plData.actionCard = null;
					}

					break;

				default:
					plData.actionCard = null;
					break;
			}

			// Don't allow player to draw more than 7 cards
			if (plData.totalCards === this.playerModel.numDrawCards) {
				plData.isFirstTurn = false;
			}
		}

		this._.pullAll(cardsFromDeck.ids, cardsDrawn.ids);

		this.$log.info('plData -> ', plData);
		this.$log.info('remainingCards -> ', cardsFromDeck.ids);

		this.decksApi
			.update(mainDeck.id, { cards: cardsFromDeck.ids })
			.then(() => {
				this.$log.info('decksApi:update()', this);

				this.playersApi
					.update(pl.id, plData)
					.then(res => {
						this.$log.info('playersApi:update()', res, this);
						drawDefer.resolve(res);
					})
					.catch(err => {
						this.$log.error('This is nuts! Error: ', err);
						drawDefer.reject(err);
					});
			})
			.catch(err => {
				this.$log.error(err);
			});

		return drawDefer.promise;
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
