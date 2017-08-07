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

		this.numDrawCards = 7;
	}

	insert(data) {
		this.$log.info('insert()', data, this);

		data.isCurrent = true;
		this.model.player = data;
		this.$localStorage.player = this.model.player;
	}

	update(data) {
		Object.assign(this.model.player, data);
	}
}
