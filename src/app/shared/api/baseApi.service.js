export default class BaseApiService {
	constructor($http, $log, appConfig, websocket, path) {
		'ngInject';

		this.$http = $http;
		this.$log = $log;

		this._ = _;
		this.websocket = websocket;

		this.host = `${appConfig.host}:3000`;
		this.url = `http://${this.host}/api/${path}`;

		this.$log.info('constructor()', this);
	}

	get(query = '') {
		this.$log.info('api:get()', query, this);

		return this.$http.get(`${this.url}/${query}`);
	}

	remove(id) {
		this.$log.info('api:remove', id, this);

		return this.$http.delete(`${this.url}/${id}`);
	}

	update(data, id = '') {
		this.$log.info('api:update', data, id, this);

		return this.$http.post(`${this.url}/${id}`, data);
	}
}
