export
default class PlayersController {
	constructor($rootScope, $scope, $localStorage, $log, toastr, _, utils, cardsApi, deckStore, playersApi, playersStore, playerModel) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$localStorage = $localStorage;
		this.$log = $log;

		this._ = _;
		this.utils = utils;

		this.cardsApi = cardsApi;
		this.deckStore = deckStore;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
		this.toastr = toastr;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var playerStorage = this.$localStorage.player,
			onSuccess = (res => {
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
			this.$log.info('$on -> websocket:players:whoami', data);

			if (data.length && data[0].id === playerStorage.id) {
				let player = data[0];

				if (this._.isEmpty(this.playerModel.player)) {
					this.playerModel.insert(player);
					player = this.playerModel.model.player;
				}

				if (player.score === 0 && !this._.isEmpty(player.cardsInHand) && !this.playerModel.isValidationRunning) {
					this.validateCards();
				}

				if (player.isActive) {
					this.toastr.success('Your Turn!');
				}

				this.playersStore.update(player.id, player);
			}
		}));

		this.playersApi
			.get()
			.then(onSuccess, onError);

		this.$log.info('$onInit()', playerStorage, this);
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

	replaceCards(actionCards) {
		let player = this.playerModel.model.player,
			onRemoveCardsSuccess = (() => {
				this.deckStore
					.drawCard(player, actionCards.length)
					.then(() => {
						// TODO: Insert actionCards back into main deck

						// This shouldn't be needed since it will be run after new cards have
						// been drawn and the 'whoami' call is made
						// this.validateCards();
						this.isValidationRunning = false;
					})
					.catch(err => {
						this.$log.info(err);
					});
			}),
			onRemoveCardsError = (err => {
				this.$log.error(err);
			});

		this.$log.info('actionCards -> ', actionCards);
		this._.pullAll(player.cardsInHand, actionCards);


		this.playersApi
			.update(player.id, { cardsInHand: player.cardsInHand })
			.then(onRemoveCardsSuccess, onRemoveCardsError);

		this.$log.info('cardsInHand -> ', this.playerModel.model.player.cardsInHand);
	}

	validateCards() {
		let player = this.playerModel.model.player,
			cards = player.cardsInHand,
			cardIds = cards.join(','),
			active = player.isActive,
			onSuccess = (res => {
				let cardData = res.data,
					actionCards = this._.reject(cardData, { cardType: 'number' }).map(obj => { return obj.id; });

				this.$log.info('onValidateSuccess()', cardData, this);

				if (actionCards.length) {
					this.replaceCards(actionCards);
				} else {
					// Return player to previous 'active' state
					this.playersStore.update(player.id, { isActive: active });
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.info('validateCards()', cards, active);

		// Disable any actions the player could do until cards have been validated
		this.playersStore.update(player.id, { isActive: false });

		if (cards[0]) {
			this.isValidationRunning = true;
			this.cardsApi
				.get(cardIds)
				.then(onSuccess, onError);
		}
	}
}
