import controller from './card.controller';

export const CardComponent = {
	bindings: {
		cardId: '=',
		cardType: '@'
	},
	controller,
	controllerAs: 'cardCtrl',
	templateUrl: 'components/card/card.tpl.html'
};
