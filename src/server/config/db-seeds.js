var config = require('./config'),
	logger = require('loggy'),
	mongoose = require('mongoose');

let CardModel = require('../models/CardModel').model,
	cardSeeds = require('../seeds/cards.json');

logger.info(cardSeeds);

CardModel
	.remove()
	.then(() => {
		let promisses = [];

		cardSeeds.forEach(entry => {
			promisses.push(CardModel.create(entry));
		});

		Promise.all(promisses)
			.then(() => {
				logger.success('All cards have been populated successfully!');
			})
			.catch(err => {
				logger.error('Error populating data: ', err);
			});
	});
