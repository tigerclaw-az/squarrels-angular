export
default class PlayerController {
	constructor($rootScope, $scope, $localStorage, $log, playersStore, playerModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.playerModel = playerModel;
		this.playersStore = playersStore;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var self = this;

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}
};
