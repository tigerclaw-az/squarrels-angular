export default class CardController {
	constructor($rootScope, $scope, $log, _, toastr, cardsApi, playerModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;

		this.cardsApi = cardsApi;
		this.playerModel = playerModel;
		this.websocket = websocket;

		// Bindings from <card> component
		// this.game
		// this.player

		this.cardData = {};

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);
	}

	$onChanges() {
		let onSuccess = (res => {
				this.$log.debug('onSuccess()', res, this);

				if (res.status === 200 && !this._.isEmpty(res.data[0])) {
					this.cardData = res.data[0];

					let type = this.cardData.cardType;

					if (type === 'action') {
						this.$log.info('ACTION CARD -> ', this.cardData);
					}
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.debug('$onChanges()', this);

		this.cardData = {};

		if (this.cardId) {
			this.cardsApi
				.get(this.cardId)
				.then(onSuccess, onError);
		}
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this, this.cardData);
	}

	canDrag() {
		if (this.player) {
			return this.cardType !== 'storage' && this.player.isCurrent;
		}

		return false;
	}

	isDisabled() {
		if (!this.player || !this.game) {
			return true;
		}

		if (!this._.isEmpty(this.game.actionCard) && !this.player.isQuarrel) {
			return true;
		}

		if (this.cardId && this.cardType !== 'storage' && this.game.isGameStarted) {
			return false;
		}

		return true;
	}

	isQuarrelCard() {
		// FIXME: Add logic to validate card can be used
		return true;
	}

	onClick(e) {
		let filterBy = (o) => { return o.id !== this.cardId },
			$el = angular.element(e.currentTarget).parent();

		this.$log.debug('onClick()', this, this.cardId);

		if (!this._.isEmpty(this.game.actionCard) && this.isQuarrelCard()) {
			this.websocket.send({
				action: 'quarrel',
				card: this.cardData,
				player: this.player.id
			});
		} else if (!this.game.actionCard) {
			if ($el.hasClass('selected')) {
				$el.removeClass('selected');
				this.player.cardsSelected = this._.filter(this.player.cardsSelected, filterBy);
			} else {
				$el.addClass('selected');
				this.player.cardsSelected.push(this.cardData);
			}
		}
	}
}
