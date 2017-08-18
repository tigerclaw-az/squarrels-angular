export class MainController {
	constructor ($scope, $state, $log, $timeout, websocket) {
		'ngInject';

		this.$log = $log;
		this.$scope = $scope;
		this.$state = $state;

		this.activate($timeout);

		this.websocket = websocket;

		this.websocket.connect();

		this.$log.info('constructor()', this, $scope);
	}

	$onInit() {
		this.$log.info('$onInit()', this);

		this.$scope.$on('websocket:message', (event, msg) => {
			let action = msg.data.action;

			this.$log.info('$on -> websocket', msg, action, this);
		});
	}

	activate($timeout) {
		$timeout(() => {
			this.classAnimation = 'rubberBand';
		}, 4000);
	}
}
