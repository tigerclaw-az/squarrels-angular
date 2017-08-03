export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, utils, websocket, playersApi, playersStore, playerModel) {
		'ngInject';

		var self = this;

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this.utils = utils;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var self = this,
			currentPlayer = this.$localStorage.player,
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, currentPlayer, this);

				if (res.status === 200) {
					this.playersStore.model.players = res.data;

					this.$log.info('players', this.playersStore.model.players);

					if (currentPlayer) {
						this.playersStore.whoami();
					}
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		this.$scope.playerData = this.playerModel.model;
		this.$scope.model = this.playersStore.model;

		this.$rootScope.$on('websocket', (event, data) => {
			this.$log.info('$on -> websocket', data);
		});

		this.$rootScope.$on('websocket:players:create', ((event, data) => {
			let currentPlayer = this.playerModel.model.player;

			this.$log.info('$on -> websocket:players:create', data);

			if (!currentPlayer || currentPlayer.id !== data.id) {
				this.playersStore.insert(data);
			}
		}));

		this.$rootScope.$on('websocket:players:update', ((event, data) => {
			this.$log.info('$on -> websocket:players:update', data);

			this.playersStore.update(data.id, data);
		}));

		this.$rootScope.$on('websocket:players:whoami', ((event, data) => {
			this.$log.info('$on -> websocket:players:whoami', data);

			if (data.length && data[0].id === currentPlayer.id) {
				this.playerModel.insert(data[0]);
			}
		}));

		this.playersApi
			.get()
			.then(onSuccess, onError);

		this.$log.info('$onInit()', currentPlayer, this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	create() {
		var data = {
				name: this.utils.getRandomStr(8)
				// img will be set to default on server
			},
			canvas = angular.element('<canvas/>')[0],
			ctx = canvas.getContext('2d'),
			video = this.$scope.webcam.video,
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 201) {
					this.playerModel.insert(res.data);
					this.playersStore.insert(res.data);
					this.playersStore.whoami();
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		canvas.width = 120;
		canvas.height = 120;

		if (video) {
			ctx.drawImage(video, 0, 0, 120, 120);
			data.img = canvas.toDataURL();
		}

		this.playersApi
			.update(data)
			.then(onSuccess, onError);
	}
};
