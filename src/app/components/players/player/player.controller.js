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

	canStoreCards(cardsSelected) {
		let cardsMatch = this._.reduce(cardsSelected, (prev, current, index, array) => {
			let len = array.length,
				sameCard = prev.amount === current.amount;

			if (!prev) {
				// If the previous object is 'false', then cards don't match
				return false;
			} else if (sameCard && index === len - 1) {
				// Reached the end of the array and all values matched
				return true;
			}

			return sameCard ? current : false;
		});

		return this.player.isActive &&
			this._.isEmpty(this.player.actionCard) &&
			cardsSelected.length === 3 && cardsMatch;
	}

	getCurrentPlayer() {
		return this.playerModel.model.player;
	}

	onStorageClick(evt) {
		let cardsSelected = this.player.cardsSelected;

		this.$log.debug('onStorageClick()', evt, cardsSelected, this);

		if (this.canStoreCards(cardsSelected)) {
			this.storeCards(cardsSelected);
		} else {
			this.showStorage(this.player);
		}
	}

	storeCards(cardsSelected) {
		let cardsInStorage = this.player.cardsInStorage,
			cardsInHand = this.player.cardsInHand,
			onSuccess = (res => {
				if (res.status == 200) {
					this.$log.debug(res);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			cardIds = this._.map(cardsSelected, (obj) => {
				return obj.id;
			});

		this.$log.debug('Storing Cards: ', cardIds);

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
	}

	showStorage(pl) {
		this.$log.info('showStorage()', pl, this);
	}
}
