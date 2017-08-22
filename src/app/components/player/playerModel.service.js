export class PlayerModelService {
	constructor($log, $http, $localStorage, $q, _, playersApi) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;
		this.$q = $q;

		this._ = _;
		this.playersApi = playersApi;

		this.model = {
			player: null
		};

		this.numDrawCards = 7;
	}

	insert(data) {
		let pl = Object.assign({}, {
			isCurrent: true,
			cardsInHand: [],
			cardsSelected: []
		}, data);

		this.$log.info('insert()', pl, this);

		this.model.player = pl;
		this.$localStorage.player = this.model.player;
	}

	discard(id) {
		let cards = this.model.player.cardsInHand;

		this.$log.info('discard()', id, cards, this);

		// Remove card from player
		this._.pull(cards, id);

		let plData = {
			cardsInHand: cards,
			totalCards: cards.length
		};

		this.$log.info('playerModel:cards -> ', plData);

		return this.playersApi.update(this.model.player.id, plData);
	}

	resetSelected() {
		this.$log.info('resetSelected()', this);

		// Reset selected cards when player draws a new card
		angular.element(document).find('card').removeClass('selected');
		this.model.player.cardsSelected = [];
	}

	update(data) {
		Object.assign(this.model.player, data);

		if (!data.actionCard) {
			this.model.player.actionCard = null;
		}
	}

	updateScore() {
		let special = this._.filter(this.model.player.cardsInHand, { cardType: 'special' }),
			score = this.model.player.score;

		this.$log.info('updateScore()', special, this);

		if (special.length) {
			this._.forEach(special, (card) => {
				score += card.amount;
			});

			return this.playersApi.update(this.model.player.id, { score: score });
		}
	}
}
