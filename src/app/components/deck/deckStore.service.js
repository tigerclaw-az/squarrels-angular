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
			let cards = _.sampleSize(drawDeck.cards, this.playerModel.numDrawCards),
				dealPromise;

			this.$log.info('cards:', pl, cards);

			if (pl.id === this.playerModel.model.player.id) {
				this.playersStore.update(pl.id, { cardsInHand: cards, totalCards: this.playerModel.numDrawCards });
			}
			_.pullAll(drawDeck.cards, cards);

			this.playersApi
				.update({ cardsInHand: cards, totalCards: this.playerModel.numDrawCards }, pl.id)
				.then(res => {
					this.$log.info('playersApi:update()', res, this);
				})
				.catch(err => {
					this.$log.error('This is nuts! Error: ', err);
				});
		});

		this.decksApi.update({ cards: drawDeck.cards }, drawDeck.id);

		// After all cards have been dealt, set the starting player
		this.playersStore.nextPlayer(-1);
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
		this.model.deck[id] = data;
	}
}
