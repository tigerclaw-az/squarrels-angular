export default class StartController {
	constructor($rootScope, $scope, $state, $log, $q, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$state = $state;
		this.$log = $log.getInstance(this.constructor.name);
		this.$q = $q;
		this.websocket = websocket;

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$scope.$on('websocket:global:close', (event, msg) => {
			this.$log.debug('$on -> websocket:global:close', msg, this);

			this.isConnected = false;
		});

		this.$scope.$on('websocket:global:connect', (event, msg) => {
			this.$log.debug('$on -> websocket:global:connect', msg, this);

			this.isConnected = true;
		});

		this.wsStatus = this.websocket.getStatus();
		this.isConnected = this.wsStatus === this.websocket.STATUS.OPEN;

		this.$log.debug('$onInit', this);
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
	}

	joinGame() {
		this.$state.go('app.game');
	}
}
