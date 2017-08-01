module.exports = function(server, sessionParser, store) {
	var	_ = require('lodash'),
		cookie = require('cookie'),
		cookieParser = require('cookie-parser'),
		WebSocket = require('ws'),
		Player = require('./models/PlayerModel').model;

	const logger = require('loggy');

	let wss = new WebSocket.Server({
		verifyClient: function(info, done) {
			logger.log('verifyClient() -> ', info.req.headers);
			done(info.req.headers);
		},
		server
	});

	wss.broadcastAll = function broadcastAll(data) {
		logger.info('broadcastAll() -> ', data.id);
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				logger.info('send()..');
				client.send(JSON.stringify(data));
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		let sid = cookieParser.signedCookie(cookie.parse(req.headers.cookie)['connect.sid'], '$eCuRiTy');
		logger.info('Connection accepted:', req.headers, req.session);
		logger.info(`Clients Connected: ${wss.clients.size}`);

		logger.info('sid -> ', sid);
		store.get(sid, function(err, ss) {
			logger.log('err -> ', err);
			logger.log('ss -> ', ss);
			logger.log(req.sessionID);
		});

		ws.send(JSON.stringify({ action: 'connected', type: 'global' }));

		wss.broadcast = function broadcast(data) {
			logger.info('broadcast() -> ', data.action, data.type);
			wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN && client !== ws) {
					logger.info('send()..');
					client.send(JSON.stringify(data));
				}
			});
		};

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message),
				// sessionId = cookieParser(req.headers.cookie, 'cookie.sid'),
				query = {
					// sessionId
				};

			// Process WebSocket message
			logger.info('Message received: ', data);

			switch(data.action) {
				case 'whoami':
					logger.info('websocket:onmessage:whoami -> ', query);

					Player.find(query)
						.select('+sessionId')
						.exec()
						.then(function(list) {
							let nuts = { action: 'whoami', type: 'players', nuts: list };

							logger.info(nuts);
							ws.send(JSON.stringify(nuts));
						})
						.catch(function(err) {
							logger.error(err);
						});
					break;

				default:
					wss.broadcastAll(data);
					break;
			}
		});

		ws.on('error', function(err) {
			logger.error(err);
		});

		ws.on('close', function(connection) {
			// close user connection
			logger.info('Connection Closed:', connection, wss.clients);
		});
	});

	global.wss = wss;

	return wss;
}
