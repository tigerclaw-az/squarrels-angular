export default class PlayerController {
	constructor($rootScope, $scope, $log, $uibModal, _, toastr, playersApi, playerModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);
		this.$uibModal = $uibModal;

		this._ = _;
		this.toastr = toastr;

		this.playerModel = playerModel; // Used in template
		this.playersApi = playersApi;
		this.ws = websocket;

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);

		this.$rootScope.$on('deck:action:winter', () => {
			this.$log.debug('deck:action:winter');

			if (this.player.id === this.playerModel.model.player.id) {
				this.playerModel.showSpecialCards();
			}
		});
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
	}

	canStoreCards(cardsSelected) {
		if (this.game.actionCard || !cardsSelected || cardsSelected.length !== 3) {
			return false;
		}

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

		return cardsMatch;
	}

	getCurrentPlayer() {
		return this.playerModel.model.player;
	}

	onStorageClick(evt) {
		let cardsSelected = this.player.cardsSelected;

		this.$log.debug('onStorageClick()', evt, cardsSelected, this);

		evt.preventDefault();

		if (this.player.isActive && this.player.hasDrawnCard && this.canStoreCards(cardsSelected)) {
			this.storeCards(cardsSelected);
		} else {
			this.showStorage(this.player);
		}
	}

	onStorageAutoClick(evt) {
		evt.preventDefault();

		if (this.player.isActive && !this.player.isFirstTurn) {
			// Filter out sets of 3 that have the same 'amount'
			this.playerModel.getCards()
				.then(res => {
					let cards = this._.filter(res.data, (o) => {
							return o.cardType === 'number';
						}),
						numberCards = this._.groupBy(cards, (o) => {
							return o.amount;
						}),
						isStored = false;

					this.$log.info('numberCards -> ', numberCards);

					this._.forEach(numberCards, (cardsGroup) => {
						if (cardsGroup.length % 3 === 0) {
							this.storeCards(cardsGroup);
							isStored = true;
						}
					});

					if (!isStored) {
						this.toastr.warning('No matching cards to store!');
					}
				}, (err) => {
					this.$log.error(err);
				});
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

		cardsInStorage.push(cardIds[0]);
		this._.pullAll(cardsInHand, cardIds);

		let plData = {
			cardsInHand: cardsInHand,
			cardsInStorage: cardsInStorage,
			score: this.player.score + cardsSelected[0].amount
		};

		this.playersApi
			.update(this.player.id, plData)
			.then(onSuccess, onError);

		this.player.cardsSelected = [];
	}

	showStorage(pl) {
		let onClose = (data => {
				this.$log.debug('onClose()', data, this);
			}),
			onError = (err => {
				if (err !== 'backdrop click') {
					this.$log.error(err);
				}
			});

		this.$log.debug('showStorage()', pl, this);

		let modal = this.$uibModal.open({
			appendTo: angular.element(document).find('players'),
			component: 'storageModal',
			resolve: {
				player: () => {
					return this.player;
				}
			}
		});

		modal.result.then(onClose, onError);
	}
}
