import controller from './player.controller.js';

export const PlayerComponent = {
	bindings: {
		player: '='
	},
	controller,
	controllerAs: 'playerCtrl',
	templateUrl: 'components/players/player/player.tpl.html'
};
