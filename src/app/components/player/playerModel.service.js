export class PlayerModelService {
	constructor($log, $localStorage, $q, _, cardsApi, playersApi) {
		'ngInject';

		this.$log = $log.getInstance(this.constructor.name);
		this.$localStorage = $localStorage;
		this.$q = $q;

		this._ = _;
		this.cardsApi = cardsApi;
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

		this.update(plData);

		return this.playersApi.update(this.model.player.id, plData);
	}

	getCards() {
		let cards = this.model.player.cardsInHand;

		if (!this._.isEmpty(cards)) {
			return this.cardsApi.get(cards);
		}

		return this.$q.defer().resolve([]);
	}

	resetSelected() {
		this.$log.info('resetSelected()', this);

		// Reset selected cards when player draws a new card
		angular.element(document).find('card').removeClass('selected');
		this.model.player.cardsSelected = [];
	}

	showSpecialCards() {
		let score = this.model.player.score,
			onSuccess = (res => {
				let cards = res.data,
					special = this._.filter(cards, { cardType: 'special' }),
					plUpdate = {
						score: score,
						cardsInHand: special.map(card => {
							return card.id;
						})
					};

				this.$log.info('showSpecialCards()', special, this);

				if (special.length) {
					this._.forEach(special, (card) => {
						plUpdate.score += card.amount;
					});
				}

				return this.playersApi.update(this.model.player.id, plUpdate);
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.getCards().then(onSuccess, onError);
	}

	update(data) {
		Object.assign(this.model.player, data);
	}
}
