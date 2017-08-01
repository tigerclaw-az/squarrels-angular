export class WebSocketService {
	constructor($rootScope, $log, $websocket, appConfig, toastr, _) {
		'ngInject';

		this.$log = $log;
		this.$rootScope = $rootScope;
		this.$websocket = $websocket;

		this._ = _;
		this.toastr = toastr;

		this.host = `${appConfig.host}:3000`;

		this.connect();

		this.$log.info('constructor()', this);
	}

	connect() {
		this.$ws = this.$websocket(`ws://${this.host}`);

		this.$log.info('ws', this.$ws);

		this.$ws.onMessage(this.onMessage.bind(this));
		this.$ws.onError(this.onError.bind(this));
	}

	send(msg) {
		var message = typeof msg === 'object' ? JSON.stringify(msg) : msg;

		this.$log.info('send(obj)', message);

		this.$ws.send(msg);
	}

	onError(msg) {
		this.$log.info('onError()', msg);

		this.toastr.error('websocket:error', msg);
	}

	// TODO: Watch for a message coming back from any service using the websocketService
	onMessage(msg) {
		var data = JSON.parse(msg.data),
			action = data.action || 'none',
			type = data.type || 'global',
			broadcast;

		this.$log.info('onMessage()', data, type, action, this);

		if (type === 'players') {
			switch (action) {
				case 'create':
				case 'whoami':
					data = data.nuts;
					break;

				default:
					break;
			}
		}

		// --- TESTING ONLY ---//
		this.toastr.info(`websocket:${type}:${action}`);

		this.$rootScope.$broadcast('websocket', msg);
		this.$rootScope.$broadcast(`websocket:${type}:${action}`, data);
	}
}
