export default class GameModelService {
	constructor($log, $http, $localStorage, _, gamesApi) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;

		this._ = _;
		this.gamesApi = gamesApi;

		this.model = {
			game: {}
		};
	}

	endGame() {
		let onSuccess = (res => {
				this.$log.info('onSuccess()', res, this);
				this.update(res.data);
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.info('endGame()', this);

		this.gamesApi
			.update(this.model.game.id, { isGameStarted: false })
			.then(onSuccess, onError);
	}

	get() {
		return this.gamesApi.get();
	}

	isGameStarted() {
		return !this._.isEmpty(this.model.game);
	}

	update(data) {
		Object.assign(this.model.game, data);
	}
}
