export default class PlayersStoreService {
	constructor($rootScope, $log, $localStorage, toastr, _, websocket, playersApi, playerModel) {
		'ngInject';

		this.$localStorage = $localStorage;
		this.$log = $log.getInstance(this.constructor.name);
		this.$rootScope = $rootScope;

		this._ = _;
		this.toastr = toastr;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.ws = websocket;

		this.model = {
			players: []
		};

		this.$log.debug('constructor()', this);
	}

	get(prop, value, index = false) {
		this.$log.debug('get()', prop, value, index, this);

		let method = index ? 'findIndex' : 'find';

		if (prop) {
			if (value) {
				return this._[method](this.model.players, function(o) {
					return o[prop] === value;
				});
			}

			// If a 'value' wasn't given, then we're just looking for the player
			// where the supplied 'prop' is !null/undefined
			return this._.find(this.model.players, prop);
		}

		return this.model.players;
	}

	getNextPlayer(activeIndex) {
		this.$log.debug('nextPlayer()', activeIndex, this);

		if (activeIndex === -1) {
			return _.sample(this.model.players).id;
		} else if (activeIndex === this.model.players.length - 1) {
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return this.model.players[activeIndex].id;
	}

	handleActionCard(card) {
		let player = this.playerModel.model.player;

		this.$log.debug('handleActionCard()', card, player, this);
	}

	insert(data) {
		let pl = Object.assign({}, {
				isCurrent: false
			}, data),
			existingPlayer = this._.some(this.model.players, { id: pl.id });

		this.$log.debug('insert()', pl, existingPlayer, this);

		if (!this._.isEmpty(pl.actionCard)) {
			this.handleActionCard(pl.actionCard);
		}

		// Ensure that player doesn't already exist
		if (!existingPlayer) {
			this.model.players.push(pl);
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
		// Find the index of player to update and modify the object
		let playerIndex = this.get('id', id, true),
			player = this.model.players[playerIndex];

		Object.assign(player, data);
		if (!data.actionCard) {
			player.actionCard = null;
		}

		this.$log.debug('update()', id, data, player, this);

		if (player.isCurrent) {
			this.playerModel.update(data);
		} else if (!this._.isEmpty(data.actionCard)) {
			this.toastr.warning('ACTION CARD!');

			this.handleActionCard(data.actionCard);
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
