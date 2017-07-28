module.exports = function(wss) {
	var	_ = require('lodash'),
		WebSocket = require('ws'),
		Player = require('./models/PlayerModel');

	const log = require('loggy');

	wss.broadcast = function broadcast(data, ws, all = true) {
		log.info(`broadcast(): ${data}`);
		wss.clients.forEach(function each(client) {
			log.info(`client: ${client}`);

			if (client.readyState === WebSocket.OPEN) {
				if (all || client != ws) {
					client.send(JSON.stringify(data));
				}
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		log.info(`Connection accepted: ${req.connection.remoteAddress}`);
		log.info(`Clients Connected: ${wss.clients.size}`);

		wss.broadcast({ action: 'connected', type: 'ws' }, ws);

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message);

			// Process WebSocket message
			log.info(`Message received: ${data}`);

			switch(data.action) {
				case 'create':
					wss.broadcast(data, ws, false);
					break;
				default:
					wss.broadcast(data, ws);
					break;
			}
		});

		ws.on('close', function(connection) {
			// close user connection
		});
	})
};
