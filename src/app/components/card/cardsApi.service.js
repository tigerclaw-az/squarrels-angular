import BaseApiService from '../../shared/api/baseApi.service';

export default class CardsApiService extends BaseApiService {
	constructor($http, $log, appConfig, websocket) {
		'ngInject';

		super($http, $log, appConfig, websocket, 'cards');

		this.$log.info('constructor()', this);
	}
}
