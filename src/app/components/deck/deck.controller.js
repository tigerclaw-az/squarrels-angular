export default class DeckController {
	constructor($rootScope, $scope, $log, toastr, _, gameModel, decksApi, deckStore, playerModel, playersStore, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this._ = _;
		this.toastr = toastr;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.playerModel = playerModel.model;
		this.playersStore = playersStore;
		this.ws = websocket;

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
			allowDiscard = player.isActive && !player.isFirstTurn && this._.isEmpty(player.actionCard);

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

		if (player) {
			return !player.isActive && this.playersStore.get('actionCard');
		}

		return false;
	}

	canDraw() {
		let player = this.playerModel.player;

		if (player) {
			// FIXME: Allows player to draw more cards after putting them in 'storage'
			return player.isActive && !player.actionCard &&
				(player.isFirstTurn || player.totalCards < 7);
		}

		return false;
	}

	collectHoard() {
		let playerWithAction = this.playersStore.get('actionCard');

		this.$log.info('collectHoard()', playerWithAction, this);

		if (playerWithAction && playerWithAction.actionCard.action === 'hoard') {
			this.ws.send({
				action: 'hoard',
				playerAction: playerWithAction,
				playerHoard: this.playerModel.player
			});
		} else {
			this.$log.warn('NOT HOARD CARD!');
		}
	}

	discardCard() {
		this.$log.info('discardCard()', this);

		this.playersStore.nextPlayer();
	}

	drawCard() {
		let player = this.playerModel.player;

		this.$log.info('drawCard()', player, this);

		this.$log.info('You drew a card!');
		this.deckStore.drawCard(player, 1);
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

		if (this.canDiscard(data)) {
			this.deckStore.discard(data.id);
		}
	}
}
