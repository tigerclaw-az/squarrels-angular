export default class GameModelService {
	constructor($log, $http, $localStorage, _) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;

		this._ = _;

		this.model = {
			game: {}
		};
	}

	isGameStarted() {
		return !this._.isEmpty(this.model.game);
	}

	update(data) {
		Object.assign(this.model.game, data);
	}
}
