import { PlayersComponent } from './players.component';
import { PlayersModelService } from './PlayersModel.service';

export
	default angular
			.module('players', [])
			.component('players', PlayersComponent)
			.service('playersModel', PlayersModelService)
;
