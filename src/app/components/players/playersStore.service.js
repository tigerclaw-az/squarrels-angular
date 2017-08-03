export default class PlayersStoreService {
	constructor($log, $http, $localStorage, _, playersApi, websocket, playerModel) {
		'ngInject';

		var self = this;

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.playersApi = playersApi;
		this.ws = websocket;

		this.model = {
			players: []
		};

		this.$log.info('constructor()', this);
	}

	get(id) {
		this.$log.info('get()', id, this);

		if (id) {
			return this._.find(this.model.players, function(o) {
				return o.id === id;
			});
		}

		return this.model.players;
	}

	insert(data) {
		this.$log.info('insert()', data, this);

		this.model.players.push(data);
	}

	update(id, data) {
		this.$log.info('update()', id, data, this);

		// Find the index of player to update and modify the object
	}

	// Send a request to get the current player's private data
	// DO NOT move into playerController as it would be called everytime
	// a new player is added
	whoami() {
		this.$log.info('whoami()', this);

		this.ws.send({ action: 'whoami' });
	}
}
