export default class DeckStoreService {
	constructor($log, $http, $q, _, decksApi, playerModel, playersApi, playersStore) {
		'ngInject';

		var self = this;

		this.$log = $log;
		this.$http = $http;
		this.$q = $q;

		this._ = _;
		this.decksApi = decksApi;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.model = {
			deck: {}
		};

		this.$log.info('constructor()', this);
	}

	dealCards() {
		let drawDeck = this.getByType('main');

		this.$log.info('dealCards()', drawDeck, this);

		_.forEach(this.playersStore.model.players, (pl) => {
			this.drawCard(pl, drawDeck, this.playerModel.numDrawCards);
		});

		// this.decksApi.update({ cards: drawDeck.cards }, drawDeck.id);

		// After all cards have been dealt, set the starting player
		this.playersStore.nextPlayer(-1);
	}

	discard(id) {
		let hoardDeck = this.getByType('discard'),
			cards = hoardDeck.cards,
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					let data = res.data;

					this.update(data.id, data);

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

		// Remove card from cached deck
		// this._.pull(hoardDeck.cards, id);

		this.decksApi
			.update({ cards }, hoardDeck.id)
			.then(onSuccess, onError);
	}

	drawCard(pl, deck, count) {
		let cardsDrawn = _.sampleSize(deck.cards, count),
			cardsMerge = cardsDrawn;

		this.$log.info('drawCard()', pl, deck, cardsDrawn, this);

		if (!this._.isEmpty(pl.cardsInHand)) {
			cardsMerge = this._.union(pl.cardsInHand, cardsDrawn);
		}

		this.$log.info('cards:union -> ', cardsMerge);

		let plData = {
			cardsInHand: cardsMerge,
			isFirstTurn: count === this.playerModel.numDrawCards ? true : false,
			totalCards: cardsMerge.length
		};

		this.$log.info('deck.cards -> ', deck.cards);
		this.$log.info('cardsDrawn -> ', cardsDrawn);
		this._.pullAll(deck.cards, cardsDrawn);

		this.decksApi
			.update({ cards: deck.cards }, deck.id)
			.then(() => {
				this.playersApi
					.update(plData, pl.id)
					.then(res => {
						this.$log.info('playersApi:update()', res, this);
					})
					.catch(err => {
						this.$log.error('This is nuts! Error: ', err);
					});
			})
			.catch(err => {
				this.$log.error(err);
			});
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
		this.$log.info('update()', id, data, this);

		this.model.deck[id] = data;
	}
}
