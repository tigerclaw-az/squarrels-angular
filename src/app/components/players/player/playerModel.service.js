export class PlayerModelService {
	constructor($log, $http, $localStorage, _) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;

		this._ = _;

		this.model = {
			player: null
		};

		this.numDrawCards = 7;
	}

	insert(data) {
		let pl = Object.assign({}, {
					isCurrent: true,
					cardsInHand: []
				}, data
			);

		this.$log.info('insert()', pl, this);

		this.model.player = pl;
		this.$localStorage.player = this.model.player;
	}

	update(data) {
		Object.assign(this.model.player, data);
	}
}
