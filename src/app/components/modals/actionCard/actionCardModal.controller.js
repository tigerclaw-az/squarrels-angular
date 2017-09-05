export default class ActionCardModalController {
	constructor($rootScope, $scope, $log, _) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
	}

	$onInit() {
		this.card = this.resolve.card;

		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
	}

	ok() {
		this.$log.debug('ok()', this);
	}

	cancel() {
		this.$log.debug('cancel()', this);
	}
}
