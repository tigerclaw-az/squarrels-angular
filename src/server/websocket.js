module.exports = function(server) {
	var	_ = require('lodash'),
		uuid = require('uuid/v1'),
		Player = require('./models/PlayerModel').model,
		WebSocket = require('ws'),
		wss = new WebSocket.Server({ port: 1337, server });

	const log = require('loggy');

	log.info('server:', server);
	log.info('wss:', wss);

	var conn;

	wss.broadcast = function broadcast(data, all = true) {
		log.info('broadcast() -> ', data);
		wss.clients.forEach(function each(client) {
			log.info('client() -> ', client.readyState);
			if (client.readyState === WebSocket.OPEN) {
				if (all || client != conn) {
					log.info('send()!');
					client.send(JSON.stringify(data));
				}
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		log.info('Connection accepted:', ws);
		log.info(`Clients Connected: ${wss.clients.size}`);

		conn = ws;

		ws.send(JSON.stringify({ action: 'connected', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message),
				// sessionId = req.session.id,
				query = {
					// sessionId
				};

			log.info('Request:', req.session);
			// Process WebSocket message
			log.info('Message received: ', data);

			switch(data.action) {
				case 'create':
					wss.broadcast(data, false);
					break;

				case 'whoami':
					log.info('websocket:onmessage:whoami -> ', query);

					Player.find(query)
						.select('+sessionId')
						.exec()
						.then(function(list) {
							if (list.length !== 1) {
								list = [];
							}

							let nuts = { action: 'whoami', type: 'players', nuts: list };

							log.info(nuts);
							ws.send(JSON.stringify(nuts));
						})
						.catch(function(err) {
							log.error(err);
						});
					break;

				default:
					wss.broadcast(data);
					break;
			}
		});

		ws.on('error', function(err) {
			log.error(err);
		});

		ws.on('close', function(connection) {
			// close user connection
			log.info('Connection Closed:', connection, wss.clients);
		});
	});

	global.wss = wss;

	return wss;
}
