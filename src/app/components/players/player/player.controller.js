export default class PlayerController {
	constructor($rootScope, $scope, $log, _, playersApi, playerModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
		this.playerModel = playerModel; // Used in template
		this.playersApi = playersApi;
		this.ws = websocket;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	getCurrentPlayer() {
		return this.playerModel.model.player;
	}

	onStorageClick(evt) {
		let cardsSelected = this.player.cardsSelected,
			cardsInStorage = this.player.cardsInStorage,
			cardsInHand = this.player.cardsInHand,
			// HACK! I tried using _.every(cardsSelected, 'amount') to no avail
			cardsMatch = this._.reduce(cardsSelected, (prev, current, index, array) => {
				let len = array.length,
					sameCard = prev.amount === current.amount;

				this.$log.info('reduce()', prev, current, index, len);

				if (!prev) {
					// If the previous object is 'false', then cards don't match
					return false;
				} else if (sameCard && index === len - 1) {
					// Reached the end of the array and all values matched
					return true;
				}

				return sameCard ? current : false;
			}),
			onSuccess = (res => {
				if (res.status == 200) {
					this.$log.info(res);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			cardIds;

		this.$log.info('onStorageClick()', evt, this);
		this.$log.info('cardsMatch -> ', cardsSelected, cardsMatch);

		if (this.player.isActive && cardsSelected.length === 3 && cardsMatch) {
			cardIds = this._.map(cardsSelected, (obj) => {
				return obj.id;
			});

			this.$log.info('Storing your cards: ', cardIds);

			cardsInStorage.push(cardIds[0]);
			this._.pullAll(cardsInHand, cardIds);

			let plData = {
				cardsInHand: cardsInHand,
				cardsInStorage: cardsInStorage,
				score: this.player.score + cardsSelected[0].amount,
				totalCards: cardsInHand.length
			};

			this.playersApi
				.update(this.player.id, plData)
				.then(onSuccess, onError);

			this.player.cardsSelected = [];
		} else {
			this.showStorage(this.player);
		}
	}

	showStorage(pl) {
		this.$log.info('showStorage()', pl, this);
	}
}
