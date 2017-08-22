import BaseApiService from './baseApi.service';

export class PlayersApiService extends BaseApiService {
	constructor($http, $log, appConfig) {
		'ngInject';

		super($http, $log, appConfig, 'players');

		this.$log.debug('constructor()', this);
	}
}
