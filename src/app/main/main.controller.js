export class MainController {
	constructor ($scope, $state, $log, $timeout, websocket, utils) {
		'ngInject';

		this.$log = $log;
		this.$scope = $scope;
		this.$state = $state;

		this.activate($timeout);

		this.utils = utils;
		this.websocket = websocket;

		this.websocket.connect();

		this.$log.info('constructor()', this, $scope);
	}

	$onInit() {
		this.$log.info('$onInit()', this);
	}

	activate($timeout) {
		$timeout(() => {
			this.classAnimation = 'rubberBand';
		}, 4000);
	}
}
