export default class GameModelService {
	constructor($log, $http, $localStorage, _, websocket) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;
		this.ws = websocket;

		this.model = {
			game: {}
		};
	}

	isGameStarted() {
		return !this._.isEmpty(this.model.game);
	}

	update(data) {
		data.isGameStarted = true;
		this.model.isGameStarted = true;

		Object.assign(this.model.game, data);
	}
}
