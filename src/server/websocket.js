module.exports = function(server) {
	var	cookie = require('cookie'),
		cookieParser = require('cookie-parser'),
		config = require('./config/config'),
		logger = config.logger('websocket'),
		WebSocket = require('ws');

	const Player = require('./models/PlayerModel').model;

	let wss = new WebSocket.Server({
			verifyClient: function(info, done) {
				// logger.log('verifyClient() -> ', info.req.session, info.req.headers);

				if (info.req.headers.cookie || info.req.session) {
					done(info.req);
				}
			},
			server
		}),
		hoardPlayer = null,
		CLIENTS = [];

	wss.broadcast = function broadcast(data, sid, all = true) {
		logger.debug('broadcast() -> ', data, sid, all);
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				if (all || client !== CLIENTS[sid]) {
					client.send(JSON.stringify(data));
				}
			}
		});
	};

	wss.on('connection', function connection(ws, req) {
		let parseCookie = cookie.parse(req.headers.cookie)['connect.sid'],
			sid = cookieParser.signedCookie(parseCookie, '$eCuRiTy');

		logger.info('Connection accepted:', sid);
		logger.info('Clients Connected: %s', wss.clients.size);

		// Save sessionID against the array of
		// clients so we can reference later
		CLIENTS[sid] = ws;

		ws.send(JSON.stringify({ action: 'connect', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message),
				query = {
					sessionId: sid
				},
				wsData = data;

			// Process WebSocket message
			logger.debug('Message received: ', data);
			logger.log(`websocket:onmessage:${data.action} -> `, query);

			switch (data.action) {
				case 'hoard':
					delete data.playerHoard.cardsInHand;

					wsData = {
						action: 'hoard',
						type: 'player' + (!hoardPlayer ? 's' : ''),
						nuts: data.playerHoard
					};

					if (!hoardPlayer) {
						hoardPlayer = query;

						// Remove actionCard from game

						// playerMod
						// 	.update(data.playerAction.id, { actionCard: null }, sid)
						// 	.then(() => {
						// 	FIXME: HACK!!
						setTimeout(() => {
							wss.broadcast(wsData, sid);
							hoardPlayer = null;
						}, 250);
						// 	})
						// 	.catch(err => {
						// 		logger.error(err);
						// 	})
					} else {
						ws.send(JSON.stringify(wsData));
					}

					break;

				case 'whoami':
					Player
						.find(query)
						.select('+sessionId +cardsInHand')
						.populate('actionCard')
						.exec()
						.then(list => {
							wsData = { action: 'whoami', type: 'players', nuts: list };

							ws.send(JSON.stringify(wsData));
						})
						.catch(err => {
							logger.error(err);
						});
					break;

				default:
					wss.broadcast(wsData);
					break;
			}
		});

		ws.on('error', function(err) {
			logger.error(err);
		});

		ws.on('close', function(connection) {
			// close user connection
			logger.warn('Connection Closed:', connection);
		});
	});

	global.wss = wss;

	return wss;
};
