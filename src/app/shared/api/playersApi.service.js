import BaseApiService from './baseApi.service';

export class PlayersApiService extends BaseApiService {
	constructor($http, $log, appConfig, websocket) {
		'ngInject';

		super($http, $log, appConfig, websocket, 'players');

		this.$log.info('constructor()', this);
	}
}
