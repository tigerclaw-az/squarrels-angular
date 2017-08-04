export default class GameController {
	constructor($rootScope, $scope, $log, deckStore, decksApi, gamesApi, gameModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.deckStore = deckStore;
		this.decksApi = decksApi;
		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playersStore = playersStore;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		this.$scope.isGameStarted = false;
		this.$scope.canStartGame = true;

		this.$scope.model = this.gameModel.model;
		this.$scope.playersModel = this.playersStore.model;

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', (event, data) => {
			this.$log.info('$on -> websocket:games:create', data);
			this.gameModel.update(data);
		});

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	create() {
		var playersData = this.playersStore.get(),
			players = [],
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 201) {
					let gameData = res.data,
						onSuccessDeck = (res) => {
						this.$log.info('onSuccessDeck()', res, this);

						if (res.status === 200) {
							let deckData = res.data[0];

							this.deckStore.insert(
								Object.assign({
										deckType: deckData.type,
									}, deckData
								)
							);

							if (deckData.type === 'main') {
								this.deckStore.dealCards();
							}
						}
					},
					onErrorDeck = (res) => {
						this.$log.error(res);
					};

					this.$scope.isGameStarted = true;

					// Will only fire for the client that clicked 'New Game'
					this.gameModel.update(gameData);

					this.decksApi
						.get(gameData.decks[0])
						.then(onSuccessDeck, onErrorDeck);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		_.forEach(playersData, function(obj) {
			players.push(obj.id);
		});

		this.$scope.canStartGame = false;

		this.gamesApi
			.update(players)
			.then(onSuccess, onError);
	}
};
