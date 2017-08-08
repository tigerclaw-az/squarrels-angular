export default class DeckController {
	constructor($rootScope, $scope, $log, gameModel, decksApi, deckStore, playerModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.playerModel = playerModel.model;
		this.playersStore = playersStore;

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

	canDiscard() {
		let player = this.playerModel.player;

		// TODO: Make sure the card isn't a Golden or Rotten (unless only card)
		return player.isActive && player.selectedCard;
	}

	canDraw() {
		let player = this.playerModel.player;

		return player.isActive && player.isCurrent &&
			(player.isFirstTurn || player.totalCards < 7);
	}

	discardCard() {
		this.$log.info('discardCard()', this);

		this.playersStore.nextPlayer();
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

	onClick() {
		this.$log.info('onClick()', this);

		if (this.type === 'main' && this.canDraw()) {
			this.drawCard();
		} else if (this.type === 'discard' && this.canDiscard()) {
			this.discardCard();
		}
	}
};
