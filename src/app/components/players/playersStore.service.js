export class PlayersStoreService {
	constructor($log, $http, $localStorage, _, playersApi, websocket, playerModel) {
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

		this.loadAll();
	}

	get(id) {
		return this._.find(this.model.players, function(o) {
			return o._id === id;
		});
	}

	loadAll() {
		var self = this,
			onSuccess = function(res) {
				var activePlayer = self.$localStorage.player;

				self.$log.info('onSuccess()', res, self);

				if (res.status === 200) {
					self.model.players = res.data;

					self.$log.info('players', self.model.players);
				}

				self.$log.info('player', activePlayer);

				if (activePlayer && self.get(activePlayer._id)) {
					self.playerModel.setPlayer(activePlayer);
				}
			},
			onError = function(res) {

			};

		this.$log.info('loadAll()', this);

		this.playersApi.get().then(onSuccess, onError);
	}

	update(action, data) {
		switch(action) {
			case 'add':
				this.model.players.push(data);
				break;
			case 'create':
				this.playerModel.setPlayer(data);
				this.model.players.push(data);
				this.ws.send({
					action: action,
					type: 'player',
					nuts: data
				});
				break;
		}
	}

	insert(data) {
		var self = this,
			onSuccess = function(res) {
				self.$log.info(res);

				if (res.status === 201) {
					self.update('create', res.data);
				}
			},
			onError = function(res) {
				self.$log.error(res);
			};

		this.playersApi.update(data)
			.then(onSuccess, onError)
		;
	}
}
