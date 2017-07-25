export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, playersModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this.playersModel = playersModel;
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

	newPlayer() {
		var self = this;

		this.playersModel.newPlayer();
	}
};
