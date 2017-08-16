export default class PlayersStoreService {
	constructor($log, $http, $localStorage, toastr, _, websocket, playersApi, playerModel) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.toastr = toastr;
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
		let pl = Object.assign({}, {
			isCurrent: false
		}, data);

		this.$log.info('insert()', pl, this);

		this.model.players.push(pl);
	}

	hasActionCard() {
		return this._.find(this.model.players, 'actionCard');
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

	handleActionCard(card) {
		let player = this.playerModel.model.player;

		this.$log.info('handleActionCard()', card, player, this);
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

		this.$log.info('update()', id, data, player, this);

		if (player.isCurrent) {
			this.playerModel.update(data);
		}

		if (!this._.isEmpty(data.actionCard)) {
			this.toastr.warning('ACTION CARD!');

			this.handleActionCard(data.actionCard);
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
