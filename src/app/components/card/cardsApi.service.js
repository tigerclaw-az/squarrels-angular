import BaseApiService from '../../shared/api/baseApi.service';

export default class CardsApiService extends BaseApiService {
	constructor($http, $log, appConfig) {
		'ngInject';

		super($http, $log, appConfig, 'cards');

		this.$log.info('constructor()', this);
	}
}
