export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, toastr, _, utils, websocket, playersApi, playersStore, playerModel) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this._ = _;
		this.utils = utils;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
		this.toastr = toastr;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var onSuccess = (res => {
				let playerStorage = this.$localStorage.player;

				this.$log.info('onSuccess()', res, playerStorage, this);

				if (res.status === 200) {
					if (playerStorage) {
						this.playersStore.whoami();
					}

					_.forEach(res.data, (pl) => {
						this.playersStore.insert(pl);
					});

					this.$log.info('players', this.playersStore.model.players);
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

			if (this._.isEmpty(currentPlayer) || currentPlayer.id !== data.id) {
				this.playersStore.insert(data);
			}
		}));

		this.$rootScope.$on('websocket:players:update', ((event, data) => {
			this.$log.info('$on -> websocket:players:update', data);

			this.playersStore.update(data.id, data);
			this.playersStore.whoami();
		}));

		this.$rootScope.$on('websocket:players:whoami', ((event, data) => {
			let playerStorage = this.$localStorage.player;

			this.$log.info('$on -> websocket:players:whoami', data);

			if (data.length && data[0].id === playerStorage.id) {
				let player = data[0];

				if (this._.isEmpty(this.playerModel.player)) {
					this.playerModel.insert(player);
					player = this.playerModel.model.player;
				}

				this.playersStore.update(player.id, player);
			}
		}));

		this.playersApi
			.get()
			.then(onSuccess, onError);

		this.$log.info('$onInit()', this);
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
					let player = res.data;

					this.playerModel.insert(player);
					this.playersStore.insert(player);
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
			.create(data)
			.then(onSuccess, onError);
	}
}
