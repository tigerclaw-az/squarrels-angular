export class PlayersApiService {
	constructor($http, $log, appConfig, _) {
		'ngInject';

		this.$http = $http;
		this.$log = $log;
		this._ = _;

		this.host = `${appConfig.localhost}:3000`;
		this.url = `http://${this.host}/api`;

		this.$log.info('constructor()', this);
	}

	get(id) {
		var query = `${this.url}/players/`;

		if (id) {
			query += id;
		}

		return this.$http.get(query);
	}

	update(data) {
		return this.$http.post(`${this.url}/players`, data);
	}
}
