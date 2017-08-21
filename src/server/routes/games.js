var _ = require('lodash'),
	config = require('../config/config'),
	logger = config.logger('routes:games'),
	games = require('express').Router();

const DeckModel = require('../models/DeckModel').model;
const GameModel = require('../models/GameModel').model;
const PlayerModel = require('../models/PlayerModel').model;

games.delete('/:id', function(req, res) {
	let id = req.params.id,
		sessionId = req.session.id;

	logger.debug('games:delete -> ', id);

	GameModel
		.findById(id)
		.exec()
		.then(game => {
			let decks = game.decks,
				players = game.players,
				playerUpdate = {
					actionCard: null,
					cardsInHand: [],
					cardsInStorage: [],
					isFirstTurn: true,
					isActive: false,
					score: 0,
					totalCards: 0
				};

			logger.debug('decks -> ', decks);

			DeckModel
				.deleteMany({ '_id': { $in: decks } })
				.then(() => {
					/* eslint-disable no-undef */
					wss.broadcast(
						{ type: 'decks', action: 'remove' },
						sessionId
					);
					/* eslint-enable no-undef */

					logger.debug('players -> ', players);

					PlayerModel
						.updateMany({ '_id': { $in: players } }, playerUpdate)
						.then(() => {
							/* eslint-disable no-undef */
							wss.broadcast(
								{ type: 'players', action: 'update', nuts: playerUpdate },
								sessionId
							);
							/* eslint-enable no-undef */

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
				})
				.catch(err => {
					logger.error(err);
					res.status(500).json(config.apiError(err));
				});
		});
});

games.get('/:id?', function(req, res) {
	var query = {};

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
	let sessionId = req.session.id;

	const CardModel = require('../models/CardModel').model;
	const DeckModel = require('../models/DeckModel').model;

	CardModel
		.find({})
		.exec()
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
				.then(decks => {
					let game = new GameModel({
						isGameStarted: true,
						players: req.body,
						decks: [decks[0].id, decks[1].id]
					});

					GameModel
						.create(game)
						.then(() => {
							/* eslint-disable no-undef */
							wss.broadcast(
								{ type: 'games', action: 'create', nuts: game },
								sessionId,
								false
							);

							wss.broadcast(
								{ type: 'decks', action: 'create', nuts: mainDeck },
								sessionId,
								false
							);

							wss.broadcast(
								{ type: 'decks', action: 'create', nuts: hoardDeck },
								sessionId,
								false
							);
							/* eslint-enable no-undef */

							res.status(201).json(game);
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
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json(config.apiError(err));
		});
});

module.exports = games;
