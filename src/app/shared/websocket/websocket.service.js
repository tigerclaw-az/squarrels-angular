export class WebsocketService {
	constructor($log, _) {
		'ngInject';

		this._ = _;
		this.$log = $log;

		this.$log.info('constructor()', this);

		this.host = 'localhost:1337';

		// if user is running mozilla then use it's built-in WebSocket
		window.WebSocket = window.WebSocket || window.MozWebSocket;

		this.connection = new WebSocket(`ws://${this.host}`);

		this.$log.info('connection', this.connection);

		this.connection.onmessage = this.onMessage;
	}

	send(obj) {
		var message = typeof obj === 'object' ? JSON.stringify(obj) : obj;

		this.$log.info('send(obj)', message);

		this.connection.send(message);
	}

	onMessage() {
		this.$log.info('onMessage()', arguments);
	}
}
