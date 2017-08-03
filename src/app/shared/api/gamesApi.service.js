import BaseApiService from './baseApi.service';

export class GamesApiService extends BaseApiService {
	constructor($http, $log, appConfig, websocket) {
		'ngInject';

		super($http, $log, appConfig, websocket, 'games');

		this.$log.info('constructor()', this);
	}
}
