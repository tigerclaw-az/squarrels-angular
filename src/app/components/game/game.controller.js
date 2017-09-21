export default class GameController {
	constructor($rootScope, $scope, $state, $log, $q, $timeout, toastr, _, sounds, deckStore, decksApi, gamesApi, gameModel, playerModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$state = $state;
		this.$log = $log.getInstance(this.constructor.name);
		this.$q = $q;
		this.$timeout = $timeout;

		// ???
		this.mainCtrl = this.$scope.$parent.$parent.mainCtrl;
		this.ws = this.mainCtrl.websocket;

		this._ = _;
		this.toastr = toastr;
		this.sounds = sounds;

		this.deckStore = deckStore;
		this.decksApi = decksApi;
		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playerModel = playerModel;
		this.playersStore = playersStore;

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		let onSuccess = (res => {
				this.$log.debug('onSuccess()', res, this);

				if (res.status === 200) {
					let gameData = res.data[0],
						decks = gameData.decks;

					this.gameModel.update(gameData);

					decks.forEach(deck => {
						this.insertDeck(deck);
					});
				}
			}),
			onError = (res => {
				this.$log.error(res);
			});

		this.isAdmin = this.mainCtrl.isAdmin;

		this.$scope.model = this.gameModel.getByProp();
		this.$scope.playersModel = this.playersStore.model;

		this.$rootScope.$on('deck:action:winter', () => {
			this.gameModel.endGame();
		});

		this.$rootScope.$on('game:action:quarrel', () => {
			let gameId = this.gameModel.model.id;

			this.gamesApi.actionCard(gameId, null);
		});

		// Should only fire for external clients
		this.$rootScope.$on('websocket:decks:create', (event, data) => {
			this.$log.debug('$on -> websocket:decks:create', data);

			this.insertDeck(data.id, data);
		});

		// Will fire for ALL clients
		this.$rootScope.$on('websocket:decks:update', (event, data) => {
			this.$log.debug('$on -> websocket:decks:update', data);

			if (data.id) {
				this.deckStore.update(data.id, data);
			}
		});

		this.$rootScope.$on('websocket:decks:remove', (event, data) => {
			this.$log.debug('$on -> websocket:decks:remove', data);

			this.deckStore.empty();
		});

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', (event, data) => {
			this.$log.debug('$on -> websocket:games:create', data);
			this.gameModel.update(data);
		});

		this.$rootScope.$on('websocket:games:update', (event, data) => {
			this.$log.debug('$on -> websocket:games:update', data);

			if (data.actionCard && !this.gameModel.getByProp('actionCard')) {
				let card = data.actionCard;

				this.handleActionCard(card);
			}

			this.gameModel.update(data);
		});

		this.$rootScope.$on('websocket:games:remove', (event, data) => {
			this.$log.debug('$on -> websocket:games:remove', data);
			this.gameModel.clear(data);
		});

		this.gameModel
			.get()
			.then(onSuccess, onError);

		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
	}

	/**
	 * TEMPORARY
	 * Resets the current game
	 */
	reset() {
		if (this.gameModel.model.id) {
			this.gamesApi
				.remove(this.gameModel.model.id);
		}
	}

	create() {
		var playersData = this.playersStore.get(),
			players = [],
			onSuccess = (res => {
				if (res.status === 201) {
					let gameData = res.data,
						decks = gameData.decks,
						deckUpdates = [];

					// Will only fire for the client that clicked 'New Game'
					this.gameModel.update(gameData);

					decks.forEach(deck => {
						deckUpdates.push(this.insertDeck(deck));
					});

					this.$q.all(deckUpdates)
						.then(deck => {
							this.$log.debug('decksApi:update()', deck);

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

		this.reset();

		_.forEach(playersData, function(obj) {
			players.push(obj.id);
		});

		this.gamesApi
			.create(players)
			.then(onSuccess, onError);
	}

	dealCards() {
		let dealPromises = [];

		_.forEach(this.playersStore.get(), (pl) => {
			// Loop through each player and draw random set of cards, which will
			// return a promise so we can wait for all cards to be dealt before
			// the round starts.
			dealPromises.push(this.deckStore.dealCards(pl));
		});

		this.$q
			.all(dealPromises)
			.then(() => {
				// After all cards have been dealt, set the starting player
				this.playersStore.nextPlayer(-1);
			})
			.catch(err => {
				this.$log.error(err);
				this.toastr.error('Problem dealing cards', err);
			});
	}

	getDecks() {
		let decks = this._.orderBy(this.deckStore.get(), ['deckType'], ['desc']);

		return decks;
	}

	handleActionCard(card) {
		let actionDeck = this.deckStore.getByType('action'),
			actionCards = actionDeck.cards.map(card => {
				return card.id;
			}),
			hoardDeck = this.deckStore.getByType('discard'),
			gameId = this.gameModel.model.id,
			timeout = 4000;

		this.sounds.play('action-card');

		// Show action card immediately if there aren't any cards to 'hoard'
		if (!hoardDeck.cards.length) {
			timeout = 0;
			this.gameModel.update({ instantAction: true });
		}

		switch (card.action) {
			case 'ambush':
				if (this.playerModel.isActive()) {
					this.$timeout(() => {
						this.ws.send({
							action: 'ambush',
							gameId: this.gameModel.model.id
						});
					}, timeout);
				}
				break;

			case 'hoard':
				if (!hoardDeck.cards.length) {
					this.toastr.info('No cards to Hoard');
					this.gamesApi.actionCard(gameId, null);
				}

				break;

			case 'quarrel':
				this.$timeout(() => {
					this.ws.send({
						action: 'quarrel',
						gameId: this.gameModel.model.id
					});
				}, timeout);
				break;

			case 'whirlwind':
				if (this.playerModel.isActive()) {
					this.$timeout(() => {
						this.ws.send({
							action: 'whirlwind',
							gameId: this.gameModel.model.id
						});
					}, timeout);
				}
				break;

			case 'winter':
				this.$rootScope.$broadcast('deck:action:winter');
				break;

			default:
				this.gamesApi.actionCard(gameId, null);
				timeout = 0;
				break;
		}

		if (!this._.includes(actionCards, card.id)) {
			actionCards.push(card.id);

			this.$timeout(() => {
				this.gameModel.update({ instantAction: false });

				this.decksApi
					.update(actionDeck.id, { cards: actionCards })
					.then(res => {
						this.$log.debug('decks:update()', res);
					}, err => {
						this.$log.error(err);
					});
			}, timeout);
		}
	}

	insertDeck(id) {
		var deckPromise = this.$q.defer(),
			onSuccessDeck = (res => {
				let game = this.gameModel.getByProp();

				this.$log.debug('onSuccessDeck()', res, this);

				if (res.status === 200) {
					let deckData = res.data[0];

					this.deckStore.insert(deckData);

					if (deckData.deckType === 'action' && game.actionCard) {
						this.handleActionCard(game.actionCard);
					}

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

	isGameStarted() {
		return this.gameModel.isGameStarted();
	}
}
