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

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	ok() {
		this.$log.info('ok()', this);
	}

	cancel() {
		this.$log.info('cancel()', this);
	}
}
