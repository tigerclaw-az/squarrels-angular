export class MainController {
	constructor ($scope, $state, $log, $timeout, websocket) {
		'ngInject';

		this.$log = $log;
		this.$scope = $scope;
		this.$state = $state;

		this.activate($timeout);

		this.websocket = websocket;

		this.websocket.connect();

		this.$log.debug('constructor()', this, $scope);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);

		this.$scope.$on('websocket:message', (event, msg) => {
			let action = msg.data.action;

			this.$log.info('$on -> websocket', msg, action, this);
		});

		this.$scope.$on('websocket:global:connect', (event, msg) => {
			this.$log.info('$on -> websocket:global:connect', msg, this);

			this.$state.go('app.game');
		});

		this.$scope.$on('websocket:global:close', (event, msg) => {
			// let action = msg.data.action;

			this.$log.info('$on -> websocket:global:close', msg, this);

			this.$state.go('app.start');
		});
	}

	activate($timeout) {
		$timeout(() => {
			this.classAnimation = 'rubberBand';
		}, 4000);
	}
}
