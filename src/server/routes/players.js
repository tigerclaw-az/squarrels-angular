var express = require('express'),
	mongoose = require('mongoose'),
	logger = require('loggy'),
	Player = require('../models/PlayerModel.js'),
	players = express.Router();

players.delete('/:id?', function(req, res, next) {
	var removeFn = function(err) {
		if (err) {
			logger.error(err);
			res.status(500).json(err);
			return;
		}

		res.sendStatus(200);
	};

	if (req.params.id) {
		// Remove single player
		Player.findByIdAndRemove(req.params.id, removeFn);
	} else {
		// Remove ALL players
		Player.remove(removeFn);
	}
});

players.get('/:id?', function(req, res, next) {
	var query = {};

	if (req.params.id) {
		query._id = req.params.id;
	}

	logger.info('/players/:id -> ', query);

	Player.find(query, function(err, list) {
		if (err) {
			logger.error(err);
			res.status(500).json(err);

			return [];
		}

		if (list.length === 0) {
			res.status(204);
		}

		res.json(list);
	});
});

players.post('/:id?', function(req, res, next) {
	var pl;

	if (req.params.id) {
		// Update player
	} else {
		pl = new Player(req.body);

		pl.save(function(err) {
			if (err) {
				logger.error(err);
				res.status(500).json(err);
			}

			res.status(201).json(pl);
		});
	}
});

module.exports = players;
