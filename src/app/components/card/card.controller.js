export default class CardController {
	constructor($rootScope, $scope, $log, _, playerModel, cardsApi) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
		this.cardsApi = cardsApi;
		this.playerModel = playerModel.model;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		let onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					this.$scope.cardData = res.data[0];
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.info('$onInit()', this);

		this.$scope.cardData = {};

		if (this.cardId) {
			this.cardsApi
				.get(this.cardId)
				.then(onSuccess, onError);
		}
	}

	$onDestroy() {
		return () => {
			this.$log.info('$onDestroy()', this);
		};
	}

	canDrag() {
		return this.player.isCurrent;
	}

	isDisabled() {
		return !this.cardId || this.cardType === 'storage' || !this.player.isActive;
	}

	onClick(e) {
		this.$log.info('onClick()', this, this.cardId);

		let $el = angular.element(e.currentTarget).parent();

		e.preventDefault();

		if ($el.hasClass('selected')) {
			$el.removeClass('selected');
			this._.pull(this.playerModel.player.cardsSelected, this.cardId);
		} else {
			$el.addClass('selected');
			this.playerModel.player.cardsSelected.push(this.cardId);
		}
	}
};
