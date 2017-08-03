var _ = require('lodash'),
	logger = require('loggy'),
	config = require('../config/config'),
	decks = require('express').Router();

const DeckModel = require('../models/DeckModel').model;

decks.get('/:id?', function(req, res, next) {
	var query = {},
		deckId = req.params.id;

	logger.info('GET /decks/:id -> ', query, req.session.id);

	if (deckId) {
		query = { _id: deckId };
	}

	DeckModel
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
			}
		});
});

module.exports = decks;
