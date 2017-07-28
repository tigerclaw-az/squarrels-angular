import { PlayersApiService } from './api/playersApi.service';
import { UtilsService } from './utils/utils.service';
import { WebSocketService } from './websocket/websocket.service';

export
	default angular
		.module('shared', [])
		.service('playersApi', PlayersApiService)
		.service('utils', UtilsService)
		.service('websocket', WebSocketService)
;
