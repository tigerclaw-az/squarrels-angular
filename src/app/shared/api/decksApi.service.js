import BaseApiService from './baseApi.service';

export class PlayersApiService extends BaseApiService {
	constructor($http, $log, appConfig, websocket) {
		'ngInject';

		super($http, $log, appConfig, websocket, 'decks');

		this.$log.info('constructor()', this);
	}

	get() {
		return this.$http.get(this.url);
	}
}
