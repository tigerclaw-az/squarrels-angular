export class WebSocketService {
	constructor($rootScope, $log, appConfig, toastr, _) {
		'ngInject';

		this.$log = $log;
		this.$rootScope = $rootScope;

		this._ = _;
		this.toastr = toastr;

		this.host = `${appConfig.localhost}:1337`;

		// if user is running mozilla then use it's built-in WebSocket
		this.WebSocket = (window.WebSocket || window.MozWebSocket);

		this.connection = new this.WebSocket(`ws://${this.host}`);

		this.$log.info('connection', this.connection);

		this.connection.onmessage = this.onMessage.bind(this);

		this.$log.info('constructor()', this);
	}

	send(obj) {
		var message = typeof obj === 'object' ? JSON.stringify(obj) : obj;

		this.$log.info('send(obj)', message);

		this.connection.send(message);
	}

	// TODO: Watch for a message coming back from any service using the websocketService
	onMessage(msg) {
		var data = JSON.parse(msg.data),
			action = data.action || 'none',
			type = data.type || 'global',
			broadcast;

		this.$log.info('onMessage()', data, type, action, this);

		if (type === 'player') {
			switch(action) {
				case 'create':
					data = data.nuts;
					break;
				default:
					break;
			}
		}

		//--- TESTING ONLY ---//
		this.toastr.info(JSON.stringify(data), `websocket:${type}:${action}`);

		this.$rootScope.$broadcast('websocket', msg);
		this.$rootScope.$broadcast(`websocket:${type}:${action}`, data);
	}
}
