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

	setPlayer(data) {
		this.$log.info('setPlayer()', data);

		this.model.player = data;
		this.$localStorage.player = this.model.player;
	}
}
