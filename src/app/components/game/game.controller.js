export default class GameController {
	constructor($rootScope, $scope, $log, $q, deckStore, decksApi, gamesApi, gameModel, playerModel, playersApi, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;
		this.$q = $q;

		this.deckStore = deckStore;
		this.decksApi = decksApi;
		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		let onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					let gameData = res.data[0],
						drawDeck = gameData.decks[0],
						hoardDeck = gameData.decks[1];

					this.gameModel.update(gameData);

					this.insertDeck(drawDeck);
					this.insertDeck(hoardDeck);
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		// FIXME: This won't work when starting new game
		this.$scope.decks = this.deckStore.model.deck;
		this.$scope.model = this.gameModel.model;
		this.$scope.playersModel = this.playersStore.model;

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', (event, data) => {
			this.$log.info('$on -> websocket:games:create', data);
			this.gameModel.update(data);
		});

		// Should only fire for external clients
		this.$rootScope.$on('websocket:decks:create', (event, data) => {
			this.$log.info('$on -> websocket:decks:create', data);

			this.insertDeck(data.id, data);
		});

		// Will fire for ALL clients
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

	/**
	 * TEMPORARY
	 * Resets the current game
	 */
	reset() {
		this.gamesApi
			.remove(this.gameModel.model.game.id)
			.then(() => {
				window.location.reload();
			});
	}

	create() {
		var playersData = this.playersStore.get(),
			players = [],
			onSuccess = (res => {
				this.$log.info('create:onSuccess()', res, this);

				if (res.status === 201) {
					let gameData = res.data,
						deckUpdates = [];

					// Will only fire for the client that clicked 'New Game'
					this.gameModel.update(gameData);

					deckUpdates.push(this.insertDeck(gameData.decks[0]));
					deckUpdates.push(this.insertDeck(gameData.decks[1]));

					this.$q.all(deckUpdates)
						.then(deck => {
							this.$log.info('decksApi:update()', deck);

							this.dealCards();
						})
						.catch(err => {
							this.$log.error(err);
						});
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		_.forEach(playersData, function(obj) {
			players.push(obj.id);
		});

		this.gamesApi
			.create(players)
			.then(onSuccess, onError);
	}

	dealCards() {
		let dealPromises = [];

		this.$log.info('dealCards()', this);

		_.forEach(this.playersStore.model.players, (pl) => {
			// FIXME: This won't work because of track by $index, need to update values in the array
			// let blankCards = Array.apply(null, Array(7)).map(() => { return null; });

			// Give each player a set of blank cards until the actual cards are dealt
			// this.playersApi
			// 	.update(pl.id, { cardsInHand: blankCards })
			// 	.then(() => {

			// 	})
			// 	.catch(err => {
			// 		this.$log.error(err);
			// 	});
			// 	END: FIXME

			// Loop through each player and draw random set of cards, which will
			// return a promise so we can wait for all cards to be dealt before
			// the round starts.
			dealPromises.push(this.deckStore.drawCard(pl, this.playerModel.numDrawCards));
		});

		this.$q
			.all(dealPromises)
			.then(() => {
				// After all cards have been dealt, set the starting player
				this.playersStore.nextPlayer(-1);
			})
			.catch(err => {
				this.$log.info('ERROR:', err);
				this.toastr.error('Problem dealing cards', err);
			});
	}

	insertDeck(id) {
		var deckPromise = this.$q.defer(),
			onSuccessDeck = (res => {
				this.$log.info('onSuccessDeck()', res, this);

				if (res.status === 200) {
					let deckData = res.data[0];

					this.deckStore.insert(deckData);

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

		return deckPromise.promise;
	}
}
