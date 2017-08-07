export default class DeckController {
	constructor($rootScope, $scope, $log, gameModel, decksApi, deckStore, playerModel) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.playerModel = playerModel.model;

		// Comes from <deck>
		// this.type
		// this.deckId

		this.$log.info('constructor()', this);
	}

	$onInit() {
		this.$scope.deck = this.deckStore.model.deck[this.deckId];
		this.$scope.pModel = this.playerModel;

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('$onDestroy()', this);
		};
	}

	canDraw() {
		return this.playerModel.player.isActive &&
			this.playerModel.player.isCurrent &&
			this.playerModel.player.totalCards < 7;
	}

	drawCard() {
		let isActivePlayer = this.playerModel.player.isActive;

		this.$log.info('drawCard()', isActivePlayer, this);

		if (this.type === 'main' && isActivePlayer) {
			this.$log.info('You drew a card!');
		} else if (this.action === 'hoard' && !isActivePlayer) {
			this.$log.info('You got the hoard!');
		}
	}
};
