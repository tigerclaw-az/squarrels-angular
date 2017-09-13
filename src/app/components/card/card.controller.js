export default class CardController {
	constructor($rootScope, $scope, $log, _, toastr, cardsApi) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;

		this.cardsApi = cardsApi;

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
		if (this.player) {
			return !this.cardId ||
				this.cardType === 'storage' ||
				!this.player.isActive ||
				!this.game.isGameStarted;
		}

		return true;
	}

	onClick(e) {
		let filterBy = (o) => { return o.id !== this.cardId },
			$el = angular.element(e.currentTarget).parent();

		this.$log.debug('onClick()', this, this.cardId);

		e.preventDefault();

		if ($el.hasClass('selected')) {
			$el.removeClass('selected');
			this.player.cardsSelected = this._.filter(this.player.cardsSelected, filterBy);
		} else {
			$el.addClass('selected');
			this.player.cardsSelected.push(this.cardData);
		}
	}
}
