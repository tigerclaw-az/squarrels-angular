import controller from './card.controller';

export const CardComponent = {
	bindings: {
		cardId: '@',
		cardType: '@',
		player: '='
	},
	controller,
	controllerAs: 'cardCtrl',
	templateUrl: 'components/card/card.tpl.html'
};
