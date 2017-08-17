var express = require('express'),
	logger = require('loggy'),
	config = require('../config/config'),
	validator = require('validator'),
	players = express.Router(),
	playerMod = require('./modules/player'),
	Player = require('../models/PlayerModel').model;

logger.log(playerMod);

players.delete('/:id?', function(req, res) {
	if (req.params.id) {
		// Remove single player
		Player.findByIdAndRemove(req.params.id)
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Remove ALL players
		Player.remove()
			.then(function() {
				res.status(200).json();
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	}
});

players.get('/:id?', function(req, res) {
	var query = {};

	logger.info('GET /players/:id -> ', query, req.session.id);

	Player
		.find(query)
		.populate('actionCard')
		.exec()
		.then(function(list) {
			if (list.length === 0) {
				res.status(204);
			}

			res.json(list);
		})
		.catch(function(err) {
			if (err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));

				return [];
			}
		});
});

players.post('/:id?', function(req, res) {
	logger.info('POST /players/:id -> ', req.session.id);

	let playerId = req.params.id,
		validatePlayer = (pl) => {
			if (pl.name) {
				pl.name = validator.stripLow(validator.escape(pl.name));

				if (pl.name.length > 24) {
					let err = `The name you provided (${pl.name}) is longer than 24 chars!`;

					return err;
				}
			}

			return pl;
		},
		addPlayer = () => {
			let playerDefaults = {
					sessionId: req.session.id,
					name: config.getRandomStr(8),
					img: config.playerImage
				},
				pData = Object.assign({}, playerDefaults, req.body);

			logger.log('pData -> ', pData);

			pData = validatePlayer(pData);

			if (!pData) {
				return false;
			}

			let pl = new Player(pData);

			pl.save()
				.then(() => {
					logger.info('Player.save()', pl);

					/* eslint-disable no-undef */
					wss.broadcast(
						{ type: 'players', action: 'create', nuts: pl },
						req.session.id,
						false
					);
					/* eslint-enable no-undef */

					res.status(201).json(pl);
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		};

	if (!req.session.id) {
		logger.error('!!Possible Attack!!', req);
		res.status(500).json(config.apiError('ALERT: Missing required sessionId!!'));
		return false;
	}

	if (playerId) {
		let plData = validatePlayer(req.body);

		if (typeof plData !== 'object') {
			res.status(500).json(config.apiError(plData));
			return false;
		}

		playerMod
			.update(playerId, plData, req.session.id)
			.then(doc => {
				let statusCode = doc ? 200 : 204,
					data = doc ? doc : [];

				res.status(statusCode).json(data);
			})
			.catch(err => {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	} else {
		// Add new player, if the maximum players hasn't been reached
		Player
			.find({}).exec()
			.then(function(list) {
				var totalPlayers = list.length;

				logger.info('Total Players:', totalPlayers);

				if (totalPlayers === 6) {
					logger.error('TOO MANY PLAYERS!');
					res.status(500).json(config.apiError());

					return false;
				}

				addPlayer();
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(config.apiError(err));
			});
	}
});

module.exports = players;
