var _ = require('lodash'),
	logger = require('loggy'),
	config = require('../config/config'),
	games = require('express').Router();

const DeckModel = require('../models/DeckModel').model;
const GameModel = require('../models/GameModel').model;
const PlayerModel = require('../models/PlayerModel').model;

games.delete('/:id', function(req, res) {
	let id = req.params.id;

	GameModel
		.findById(id)
		.exec()
		.then(game => {
			let decks = game.decks,
				players = game.players,
				playerUpdate = {
					cardsInHand: [],
					cardsInStorage: [],
					isFirstTurn: true,
					isActive: false,
					score: 0,
					totalCards: 0
				};

			logger.info('game -> ', game);

			DeckModel
				.deleteMany({ '_id': { $in: decks } })
				.then(() => {
					PlayerModel
						.updateMany({ '_id': { $in: players } }, playerUpdate)
						.then(() => {
							GameModel
								.remove({ _id: game.id })
								.then(function() {
									res.sendStatus(200);
								})
								.catch(function(err) {
									logger.error(err);
									res.status(500).json(config.apiError(err));
								})
						});
				});
		});
});

games.get('/:id?', function(req, res) {
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

games.post('/', function(req, res) {
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
				}),
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

							/* eslint-disable no-undef */
							wss.broadcast(
								{ type: 'games', action: 'create', nuts: game },
								req.session.id,
								false
							);

							wss.broadcast(
								{ type: 'decks', action: 'create', nuts: mainDeck },
								req.session.id,
								false
							);

							wss.broadcast(
								{ type: 'decks', action: 'create', nuts: hoardDeck },
								req.session.id,
								false
							);
							/* eslint-enable no-undef */

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
