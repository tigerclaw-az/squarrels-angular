export class WebSocketService {
	constructor($rootScope, $log, $websocket, appConfig, toastr, _) {
		'ngInject';

		this.$log = $log;
		this.$rootScope = $rootScope;
		this.$websocket = $websocket;

		this._ = _;
		this.toastr = toastr;

		this.host = `${appConfig.host}:3000`;
		this.options = {
			maxTimeout: 60 * 1000,
			reconnectIfNotNormalClose: true
		};

		this.$log.info('constructor()', this);
	}

	close() {
		this.$ws.close();
	}

	connect() {
		this.$ws = this.$websocket(`ws://${this.host}`, this.options);

		this.$log.info('ws', this.$ws);

		this.$ws.onClose(this.onClose.bind(this));
		this.$ws.onError(this.onError.bind(this));
		this.$ws.onMessage(this.onMessage.bind(this));
	}

	getStatus() {
		return this.$ws.readyState;
	}

	onClose(data) {
		this.$log.error('onClose()', data);

		this.$rootScope.$broadcast('websocket:close', data);
	}

	onError(msg) {
		this.$log.info('onError()', msg);

		this.toastr.error('websocket:error', msg);

		this.$rootScope.$broadcast('websocket:error', msg);
	}

	onMessage(msg) {
		var data = JSON.parse(msg.data),
			action = data.action || 'none',
			type = data.type || 'global';

		this.$log.info('onMessage()', data, type, action, this);

		if (data.nuts) {
			data = data.nuts;
		}

		this.$rootScope.$broadcast('websocket:message', msg);
		this.$rootScope.$broadcast(`websocket:${type}:${action}`, data);
	}

	send(msg) {
		var message = typeof msg === 'object' ? JSON.stringify(msg) : msg;

		this.$log.info('send(obj)', message);

		this.$ws.send(msg);
	}
}
