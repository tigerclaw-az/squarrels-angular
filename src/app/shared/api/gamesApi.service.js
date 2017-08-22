import BaseApiService from './baseApi.service';

export class GamesApiService extends BaseApiService {
	constructor($http, $log, appConfig) {
		'ngInject';

		super($http, $log, appConfig, 'games');

		this.$log.debug('constructor()', this);
	}
}
