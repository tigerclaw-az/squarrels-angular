export default class PlayerController {
	constructor($rootScope, $scope, $log, $timeout, $uibModal, _, toastr, playersApi, playerModel, playersStore, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);
		this.$timeout = $timeout;
		this.$uibModal = $uibModal;

		this._ = _;
		this.toastr = toastr;

		this.playerModel = playerModel;
		this.playersStore = playersStore;
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
		return this.playerModel.getByProp();
	}

	isCurrentPlayer() {
		return this.player.isCurrent;
	}

	onStorageClick(evt) {
		let isActivePlayer = this.player.isActive,
			hasDrawnCard = this.playerModel.getByProp('hasDrawnCard'),
			cardsSelected = this.playerModel.getByProp('cardsSelected');

		this.$log.debug('onStorageClick()', evt, cardsSelected, this);

		evt.preventDefault();

		if (isActivePlayer && hasDrawnCard && this.canStoreCards(cardsSelected)) {
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
					let numberCards = this._.filter(res.data, (o) => {
							return o.cardType === 'number';
						}),
						cardsGroup = this._.groupBy(numberCards, (o) => {
							return o.amount;
						}),
						isStored = false,
						timeout = 0;

					this.$log.debug('cardsGroup -> ', cardsGroup);

					this._.forEach(cardsGroup, group => {
						let total = group.length;
						if (total < 3) {
							return;
						}

						let numGroups = Math.floor(total / 3);

						for (let i = 0; i < numGroups; ++i) {
							let cardsToStore = this._.sampleSize(group, 3);

							this.$log.debug('cardsToStore -> ', cardsToStore);
							this._.pullAll(group, cardsToStore);

							this.$timeout(() => {
								this.storeCards(cardsToStore);
							}, timeout);

							timeout += 250;
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

					this.playersStore.update(
						this.player.id,
						{ cardsSelected: [] }
					);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			}),
			cardIds = this._.map(cardsSelected, obj => {
				return obj.id;
			});

		cardsInStorage.push(cardIds[0]);
		this._.pullAll(cardsInHand, cardIds);

		let plData = {
			cardsInHand: cardsInHand,
			cardsInStorage: cardsInStorage,
			isFirstTurn: false,
			score: this.playerModel.getByProp('score') + cardsSelected[0].amount
		};

		this.playersApi
			.update(this.player.id, plData)
			.then(onSuccess, onError);
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
