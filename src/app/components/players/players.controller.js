export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, toastr, _, utils, sounds, decksApi, deckStore, playersApi, playersStore, playerModel) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;
		this.utils = utils;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.sounds = sounds;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.newTurn = false;

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		var onSuccess = (res => {
				let playerStorage = this.$localStorage.player;

				this.$log.debug('onSuccess()', res, playerStorage, this);

				if (res.status === 200) {
					if (playerStorage) {
						this.playersStore.whoami();
					}

					_.forEach(res.data, (pl) => {
						this.playersStore.insert(pl);
					});

					this.$log.debug('players', this.playersStore.model.players);
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		this.$scope.playerData = this.playerModel.model;
		this.$scope.model = this.playersStore.model;

		// This is triggered when a player tries to click the 'Hoard' pile after
		// another player has already collected it
		this.$rootScope.$on('websocket:player:hoard', ((event, data) => {
			this.$log.info('$on -> websocket:player:hoard', data);

			this.toastr.error('NO HOARD FOR YOU!');
		}));

		this.$rootScope.$on('websocket:players:create', ((event, data) => {
			let currentPlayer = this.playerModel.model.player;

			this.$log.info('$on -> websocket:players:create', data);

			if (this._.isEmpty(currentPlayer) || currentPlayer.id !== data.id) {
				this.playersStore.insert(data);
			}
		}));

		// This is triggered when a player successfully collected the 'Hoard' pile
		this.$rootScope.$on('websocket:players:hoard', ((event, data) => {
			let currentPlayer = this.playerModel.model.player,
				onSuccess = (data => {
					this.$log.debug('onSuccess()', data, this);
				}),
				onError = (err => {
					this.$log.error(err);
				}),
				playerCards = currentPlayer.cardsInHand,
				hoardDeck = this.deckStore.getByType('discard'),
				cards = [];

			this.$log.info('$on -> websocket:players:hoard', data);

			cards = this._.union(playerCards, hoardDeck.cards);

			let playerObj = {
				cardsInHand: cards,
				totalCards: cards.length
			};

			if (data.id === currentPlayer.id) {
				this.decksApi
					.update(hoardDeck.id, { cards: [] })
					.then(() => { }, () => { });

				this.playersApi
					.update(currentPlayer.id, playerObj)
					.then(onSuccess, onError);
			} else {
				this.toastr.warning(data.name, 'HOARD TAKEN BY:');
			}
		}));

		this.$rootScope.$on('websocket:players:update', ((event, data) => {
			this.$log.info('$on -> websocket:players:update', data);

			if (data.id) {
				this.playersStore.update(data.id, data);
			}

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

				// If the player's turn changed to 'active', play sound
				if (player.isActive !== this.newTurn) {
					this.newTurn = player.isActive;

					if (player.isActive) {
						this.sounds.play('active-player');
					}
				}

				this.playersStore.update(player.id, player);
			}
		}));

		this.playersApi
			.get()
			.then(onSuccess, onError);

		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.debug('destroy', this);
		};
	}

	create(data) {
		var canvas = angular.element('<canvas/>')[0],
			ctx = canvas.getContext('2d'),
			playerDefaults = {
				name: this.utils.getRandomStr(12)
				// img will be set to default on server
			},
			video = this.$scope.webcam.video,
			onSuccess = (res => {
				this.$log.debug('onSuccess()', res, this);

				if (res.status === 201) {
					let player = res.data;

					this.playerModel.insert(player);
					this.playersStore.insert(player);
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		this.$log.debug('create()', data, this);

		let plData = Object.assign({}, playerDefaults, data);

		canvas.width = 120;
		canvas.height = 120;

		if (video) {
			ctx.drawImage(video, 0, 0, 120, 120);
			data.img = canvas.toDataURL();
		}

		this.playersApi
			.create(plData)
			.then(onSuccess, onError);
	}
}
