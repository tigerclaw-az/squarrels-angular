import { GameComponent } from './game.component';
import GameModelService from './gameModel.service';

export default angular
	.module('game', [])
	.component('game', GameComponent)
	.service('gameModel', GameModelService)
;
