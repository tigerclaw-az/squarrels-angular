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
	}

	get(id) {
		return this._.find(this.model.players, function(o) {
			return o._id === id;
		});
	}

	loadAll() {
		this.$log.info('loadAll()', this);

		return this.playersApi.get();
	}

	update(action, data) {
		this.$log.info('update()', action, data, this);

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
		this.$log.info('insert()', data, this);

		return this.playersApi.update(data);
	}
}
