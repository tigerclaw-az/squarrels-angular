export default class CardController {
	constructor($rootScope, $scope, $log, _, toastr, cardsApi, playersApi) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;

		this.cardsApi = cardsApi;
		this.playersApi = playersApi;

		this.cardData = {};

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);
	}

	$onChanges() {
		let onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					this.cardData = res.data[0];

					let type = this.cardData.cardType,
						name = this.cardData.name;

					if (type === 'action') {
						if (name === 'winter') {
							this.$rootScope.$broadcast('deck:action:winter');
						}
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
		return this.cardType !== 'storage' && this.player.isCurrent;
	}

	isDisabled() {
		return !this.cardId || this.cardType === 'storage' || !this.player.isActive;
	}

	onClick(e) {
		let filterBy = (o) => { return o.id !== this.cardId };

		this.$log.info('onClick()', this, this.cardId);

		let $el = angular.element(e.currentTarget).parent();

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
