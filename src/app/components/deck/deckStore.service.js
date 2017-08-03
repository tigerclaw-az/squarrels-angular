export default class DeckStoreService {
	constructor($log, $http, _) {
		'ngInject';

		var self = this;

		this.$log = $log;
		this.$http = $http;

		this._ = _;

		this.model = {
			cards: {}
		};

		this.$log.info('constructor()', this);
	}

	getCards(id) {
		this.$log.info('get()', id, this);

		if (id) {
			return this.model.cards[id];
		}

		return this.model.cards;
	}

	insert(id, cards) {
		this.$log.info('insert()', id, cards, this);

		this.model.cards[id] = cards;
	}
}
