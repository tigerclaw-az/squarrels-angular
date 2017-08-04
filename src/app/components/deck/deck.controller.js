export default class DeckController {
	constructor($rootScope, $scope, $log, gameModel, decksApi, deckStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.gameModel = gameModel;

		// Comes from <deck type="..">
		// this.type

		this.$log.info('constructor()', this);
	}

	$onInit() {
		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:decks:update', (event, data) => {
			this.$log.info('$on -> websocket:decks:update', data);
			this.deckStore.update(data.id, data);
		});

		// this.$scope.deck = this.deckStore.get(this.id);

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
