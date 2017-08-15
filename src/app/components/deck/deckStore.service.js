export default class DeckStoreService {
	constructor($log, $http, $q, _, toastr, decksApi, gameModel, playerModel, playersApi, playersStore) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$q = $q;

		this._ = _;
		this.decksApi = decksApi;
		this.gameModel = gameModel;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.model = {
			deck: {}
		};

		this.$log.info('constructor()', this);
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

		this.decksApi
			.update(hoardDeck.id, { cards })
			.then(onSuccess, onError);
	}

	drawCard(pl, count) {
		let deck = this.getByType('main'),
			cardsMerge = [],
			cardsFromDeck = {
				ids: deck.cards.map(obj => { return obj.id }),
				toDraw: count > 1 ? this._.filter(deck.cards, { cardType: 'number' }) : deck.cards,
			},
			cardsDrawn = {
				cards: this._.sampleSize(cardsFromDeck.toDraw, count)
			},
			isActionCard = cardsDrawn.cards[0].cardType === 'action',
			drawDefer = this.$q.defer(),
			plData = {
				isFirstTurn: count === this.playerModel.numDrawCards ? true : false,
			};

		cardsDrawn.ids = cardsDrawn.cards.map(obj => { return obj.id });
		cardsMerge = cardsDrawn.ids;

		this.$log.info('drawCard()', pl, deck, this);

		this.$log.info('cardsFromDeck -> ', cardsFromDeck);
		this.$log.info('cardsDrawn -> ', cardsDrawn);

		if (!isActionCard) {
			// Player drew a non-"action" card, so add to their hand and update
			if (!this._.isEmpty(pl.cardsInHand)) {
				cardsMerge = this._.union(pl.cardsInHand, cardsDrawn.ids);
			}

			this.$log.info('cards:union -> ', cardsMerge);

			Object.assign(plData, {
				cardsInHand: cardsMerge,
				totalCards: cardsMerge.length
			});
		} else {
			Object.assign(plData, {
				actionCard: cardsDrawn.cards[0]
			});
		}

		this._.pullAll(cardsFromDeck.ids, cardsDrawn.ids);

		this.$log.info('plData -> ', plData);
		this.$log.info('remainingCards -> ', cardsFromDeck.ids);

		this.decksApi
			.update(deck.id, { cards: cardsFromDeck.ids })
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
