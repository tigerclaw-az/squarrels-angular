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
		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('$onDestroy()', this);
		};
	}

	cardLimit() {
		return this.type === 'discard' ? this.getDeck().cards.length : 1;
	}

	getDeck() {
		return this.deckStore.model.deck[this.deckId];
	}

	getTotalCards() {
		return this.getDeck().cards.length;
	}

	isDisabled() {
		return (this.type === 'main' && !this.canDraw()) || (this.type === 'discard' && !this.canHoard());
	}

	canDiscard(card) {
		let player = this.playerModel.player,
			allowDiscard = false,
			totalCards = player.cardsInHand.length,
			type = card.cardType;

		if (player) {
			allowDiscard = player.isActive && player.isCurrent && !player.isFirstTurn

			if (type === 'special' && allowDiscard) {
				allowDiscard = totalCards === 1 ? true : false;

				if (!allowDiscard) {
					this.toastr.error('NOPE!');
				}
			}
		}

		return allowDiscard;
	}

	canHoard() {
		let player = this.playerModel.player;

		// FIXME: Add logic to test for 'Hoard' action card as well
		if (player) {
			return !player.isActive;
		}

		return false;
	}

	canDraw() {
		let player = this.playerModel.player;

		if (player) {
			return player.isActive && player.isCurrent &&
				(player.isFirstTurn || player.totalCards < 7);
		}

		return false;
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
		this.deckStore.drawCard(this.playerModel.player, 1);
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
		this.$log.info('onDropComplete()', data, event, this);

		// TODO: Don't allow 'golden' or 'rotten' cards unless ONLY card left
		if (this.canDiscard(data)) {
			this.deckStore.discard(data.id);
		}
	}
}
