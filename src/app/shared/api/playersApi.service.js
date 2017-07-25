export class PlayersApiService {
	constructor($log, _) {
		'ngInject';

		this._ = _;
		this.$log = $log;

		this.host = 'localhost:3000';
		this.url = `http://${this.host}/api`;

		this.$log.info('constructor()', this);
	}
}
