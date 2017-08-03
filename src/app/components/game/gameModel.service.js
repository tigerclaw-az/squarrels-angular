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

	update(data) {
		this.model.game = data;
	}
}
