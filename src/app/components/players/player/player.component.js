import controller from './player.controller.js';

export const PlayerComponent = {
	bindings: {
		person: '='
	},
	controller,
	controllerAs: 'playerCtrl',
	// templateUrl: 'components/players/player/player.tpl.html'
};
