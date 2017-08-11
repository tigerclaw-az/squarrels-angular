import { PlayerComponent } from './player.component';
import { PlayerModelService } from './playerModel.service';

export default angular
	.module('player', [])
	.component('player', PlayerComponent)
	.service('playerModel', PlayerModelService)
;
