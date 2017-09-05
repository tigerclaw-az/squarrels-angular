export default class GameModelService {
	constructor($log, $localStorage, _, gamesApi) {
		'ngInject';

		this.$log = $log.getInstance(this.constructor.name);

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

	clear() {
		this.model.game = {};
	}

	get() {
		return this.gamesApi.get();
	}

	isGameStarted() {
		return this.model.game.isGameStarted;
	}

	update(data) {
		Object.assign(this.model.game, data);

		if (!data.actionCard) {
			this.model.game.actionCard = null;
		}
	}
}
