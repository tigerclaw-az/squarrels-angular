var _ = require('lodash'),
	logger = require('loggy'),
	config = require('../config/config'),
	cards = require('express').Router();

const CardModel = require('../models/CardModel').model;

cards.get('/:id', function(req, res, next) {
	var ids = req.params.id.split(',');

	logger.info('GET /cards/ -> ', ids, req.session.id);

	CardModel
		.find()
		.where('_id')
		.in(ids)
		.exec()
		.then(function(list) {
			if (list.length === 0) {
				res.status(204);
			}

			res.status(200).json(list);
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = cards;
