export class WebSocketService {
	constructor($rootScope, $log, $websocket, appConfig, toastr, _) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$log = $log.getInstance(this.constructor.name);
		this.$websocket = $websocket;

		this._ = _;
		this.toastr = toastr;

		this.host = `${appConfig.host}:3000`;
		this.options = {
			maxTimeout: 60 * 1000,
			reconnectIfNotNormalClose: true
		};

		this.$ws = null;

		this.STATUS = {
			CONNECTING: 0,
			OPEN: 1,
			CLOSING: 2,
			CLOSED: 3
		}

		this.$log.debug('constructor()', this);
	}

	close() {
		this.$ws.close();
	}

	connect() {
		this.$ws = this.$websocket(`ws://${this.host}`, this.options);

		this.$log.debug('ws', this.$ws);

		this.$ws.onClose(this.onClose.bind(this));
		this.$ws.onError(this.onError.bind(this));
		this.$ws.onMessage(this.onMessage.bind(this));
	}

	getStatus() {
		return this.$ws.readyState;
	}

	onClose(data) {
		this.$log.warn('onClose()', data);

		this.$rootScope.$broadcast('websocket:global:close', data);
	}

	onError(msg) {
		this.$log.error(msg);
		this.toastr.error('websocket:error');

		this.$rootScope.$broadcast('websocket:error', msg);
	}

	onMessage(msg) {
		var data = JSON.parse(msg.data),
			action = data.action || 'none',
			type = data.type || 'global';

		this.$log.debug('onMessage()', data, type, action, this);

		if (data.nuts) {
			data = data.nuts;
		}

		this.$rootScope.$broadcast('websocket:message', msg);
		this.$rootScope.$broadcast(`websocket:${type}:${action}`, data);
	}

	send(msg) {
		var message = typeof msg === 'object' ? JSON.stringify(msg) : msg;

		this.$log.debug('send()', message, this);

		this.$ws.send(msg);
	}
}
