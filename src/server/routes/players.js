var express = require('express'),
	mongoose = require('mongoose'),
	logger = require('loggy'),
	config = require('../config/config'),
	Player = require('../models/PlayerModel.js').model,
	players = express.Router();

players.delete('/:id?', function(req, res, next) {
	if (req.params.id) {
		// Remove single player
		Player.findByIdAndRemove(req.params.id)
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(apiError(err));
			});
	} else {
		// Remove ALL players
		Player.remove()
			.then(function() {
				res.status(200).json();
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(apiError(err));
			});
	}
});

players.get('/:id?', function(req, res, next) {
	var query = {};

	logger.info('GET /players/:id -> ', query, req.session.id);

	Player
		.find(query).exec()
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

players.post('/:id?', function(req, res, next) {
	logger.info('POST /players/:id -> ', req.session.id);

	let playerId = req.params.id,
		addPlayer = function() {
			let playerDefaults = {
					sessionId: req.session.id,
					name: config.getRandomStr(8),
					img: config.playerImage
				},
				pData = Object.assign(playerDefaults, req.body),
				pl = new Player(pData);

			logger.info('addPlayer() ');

			pl.save()
				.then(function(doc) {
					logger.info('Player.save()', pl);

					wss.broadcast(
						{ type: 'players', action: 'create', nuts: pl },
						req.session.id,
						false
					);

					res.status(201).json(pl);
				})
				.catch(function(err) {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		},
		updatePlayer = function(id) {
			let player = { _id: id },
				options = { new: true };

			Player.findOneAndUpdate(player, req.body, options)
				.then(function(doc) {
					if (doc) {
						res.status(200).json(doc);
						wss.broadcast(
							{ type: 'players', action: 'update', nuts: doc },
							req.session.id,
							true
						);
					} else {
						res.status(204).json([]);
					}
				})
				.catch(function(err) {
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
		updatePlayer(playerId);
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
