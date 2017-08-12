export default class BaseApiService {
	constructor($http, $log, appConfig, path) {
		'ngInject';

		this.$http = $http;
		this.$log = $log;

		this._ = _;

		this.host = `${appConfig.host}:3000`;
		this.url = `//${this.host}/api/${path}`;

		this.$log.info('constructor()', this);
	}

	create(data) {
		this.$log.info('api:create()', data, this);

		return this.$http.post(`${this.url}`, data);
	}

	get(query = '') {
		this.$log.info('api:get()', query, this);

		return this.$http.get(`${this.url}/${query}`);
	}

	remove(id) {
		this.$log.info('api:remove()', id, this);

		return this.$http.delete(`${this.url}/${id}`);
	}

	update(id, data) {
		this.$log.info('api:update()', id, data, this);

		return this.$http.post(`${this.url}/${id}`, data);
	}
}
