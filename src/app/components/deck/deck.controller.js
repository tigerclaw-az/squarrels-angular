export default class DeckController {
	constructor($rootScope, $scope, $log, toastr, gameModel, decksApi, deckStore, playerModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;
		this.toastr = toastr;

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
		this.deck = this.deckStore.model.deck[this.deckId];

		this.$scope.deck = this.deck;

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('$onDestroy()', this);
		};
	}

	isDisabled() {
		let player = this.playerModel.player,
			canDraw = player.isActive && player.isCurrent &&
					(player.isFirstTurn || player.totalCards < 7),
			canHoard = !player.isActive;

		this.$log.info('isDisabled()', player, canDraw, canHoard, this);

		return (this.type === 'main' && !canDraw) || (this.type === 'discard' && !canHoard);
	}

	canDiscard() {
		let player = this.playerModel.player;

		return player.isActive && player.isCurrent && !player.isFirstTurn;
	}

	canHoard() {
		let player = this.playerModel.player;

		// FIXME: Add logic to test for 'Hoard' action card as well
		return !player.isActive;
	}

	canDraw() {
		let player = this.playerModel.player;

		return player.isActive && player.isCurrent &&
			(player.isFirstTurn || player.totalCards < 7);
	}

	collectHoard() {
		this.$log.info('You got the hoard!');
		this.toastr.info('HOARD!');
	}

	discardCard() {
		this.$log.info('discardCard()', this);

		this.playersStore.nextPlayer();
	}

	drawCard() {
		let isActivePlayer = this.playerModel.player.isActive;

		this.$log.info('drawCard()', isActivePlayer, this);

		this.$log.info('You drew a card!');
		this.deckStore.drawCard(this.playerModel.player, this.deck, 1);
	}

	onClick() {
		this.$log.info('onClick()', this);

		if (this.type === 'main' && this.canDraw()) {
			this.drawCard();
		} else if (this.type === 'discard' && this.canHoard()) {
			this.collectHoard();
		} else {
			this.toastr.warning('This is nuts!');
		}
	}

	onDropComplete(data, event) {
		let $el = event.element,
			cardId = data;

		this.$log.info('onDropComplete()', data, cardId, event, this);

		// TODO: Don't allow 'golden' or 'rotten' cards unless ONLY card left
		if (this.canDiscard()) {
			this.deckStore.discard(cardId);
		}
	}
};
