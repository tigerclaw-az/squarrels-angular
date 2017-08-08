var _ = require('lodash'),
	logger = require('loggy'),
	config = require('../config/config'),
	games = require('express').Router();

const GameModel = require('../models/GameModel').model;

games.delete('/:id?', function(req, res, next) {
	let action;

	if (req.params.id) {
		// Remove single game
		// TODO: Remove associated decks to game
		action = GameModel.findByIdAndRemove(req.params.id);
	} else {
		// Remove ALL games
		// TODO: Remove all decks as well
		action = GameModel.remove();
	}

	action
		.then(function() {
			res.sendStatus(200);
		})
		.catch(function(err) {
			logger.error(err);
			res.status(500).json(apiError(err));
		});
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
					deckType: 'main',
					cards: _.shuffle(cards)
				}),
				hoardDeck = new DeckModel({
					deckType: 'discard'
				});

			// Create both decks, and store promises to be used later
			deckPromises = [
				DeckModel.create(mainDeck),
				DeckModel.create(hoardDeck)
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
