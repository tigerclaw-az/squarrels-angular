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
		let drawDeck = this._.find(this.model.deck, function(o) {
			return o.deckType === 'main';
		});

		this.$log.info('dealCards()', drawDeck, this);

		_.forEach(this.playersStore.model.players, (pl) => {
			this.drawCard(pl, drawDeck, this.playerModel.numDrawCards);
		});

		this.decksApi.update({ cards: drawDeck.cards }, drawDeck.id);

		// After all cards have been dealt, set the starting player
		this.playersStore.nextPlayer(-1);
	}

	drawCard(pl, deck, count) {
		let cards = this._.map(_.sampleSize(deck.cards, count), '_id'),
			totalCards = pl.totalCards + count;

		this.$log.info('drawCard()', pl, deck, totalCards, this);

		if (!this._.isEmpty(pl.cardsInHand)) {
			cards = this._.union(pl.cardsInHand, cards);
		}

		this.$log.info('cards -> ', cards);

		if (pl.id === this.playerModel.model.player.id) {
			this.playersStore.update(pl.id, { cardsInHand: cards, totalCards: totalCards });
		}
		_.pullAll(deck.cards, cards);

		// TODO: Update deck to remove card(s)
		// this.decksApi.update({ cards: drawDeck.cards }, drawDeck.id);

		this.playersApi
			.update({ cardsInHand: cards, totalCards: totalCards }, pl.id)
			.then(res => {
				this.$log.info('playersApi:update()', res, this);
			})
			.catch(err => {
				this.$log.error('This is nuts! Error: ', err);
			});
	}

	get(id) {
		this.$log.info('get()', id, this);

		if (id) {
			return this.model.deck[id];
		}

		return this.model.deck;
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
