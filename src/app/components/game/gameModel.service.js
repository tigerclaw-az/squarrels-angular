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
		angular.copy({}, this.model);
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
		this.$log.debug('update()', data, this);

		angular.extend(this.model, data);

		if (!data.actionCard) {
			angular.copy(null, this.model.actionCard);
		}
	}
}
