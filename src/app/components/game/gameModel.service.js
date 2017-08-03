export default class GameModelService {
	constructor($log, $http, $localStorage, _, websocket) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.ws = websocket;

		this.model = {
			game: null
		};
	}

	update(data) {
		this.model.game = data;
	}
}
