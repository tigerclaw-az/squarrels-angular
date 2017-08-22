import BaseApiService from '../../shared/api/baseApi.service';

export default class DecksApiService extends BaseApiService {
	constructor($http, $log, appConfig) {
		'ngInject';

		super($http, $log, appConfig, 'decks');

		this.$log.debug('constructor()', this);
	}
}
