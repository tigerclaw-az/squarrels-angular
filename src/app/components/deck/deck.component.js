import controller from './deck.controller';

export const DeckComponent = {
	bindings: {
		deckId: '=',
		pModel: '=',
		type: '@'
	},
	controller,
	controllerAs: 'deckCtrl',
	templateUrl: 'components/deck/deck.tpl.html'
};
