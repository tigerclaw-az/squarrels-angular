import { GamesApiService } from './api/gamesApi.service';
import { PlayersApiService } from './api/playersApi.service';
import { SoundsService } from './sounds/sounds.service';
import { UtilsService } from './utils/utils.service';
import { WebSocketService } from './websocket/websocket.service';

import 'angular-websocket';

export default angular
	.module('shared', ['angular-websocket'])
	.service('gamesApi', GamesApiService)
	.service('playersApi', PlayersApiService)
	.service('sounds', SoundsService)
	.service('utils', UtilsService)
	.service('websocket', WebSocketService)
;
