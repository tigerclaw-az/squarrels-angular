import BaseApiService from '../../shared/api/baseApi.service';

export default class DecksApiService extends BaseApiService {
	constructor($http, $log, appConfig, websocket) {
		'ngInject';

		super($http, $log, appConfig, websocket, 'decks');

		this.$log.info('constructor()', this);
	}
}
