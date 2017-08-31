export default class DeckController {
	constructor($rootScope, $scope, $log, toastr, _, decksApi, deckStore, playerModel, playersApi, playersStore, websocket) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log.getInstance(this.constructor.name);

		this._ = _;
		this.toastr = toastr;

		this.decksApi = decksApi;
		this.deckStore = deckStore;
		this.playerModel = playerModel;
		this.pModel = playerModel.model;
		this.playersApi = playersApi;
		this.playersStore = playersStore;
		this.ws = websocket;

		// Bindings from <deck> component
		// this.deckId
		// this.game
		// this.type

		this.$log.debug('constructor()', this);
	}

	$onInit() {
		this.$log.debug('$onInit()', this);
	}

	$onDestroy() {
		this.$log.debug('$onDestroy()', this);
	}

	cardLimit() {
		return this.type === 'main' ? 1 : this.getDeck().cards.length;
	}

	getDeck() {
		return this.deckStore.model.deck[this.deckId];
	}

	getTotalCards() {
		return this.getDeck().cards.length;
	}

	isDisabled() {
		return this.type === 'main' && !this.canDraw() ||
			this.type === 'discard' && !this.canHoard() ||
			this.type === 'action';
	}

	canDiscard(card) {
		let player = this.pModel.player,
			allowDiscard = false,
			totalCards = player.cardsInHand.length,
			type = card.cardType;

		if (player) {
			allowDiscard = player.isActive && this._.isEmpty(this.game.actionCard);

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
			return !player.isActive && !this._.isEmpty(this.game.actionCard);
		}

		return false;
	}

	canDraw() {
		let player = this.pModel.player;

		if (player) {
			return player.isActive && this._.isEmpty(this.game.actionCard) && player.isFirstTurn;
		}

		return false;
	}

	collectHoard() {
		this.$log.info('collectHoard()', this.pModel.player, this.game.actionCard, this);

		if (this.game.actionCard.action === 'hoard') {
			this.ws.send({
				action: 'hoard',
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
				let actionDeck = this.deckStore.getByType('action'),
					cardAction = cardDrawn.action,
					cardsMerge = [],
					plData = {
						totalCards: player.totalCards
					};

				this.$log.info('deckStore:drawCard()', cardDrawn, cardAction, this);

				if (!cardAction) {
					// Player drew a non-"action" card, so add to their hand and update
					cardsMerge = this._.union(player.cardsInHand, [cardDrawn.id]);

					this.$log.info('cards:union -> ', cardsMerge);

					plData.cardsInHand = cardsMerge;
					plData.totalCards = cardsMerge.length;

					plData.isFirstTurn = plData.totalCards < this.playerModel.numDrawCards;
				} else {
					// FIXME
					this.decksApi
						.update(actionDeck.id, { cards: cardDrawn.id })
						.then(res => {
							this.$log.info('actionDeck -> ', res);
						}, err => {
							this.$log.error(err);
						});

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
