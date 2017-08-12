import controller from './players.controller';

export const PlayersComponent = {
	bindings: {
		game: '<'
	},
	controller,
	controllerAs: 'playersCtrl',
	templateUrl: 'components/players/players.tpl.html'
};
