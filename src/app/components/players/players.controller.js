export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, utils, websocket, playersStore, playerModel) {
		'ngInject';

		var self = this;

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this.utils = utils;
		this.playerModel = playerModel;
		this.playersStore = playersStore;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var self = this;

		this.$scope.playerData = this.playerModel.model;
		this.$scope.model = this.playersStore.model;

		this.$rootScope.$on('websocket', function(event, data) {
			self.$log.info('$on -> websocket', data);
		});

		this.$rootScope.$on('websocket:player:create', function(event, data) {
			self.$log.info('$on -> websocket:player:create', data);
			self.playersStore.update('add', data);
		});

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	create() {
		var data = {
				name: this.utils.getRandomStr(8),
				img: 'http://www.fillmurray.com/120/120'
			},
			canvas = angular.element('<canvas/>')[0],
			ctx = canvas.getContext('2d'),
			video = this.$scope.webcam.video;

		canvas.width = 120;
		canvas.height = 120;

		if (video) {
			ctx.drawImage(video, 0, 0, 120, 120);
			data.img = canvas.toDataURL();
		}

		this.playersStore.insert(data);
	}
};
