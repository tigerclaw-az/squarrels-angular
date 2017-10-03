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
						decks = gameData.decks,
						decksPromise = [];

					this.gameModel.update(gameData);

					decks.forEach(deck => {
						decksPromise.push(this.insertDeck(deck));
					});

					this.$q
						.all(decksPromise)
						.then(() => {
							let game = this.gameModel.getByProp();

							if (game.actionCard) {
								this.handleActionCard(game.actionCard);
							}
						});
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.isAdmin = this.mainCtrl.isAdmin;
		this.isSoundEnabled = this.sounds.enabled;

		this.$scope.model = this.gameModel.getByProp();
		this.$scope.playersModel = this.playersStore.model;

		this.$rootScope.$on('deck:action:winter', () => {
			this.$timeout(() => {
				this.displayWinter();
			}, 1);

			this.gameModel.endGame();
		});

		this.$rootScope.$on('game:action:quarrel', () => {
			let gameId = this.gameModel.getByProp('id');

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
			} else {
				data.instantAction = false;
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

	displayWinter() {
		var flakes = [],
			canvas = angular.element(document.querySelector('.winter-snow'))[0],
			ctx = canvas.getContext('2d'),
			flakeCount = 400,
			mX = -100,
			mY = -100,
			init = () => {
				for (let i = 0; i < flakeCount; i++) {
					let x = Math.floor(Math.random() * canvas.width),
						y = Math.floor(Math.random() * canvas.height),
						size = (Math.random() * 3) + 2,
						speed = (Math.random() * 1) + 0.5,
						opacity = (Math.random() * 0.5) + 0.3;

					flakes.push({
						speed: speed,
						velY: speed,
						velX: 0,
						x: x,
						y: y,
						size: size,
						stepSize: (Math.random()) / 30,
						step: 0,
						opacity: opacity
					});
				}

				startAnimation();
			},
			reset = (flake) => {
				flake.x = Math.floor(Math.random() * canvas.width);
				flake.y = 0;
				flake.size = (Math.random() * 3) + 2;
				flake.speed = (Math.random() * 1) + 0.5;
				flake.velY = flake.speed;
				flake.velX = 0;
				flake.opacity = (Math.random() * 0.5) + 0.3;
			},
			startAnimation = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				for (let i = 0; i < flakeCount; i++) {
					let flake = flakes[i],
						x = mX,
						y = mY,
						minDist = 150,
						x2 = flake.x,
						y2 = flake.y,
						dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));

					if (dist < minDist) {
						let force = minDist / (dist * dist),
							xcomp = (x - x2) / dist,
							ycomp = (y - y2) / dist,
							deltaV = force / 2;

						flake.velX -= deltaV * xcomp;
						flake.velY -= deltaV * ycomp;

					} else {
						flake.velX *= .98;

						if (flake.velY <= flake.speed) {
							flake.velY = flake.speed
						}

						flake.velX += Math.cos(flake.step += .05) * flake.stepSize;
					}

					ctx.fillStyle = 'rgba(255,255,255,' + flake.opacity + ')';
					flake.y += flake.velY;
					flake.x += flake.velX;

					if (flake.y >= canvas.height || flake.y <= 0) {
						reset(flake);
					}


					if (flake.x >= canvas.width || flake.x <= 0) {
						reset(flake);
					}

					ctx.beginPath();
					ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
					ctx.fill();
				}

				window.requestAnimationFrame(startAnimation);
			};

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight - 3;

		canvas.addEventListener('mousemove', function(e) {
			mX = e.clientX,
			mY = e.clientY
		});

		window.addEventListener('resize',function(){
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		})

		init();
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
			gameId = this.gameModel.getByProp('id'),
			timeout = 3100;

		this.sounds.play('action-card');

		// Show action card immediately if there aren't any cards to 'hoard'
		if (!hoardDeck.cards.length) {
			timeout = 300;
			this.gameModel.update({ instantAction: true });
		}

		switch (card.action) {
			case 'ambush':
				if (this.playerModel.isActive()) {
					this.$timeout(() => {
						this.ws.send({
							action: 'ambush',
							gameId: gameId
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
						gameId: gameId
					});
				}, timeout);
				break;

			case 'whirlwind':
				if (this.playerModel.isActive()) {
					this.$timeout(() => {
						this.ws.send({
							action: 'whirlwind',
							gameId: gameId
						});
					}, timeout);
				}
				break;

			case 'winter':
				timeout = 500;
				break;

			default:
				this.gamesApi.actionCard(gameId, null);
				timeout = 0;
				break;
		}

		if (!this._.includes(actionCards, card.id)) {
			actionCards.push(card.id);

			this.$timeout(() => {
				this.decksApi
					.update(actionDeck.id, { cards: actionCards })
					.then(res => {
						if (card.action === 'winter') {
							this.$rootScope.$broadcast('deck:action:winter');
						}

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
				this.$log.debug('onSuccessDeck()', res, this);

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

	isGameStarted() {
		return this.gameModel.getByProp('isGameStarted');
	}

	onAdminOption(evt) {
		let $el = angular.element(evt.target),
			option = $el.attr('data-option');

		this.$log.debug('onAdminOption()', evt, option);

		switch (option) {
			case 'reset-game':
				this.reset();
				break;

			case 'skip-player':
				this.playersStore.nextPlayer();
				break;
		}

		evt.preventDefault();
	}

	onSettingClick(evt) {
		let $el = angular.element(evt.target);

		if (!$el.attr('data-setting')) {
			$el = $el.parent();
		}

		let setting = $el.attr('data-setting');

		this.$log.debug('onSettingClick()', evt, setting);

		switch(setting) {
			case 'toggle-sound':
				this.sounds.toggle();
				this.isSoundEnabled = this.sounds.enabled;
				break;
		}

		evt.preventDefault();
	}

	/**
	 * Resets the current game
	 */
	reset() {
		let gameId = this.gameModel.getByProp('id');

		this.$log.debug('reset()', this.gameModel, this);

		if (gameId) {
			this.gamesApi
				.remove(gameId)
				.then(() => {
					this.toastr.info('Game reset successfully');
				}, err => {
					this.toastr.error('Unable to reset game');
					this.$log.error(err);
				});
		}
	}
}
