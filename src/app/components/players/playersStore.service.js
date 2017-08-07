export default class PlayersStoreService {
	constructor($log, $http, $localStorage, _, websocket, playersApi, playerModel) {
		'ngInject';

		var self = this;

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.ws = websocket;

		this.model = {
			players: []
		};

		this.$log.info('constructor()', this);
	}

	get(prop, value, index = false) {
		this.$log.info('get()', prop, value, index, this);

		let method = index ? 'findIndex' : 'find';

		if (prop) {
			return this._[method](this.model.players, function(o) {
				return o[prop] === value;
			});
		}

		return this.model.players;
	}

	insert(data) {
		this.$log.info('insert()', data, this);

		data.isCurrent = false;
		this.model.players.push(data);
	}

	getNextPlayer(activeIndex) {
		this.$log.info('nextPlayer()', activeIndex, this);

		if (activeIndex === -1) {
			return _.sample(this.model.players).id;
		} else if (activeIndex === this.model.players.length - 1) {
			activeIndex = 0;
		} else {
			activeIndex++;
		}

		return this.model.players[activeIndex].id;
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

		this.$log.info('nextPlayer()', index, activePlayerIndex, nextPlayerId, this);

		if (activePlayerIndex !== -1) {
			activePlayer = this.model.players[activePlayerIndex];
			activePlayer.isActive = false;
			this.update(activePlayer.id, { isActive: false });

			this.playersApi
				.update(activePlayer, activePlayer.id)
				.then(onSuccess, onError);
		}

		this.playersApi
			.update({ isActive: true }, nextPlayerId)
			.then(onSuccess, onError);
	}

	update(id, data) {
		// Find the index of player to update and modify the object
		let playerIndex = this.get('id', id, true),
			player = this.model.players[playerIndex];

		Object.assign(player, data);

		this.$log.info('update()', id, data, player, this);

		if (player.isCurrent) {
			this.playerModel.update(data);
		}

		return player;
	}

	// Send a request to get the current player's private data
	// DO NOT move into playerController as it would be called everytime
	// a new player is added
	whoami() {
		this.$log.info('whoami()', this);

		this.ws.send({ action: 'whoami' });
	}
}
