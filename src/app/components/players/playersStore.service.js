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

	whoami() {
		this.ws.send({ action: 'whoami' });
	}

	loadAll() {
		this.$log.info('loadAll()', this);

		return this.playersApi.get();
	}

	update(action, data) {
		var player = this.playerModel.model.player;

		this.$log.info('update()', action, data, this);

		switch (action) {
			case 'add':
				if (!player || player.id !== data.id) {
					this.model.players.push(data);
				}
				break;

			case 'create':
				this.playerModel.setPlayer(data);
				this.model.players.push(data);
				break;

			case 'whoami':
				this.playerModel.setPlayer(data);
				break;
		}
	}

	insert(data) {
		this.$log.info('insert()', data, this);

		return this.playersApi.update(data);
	}
}
