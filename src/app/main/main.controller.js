export class MainController {
	constructor ($scope, $state, $localStorage, $log, $timeout, appConfig, websocket) {
		'ngInject';

		this.$scope = $scope;
		this.$state = $state;
		this.$localStorage = $localStorage;
		this.$log = $log.getInstance(this.constructor.name);

		this.appConfig = appConfig;
		this.websocket = websocket;

		this.activate();

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

		// WebSocket heartbeat
		// window.setInterval(() => {
		// 	let status = this.websocket.getStatus();

		// 	this.$log.info('websocket:status -> ', status);
		// }, 500);
	}

	activate() {
		if (this.$localStorage.appConfig) {
			Object.assign(this.appConfig, this.$localStorage.appConfig);
		}

		this.isAdmin = this.appConfig.isAdmin;
	}
}
