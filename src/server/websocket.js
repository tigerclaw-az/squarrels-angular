module.exports = function(wss) {
	var	_ = require('lodash'),
		WebSocket = require('ws'),
		Player = require('./models/PlayerModel');

	const log = require('loggy');

	wss.broadcast = function broadcast(data) {
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		log.info(`Connection accepted: ${req.connection.remoteAddress}`);
		log.info(`Clients Connected: ${wss.clients.size}`);

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data;

			if (message.type === 'utf8') {
				data = JSON.parse(message.utf8Data);

				// Process WebSocket message
				log.info(`Message received: ${data}`);
			}
		});

		ws.on('close', function(connection) {
			// close user connection
		});
	})
};
