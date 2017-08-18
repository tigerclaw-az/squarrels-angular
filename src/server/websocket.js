module.exports = function(server) {
	var	cookie = require('cookie'),
		cookieParser = require('cookie-parser'),
		logger = require('loggy'),
		playerMod = require('./routes/modules/player'),
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
		logger.log('broadcast() -> ', data, sid, all);
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

		logger.log('Connection accepted:', req.headers, req.session);
		logger.log(`Clients Connected: ${wss.clients.size}`);
		logger.log('sid -> ', sid);

		// Save sessionID against the array of
		// clients so we can reference later
		CLIENTS[sid] = ws;

		ws.send(JSON.stringify({ action: 'connected', type: 'global' }));

		// This is the most important callback for us, we'll handle
		// all messages from users here.
		ws.on('message', function(message) {
			var data = JSON.parse(message),
				query = {
					sessionId: sid
				},
				wsData = data;

			// Process WebSocket message
			logger.log('Message received: ', data);
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

						// Remove actionCard from player
						playerMod
							.update(data.playerAction.id, { actionCard: null }, sid)
							.then(() => {
								wss.broadcast(wsData, sid);
								hoardPlayer = null;
							})
							.catch(err => {
								logger.error(err);
							})
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
			logger.info('Connection Closed:', connection);
		});
	});

	global.wss = wss;

	return wss;
};
