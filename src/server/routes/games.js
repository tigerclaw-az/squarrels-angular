var express = require('express'),
	logger = require('loggy'),
	config = require('../config/config'),
	games = express.Router();

const GameModel = require('../models/GameModel').model;

games.delete('/:id?', function(req, res, next) {
	if (req.params.id) {
		// Remove single game
		GameModel
			.findByIdAndRemove(req.params.id)
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(apiError(err));
			});
	} else {
		// Remove ALL games
		GameModel
			.remove()
			.then(function() {
				res.sendStatus(200);
			})
			.catch(function(err) {
				logger.error(err);
				res.status(500).json(apiError(err));
			});
	}
});

games.get('/:id?', function(req, res, next) {
	var query = {};

	logger.info('GET /games/:id -> ', query, req.session.id);

	GameModel
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

games.post('/', function(req, res, next) {
	logger.info('POST /games/ -> ', req.session.id);

	const CardModel = require('../models/CardModel').model,
		DeckModel = require('../models/DeckModel').model;

	CardModel
		.find({}).exec()
		.then(cards => {
			let mainDeck = new DeckModel({
					type: 'main',
					cards: cards
				}),
				discardDeck = new DeckModel({
					type: 'discard'
				});

			// Create both decks, and store promises to be used later
			deckPromises = [
				DeckModel.create(mainDeck),
				DeckModel.create(discardDeck)
			];

			Promise
				.all(deckPromises)
				.then((decks) => {
					logger.info('decks -> ', decks);

					let game = new GameModel({
						players: req.body,
						decks: [decks[0].id, decks[1].id]
					});

					GameModel
						.create(game)
						.then(function() {
							logger.info('Game.create()', game);

							wss.broadcast(
								{ type: 'games', action: 'create', nuts: game },
								req.session.id,
								false
							);

							res.status(201).json(game);
						})
						.catch(function(err) {
							logger.error(err);
							res.status(500).json(config.apiError(err));
						});
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = games;
