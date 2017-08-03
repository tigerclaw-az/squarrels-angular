export class PlayerModelService {
	constructor($log, $http, $localStorage, _, websocket) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.ws = websocket;

		this.model = {
			player: null
		};
	}

	insert(data) {
		this.$log.info('insert()', data);

		this.model.player = data;
		this.$localStorage.player = this.model.player;
	}

	update(prop, value) {
		this.model.player[prop] = value;
	}
}
