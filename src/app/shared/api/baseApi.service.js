export default class BaseApiService {
	constructor($http, $log, appConfig, path) {
		'ngInject';

		this.$http = $http;
		this.$log = $log;

		this._ = _;

		this.host = `${appConfig.host}:3000`;
		this.path = path;
		this.url = `//${this.host}/api/${path}`;

		this.$log.debug('constructor()', this);
	}

	create(data) {
		this.$log.debug('api:create()', data, this);

		return this.$http.post(`${this.url}`, data);
	}

	get(query = '') {
		let httpObj = {
			method: 'GET',
			url: `${this.url}/${query}`,
			cache: this.path === 'cards' ? true : false
		}

		this.$log.debug('api:get()', query, this);

		return this.$http(httpObj);
	}

	remove(id) {
		this.$log.debug('api:remove()', id, this);

		return this.$http.delete(`${this.url}/${id}`);
	}

	update(id, data) {
		this.$log.debug('api:update()', id, data, this);

		return this.$http.post(`${this.url}/${id}`, data);
	}
}
