export class PlayerModelService {
	constructor($log, $http, $localStorage, $q, _, playersApi) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this.$localStorage = $localStorage;
		this.$q = $q;

		this._ = _;
		this.playersApi = playersApi;

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

	discard(id) {
		let cards = this.model.player.cardsInHand,
			defer = this.$q.defer(),
			onSuccess = (res => {
				defer.resolve(res);
			}),
			onError = (err => {
				this.$log.error(err);
				defer.reject(err);
			});

		this.$log.info('discard()', id, cards, this);

		// Remove card from player
		this._.pull(cards, id);

		this.$log.info('playerModel:cards -> ', cards);

		this.playersApi
			.update({ cardsInHand: cards, totalCards: cards.length }, this.model.player.id)
			.then(onSuccess, onError);

		return defer.promise;
	}

	update(data) {
		Object.assign(this.model.player, data);
	}
}
