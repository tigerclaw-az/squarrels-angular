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
		return this.$http.get(`${this.url}/${query}`);
	}

	update(data, id = '') {
		return this.$http.post(`${this.url}/${id}`, data);
	}
}
