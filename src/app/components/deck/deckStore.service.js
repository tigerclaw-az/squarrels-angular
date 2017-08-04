export default class DeckStoreService {
	constructor($log, $http, _, decksApi, playersStore) {
		'ngInject';

		var self = this;

		this.$log = $log;
		this.$http = $http;

		this._ = _;
		this.decksApi = decksApi;
		this.playersStore = playersStore;

		this.model = {
			deck: {}
		};

		this.$log.info('constructor()', this);
	}

	dealCards() {
		let mainDeck = this._.find(this.model.deck, function(o) {
			return o.deckType === 'main';
		});

		this.$log.info('dealCards()', mainDeck, this);

		_.forEach(this.playersStore.model.players, (pl) => {
			let cards = _.sampleSize(mainDeck.cards, 7);

			this.$log.info('cards:', cards);

			pl.cardsInHand = cards;

			_.pullAll(mainDeck.cards, cards);

			this.$log.info('mainDeck:', this.get(mainDeck.id));
		});

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

	insert(id, data) {
		this.$log.info('insert()', id, data, this);

		this.model.deck[id] = data;
	}

	update(id, data) {
		this.model.deck[id] = data;
	}
}
