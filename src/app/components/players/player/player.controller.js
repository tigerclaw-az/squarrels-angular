export
default class PlayerController {
	constructor($rootScope, $scope, $localStorage, $log, _, playersApi, playersStore, playerModel, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
		this.playerModel = playerModel;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
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

	onStorageClick(evt) {
		this.$log.info('onStorageClick()', evt, this);

		let cardsSelected = this.player.cardsSelected,
			cardsInStorage = this.player.cardsInStorage,
			cardsInHand = this.player.cardsInHand,
			onSuccess = (res => {
				if (res.status == 200) {
					this.$log.info(res);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		if (this.player.isActive && cardsSelected.length === 3) {
			this.$log.info('Storing your cards: ', cardsSelected);

			cardsInStorage.push(cardsSelected[0]);
			this._.pullAll(cardsInHand, cardsSelected);

			let plData = {
				cardsInHand: cardsInHand,
				cardsInStorage: cardsInStorage,
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
