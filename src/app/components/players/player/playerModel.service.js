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
		this.$log.info('insert()', data, this);

		this.model.player = data;
		this.$localStorage.player = this.model.player;
	}

	update(prop, value) {
		if (value) {
			this.model.player[prop] = value;
		} else {
			Object.assign(this.model.player, prop);
		}
	}
}
