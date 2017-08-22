import GameModelService from './gameModel.service';
import GameController from './game.controller';

export default angular
	.module('game', [])
	.controller('gameController', GameController)
	.service('gameModel', GameModelService)
;
