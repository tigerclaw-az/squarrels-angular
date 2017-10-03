export class PlayerModelService {
	constructor($log, $localStorage, $q, _, cardsApi, playersApi, websocket) {
		'ngInject';

		this.$log = $log.getInstance(this.constructor.name);
		this.$localStorage = $localStorage;
		this.$q = $q;

		this._ = _;
		this.cardsApi = cardsApi;
		this.playersApi = playersApi;
		this.websocket = websocket;

		this.model = {
			player: null
		};

		this.numDrawCards = 7;
	}

	discard(id) {
		let cards = this.model.player.cardsInHand;

		this.$log.debug('discard()', id, cards, this);

		// Remove card from player
		this._.pull(cards, id);

		let plData = {
			cardsInHand: cards,
		};

		this.$log.debug('playerModel:cards -> ', plData);

		this.update(Object.assign(plData, { hasDrawnCard: false }));

		return this.playersApi.update(this.model.player.id, plData);
	}

	getByProp(prop) {
		if (prop) {
			return this.model.player[prop];
		}

		return this.model.player;
	}

	getCards() {
		let cards = this.model.player.cardsInHand;

		if (!this._.isEmpty(cards)) {
			return this.cardsApi.get(cards);
		}

		return [];
	}

	insert(data) {
		let pl = Object.assign({}, {
			hasDrawnCard: false,
			isCurrent: true,
			isQuarrel: false,
			message: null,
			cardsInHand: [],
			cardsSelected: []
		}, data);

		this.$log.debug('insert()', pl, this);

		this.model.player = pl;
		this.$localStorage.player = this.model.player;
	}

	isActive() {
		return this.model.player && this.model.player.isActive;
	}

	resetSelected() {
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
						score: score
					};

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
		let player = this.model.player;

		if (data.isQuarrel) {
			if (this._.isEmpty(player.cardsInHand)) {
				this.websocket.send({
					action: 'quarrel',
					card: {},
					player: player.id
				});

				return false;
			}

			data.message = 'Choose a Card';
		}

		this.$log.debug('update()', data, this);

		Object.assign(this.model.player, data);

		Object.assign(this.$localStorage.player, this.model.player);
	}
}
