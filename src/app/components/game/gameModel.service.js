export default class GameModelService {
	constructor($log, $localStorage, _, gamesApi) {
		'ngInject';

		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.gamesApi = gamesApi;

		this.model = {};
	}

	endGame() {
		let onSuccess = (res => {
				this.$log.debug('onSuccess()', res, this);
				this.update(res.data);
			}),
			onError = (err => {
				this.$log.error(err);
			});

		this.$log.debug('endGame()', this);

		this.gamesApi
			.update(this.model.id, { isGameStarted: false })
			.then(onSuccess, onError);
	}

	clear() {
		this.model = {};
	}

	get() {
		return this.gamesApi.get();
	}

	getByProp(prop) {
		if (prop) {
			return this.model[prop];
		}

		return this.model;
	}

	isGameStarted() {
		return this.model.isGameStarted;
	}

	update(data) {
		Object.assign(this.model, data);

		if (!data.actionCard) {
			this.model.actionCard = null;
		}
	}
}
