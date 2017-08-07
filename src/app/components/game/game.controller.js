export default class GameController {
	constructor($rootScope, $scope, $log, $q, deckStore, decksApi, gamesApi, gameModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;
		this.$q = $q;

		this.deckStore = deckStore;
		this.decksApi = decksApi;
		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playersStore = playersStore;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		let onSuccess = (res => {
				if (res.status === 200) {
					let gameData = res.data[0],
						drawDeck = gameData.decks[0],
						hoardDeck = gameData.decks[1];

					this.gameModel.update(gameData);

					this.$scope.drawDeckId = drawDeck;
					this.$scope.hoardDeckId = hoardDeck;

					this.updateDeck(drawDeck);
					this.updateDeck(hoardDeck);
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		this.$scope.isGameStarted = false;
		this.$scope.canStartGame = true;

		this.$scope.model = this.gameModel.model;
		this.$scope.playersModel = this.playersStore.model;

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', (event, data) => {
			this.$log.info('$on -> websocket:games:create', data);
			this.gameModel.update(data);
		});

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:decks:update', (event, data) => {
			this.$log.info('$on -> websocket:decks:update', data);

			if (data.id) {
				this.deckStore.update(data.id, data);
			}
		});

		this.gamesApi
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
		var playersData = this.playersStore.get(),
			players = [],
			onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 201) {
					let gameData = res.data;

					this.$scope.isGameStarted = true;
					this.$scope.drawDeckId = gameData.decks[0];
					this.$scope.hoardDeckId = gameData.decks[1];

					// Will only fire for the client that clicked 'New Game'
					this.gameModel.update(gameData);

					this
						.updateDeck(gameData.decks[0])
						.then((deck) => {
							if (deck.type === 'main') {
								this.deckStore.dealCards();
							}
						});
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

	updateDeck(id) {
		var deckPromise = this.$q.defer(),
			onSuccessDeck = (res => {
				this.$log.info('onSuccessDeck()', res, this);

				if (res.status === 200) {
					let deckData = res.data[0];

					this.deckStore.insert(
						Object.assign({
								deckType: deckData.type
							}, deckData
						)
					);

					deckPromise.resolve(deckData);
				}
			}),
			onErrorDeck = (res => {
				this.$log.error(res);

				deckPromise.reject(res);
			});

		this.decksApi
			.get(id)
			.then(onSuccessDeck, onErrorDeck);

		return deckPromise;
	}
};
