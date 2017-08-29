export default class DeckController {
	constructor($rootScope, $scope, $log, toastr, _, deckStore, playerModel, playersApi, playersStore, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;

		this.deckStore = deckStore;
		this.playerModel = playerModel;
		this.pModel = playerModel.model;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
		this.ws = websocket;

		// Comes from <deck>
		// this.type
		// this.deckId

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
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
		let player = this.pModel.player,
			allowDiscard = false,
			totalCards = player.cardsInHand.length,
			type = card.cardType;

		if (player) {
			allowDiscard = player.isActive && this._.isEmpty(player.actionCard);

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
		let player = this.pModel.player;

		if (player) {
			return !player.isActive && this.playersStore.get('actionCard');
		}

		return false;
	}

	canDraw() {
		let player = this.pModel.player;

		if (player) {
			return player.isActive && !player.actionCard && player.isFirstTurn;
		}

		return false;
	}

	collectHoard() {
		let playerWithAction = this.playersStore.get('actionCard');

		this.$log.info('collectHoard()', this.pModel.player, playerWithAction, this);

		if (playerWithAction && playerWithAction.actionCard.action === 'hoard') {
			this.ws.send({
				action: 'hoard',
				playerAction: playerWithAction,
				playerHoard: this.pModel.player
			});
		} else {
			this.$log.warn('NOT HOARD CARD!');
		}
	}

	drawCard() {
		let player = this.pModel.player;

		this.$log.debug('drawCard()', player, this);

		this.deckStore
			.drawCard()
			.then(cardDrawn => {
				let hoardDeck = this.deckStore.getByType('discard'),
					cardAction = cardDrawn.action,
					cardsMerge = [],
					plData = {
						totalCards: player.totalCards
					};

				this.$log.info('deckStore:drawCard()', cardDrawn, cardAction, this);

				if (!cardAction) {
					// Player drew a non-"action" card, so add to their hand and update
					if (!this._.isEmpty(player.cardsInHand)) {
						cardsMerge = this._.union(player.cardsInHand, [cardDrawn.id]);
					}

					this.$log.info('cards:union -> ', cardsMerge);

					plData.cardsInHand = cardsMerge;
					plData.totalCards = cardsMerge.length;

					plData.isFirstTurn = plData.totalCards < this.playerModel.numDrawCards;
				} else {
					this.toastr.info(`Action Card - ${cardAction}`);

					plData.actionCard = cardDrawn;

					// FIXME: Only handling 'hoard' & 'winter' cards right now
					switch (cardAction) {
						case 'winter':
							plData.isActive = false;
							break;

						case 'hoard':
							if (!hoardDeck.cards.length) {
								this.toastr.info('No cards to Hoard');
								plData.actionCard = null;
							}

							break;

						default:
							plData.actionCard = null;
							break;
					}

					// Don't allow player to draw more than 7 cards
					if (plData.totalCards === this.playerModel.numDrawCards) {
						plData.isFirstTurn = false;
					}
				}

				this.playersApi
					.update(player.id, plData)
					.then(res => {
						this.$log.info('playersApi:update()', res, this);
					})
					.catch(err => {
						this.$log.error('This is nuts! Error: ', err);
					});
			})
			.catch(err => {
				this.$log.error(err);
			});

		this.playerModel.resetSelected();
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
		this.$log.debug('onDropComplete()', data, event, this);

		if (this.canDiscard(data)) {
			this.deckStore.discard(data.id);
		}

		this.playerModel.resetSelected();
	}
}
