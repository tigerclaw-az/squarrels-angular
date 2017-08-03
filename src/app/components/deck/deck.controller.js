export default class DeckController {
	constructor($rootScope, $scope, $log, gameModel, decksApi, deckStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.gameModel = gameModel;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var onSuccess = (res) => {
				this.$log.info('onSuccess()', res, this);

				if (res.status === 200) {
					let data = res.data[0];

					this.deckStore.insert(data.id, data.cards);
				}
			},
			onError = (res) => {
				this.$log.error(res);
			};

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:decks:update', (event, data) => {
			this.$log.info('$on -> websocket:decks:update', data);
			// this.gameModel.update(data);
		});

		this.decksApi
			.get(this.deckId)
			.then(onSuccess, onError);

		// this.$scope.cards = this.deckStore.get(this.id);

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('$onDestroy()', this);
		};
	}

	drawCard() {
		let isActivePlayer = this.playerModel.model.player.isActive;

		if (this.type === 'main' && isActivePlayer) {
			this.$log.info('You drew a card!');
		} else if (this.gameModel.model.action === 'hoard' && !isActivePlayer) {
			this.$log.info('You got the hoard!');
		}
	}
};
