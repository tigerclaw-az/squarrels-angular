export default class StorageModalController {
	constructor($rootScope, $scope, $log, _) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
	}

	$onInit() {
		this.player = this.resolve.player;

		this.cards = this.player.cardsInStorage;

		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.debug('destroy', this);
		};
	}

	ok() {
		this.$log.debug('ok()', this);
	}

	cancel() {
		this.$log.debug('cancel()', this);
	}
}
