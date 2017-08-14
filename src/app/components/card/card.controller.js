export default class CardController {
	constructor($rootScope, $scope, $log, _, cardsApi) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
		this.cardsApi = cardsApi;

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

		// Reset selected cards when player draws a new card
		angular.element(document).find('card').removeClass('selected');
		this.player.cardsSelected = [];
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
			this.player.cardsSelected = this._.filter(this.player.cardsSelected, (o) => { return o.id !== this.cardId });
		} else {
			$el.addClass('selected');
			this.player.cardsSelected.push(this.$scope.cardData);
		}
	}
}
