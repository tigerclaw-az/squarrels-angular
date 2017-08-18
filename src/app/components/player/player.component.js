import controller from './player.controller';

export const PlayerComponent = {
	bindings: {
		game: '<',
		player: '<'
	},
	controller,
	controllerAs: 'playerCtrl',
	templateUrl: 'components/player/player.tpl.html'
};
