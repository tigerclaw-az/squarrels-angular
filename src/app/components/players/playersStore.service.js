export default class PlayersStoreService {
	constructor($rootScope, $log, $localStorage, $q, $timeout, toastr, _, websocket, gamesApi, playersApi, playerModel) {
		'ngInject';

		this.$localStorage = $localStorage;
		this.$log = $log.getInstance(this.constructor.name);
		this.$rootScope = $rootScope;
		this.$q = $q;
		this.$timeout = $timeout;

		this._ = _;
		this.toastr = toastr;

		this.gamesApi = gamesApi;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.ws = websocket;

		this.model = {
			players: []
		};

		this.quarrelCards = [];
		this.totalQuarrelPlayers = 0;

		this.$log.debug('constructor()', this);
	}

	addQuarrelCard(id, card) {
		let player = this.get('id', id),
			playersQuarrel;

		player.quarrel = card;
		playersQuarrel = this.get('quarrel', null, false, true);

		this.$log.debug('addQuarrelCard()', player, playersQuarrel);

		// All players have selected a card
		if (playersQuarrel.length === this.totalQuarrelPlayers) {
			this.calcQuarrel(playersQuarrel);
		}
	}

	calcQuarrel(players) {
		let playedCards = this._.map(players, 'quarrel'),
			playerGroups = this._.groupBy(players, pl => {
				let card = pl.quarrel;

				return card.name === 'golden' ? 6 : card.amount;
			}),
			winningCard = this._.max(this._.keys(playerGroups)),
			winners = playerGroups[winningCard],
			winnerDefer = this.$q.defer();

		this.$log.debug('calcQuarrel()', playerGroups, winners, this);

		// All players had empty hands, therefore no quarrel winner
		if (!winners.length) {
			this.update({ quarrel: null, showQuarrel: false });
			this.$rootScope.$broadcast('game:action:quarrel');

			return false;
		}

		this.quarrelCards = this._.union(this.quarrelCards, playedCards);
		this.update({ showQuarrel: true });

		// FIXME: Should happen after transition of card flip is finished
		this.$timeout(() => {
			if (winners.length === 1) {
				winnerDefer.resolve(winners[0]);
			} else {
				winnerDefer.reject(winners);
			}
		}, 3000);

		winnerDefer.promise
			.then(winner => {
				this.update(winner.id, { isQuarrelWinner: true });

				this.$timeout(() => {
					let cards =
						this._(this._.map(this.quarrelCards, 'id'))
							.compact()
							.value();

					this.$log.debug('winner cards ->', cards);

					this.update({ isQuarrelWinner: false });

					if (this.playerModel.isActive()) {
						this.playersApi
							.update(winner.id, { cardsInHand: cards, addCards: true })
							.then(() => {
								this.$rootScope.$broadcast('game:action:quarrel');
							}, err => {
								this.$log.error(err);
							});
					}

					this.quarrelCards = [];
					this.update({ quarrel: null, showQuarrel: false });
				}, 2500);
			})
			.catch(tiedPlayers => {
				this.totalQuarrelPlayers = tiedPlayers.length;
				this._.forEach(tiedPlayers, pl => {
					this.update(pl.id, { quarrel: null, isQuarrel: true, showQuarrel: false });
				});
			});
	}

	get(prop, value, index = false, all = false) {
		this.$log.debug('get()', prop, value, index, this);

		let method = index ? 'findIndex' : all ? 'filter' : 'find';

		if (prop) {
			if (value) {
				return this._[method](this.model.players, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return this._[method](this.model.players, prop);
		}

		return this.model.players;
	}

	getNextPlayer(activeIndex) {
		this.$log.debug('getNextPlayer()', activeIndex, this);

		if (activeIndex === -1) {
			return this._.sample(this.model.players).id;
		} else if (activeIndex === this.model.players.length - 1) {
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return this.model.players[activeIndex].id;
	}

	insert(data) {
		let pl = Object.assign({}, {
				isCurrent: false
			}, data),
			existingPlayer = this._.some(this.model.players, { id: pl.id });

		this.$log.debug('insert()', pl, existingPlayer, this);

		// Ensure that player doesn't already exist
		if (!existingPlayer) {
			this.model.players.push(pl);

			if (data.isCurrent) {
				this.playerModel.insert(pl);
			}
		}
	}

	nextPlayer(index) {
		let activePlayerIndex = index || this.get('isActive', true, true),
			nextPlayerId = this.getNextPlayer(activePlayerIndex),
			onSuccess = (res => {
				// Merge data with existing object of player
				if (res.status === 200) {
					this.update(res.data.id, res.data);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			activePlayer;

		this.$log.debug('nextPlayer()', index, activePlayerIndex, nextPlayerId, this);

		if (activePlayerIndex !== -1) {
			activePlayer = this.model.players[activePlayerIndex];

			this.playersApi
				.update(activePlayer.id, { isActive: false })
				.then(onSuccess, onError);
		}

		this.playersApi
			.update(nextPlayerId, { isActive: true, isFirstTurn: true })
			.then(onSuccess, onError);
	}

	update(id, data) {
		if (!data && this._.isObject(id)) {
			let data = id;

			this._.forEach(this.model.players, pl => {
				this.update(pl.id, data);
			});

			return this.model.players;
		}

		// Find the player with given id to update
		let player = this.get('id', id);

		Object.assign(player, data);

		this.$log.debug('update()', id, data, player, this);

		if (player.isCurrent) {
			this.playerModel.update(data);
		}

		return player;
	}

	// Send a request to get the current player's private data
	// DO NOT move into playerController as it would be called everytime
	// a new player is added
	whoami() {
		this.$log.debug('whoami()', this);

		this.ws.send({ action: 'whoami' });
	}
}
