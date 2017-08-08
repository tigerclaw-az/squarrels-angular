var mongoose = require('mongoose'),
	uuid = require('uuid/v1'),
	Card = require('./CardModel'),
	Schema = mongoose.Schema,
	PlayerSchema = new Schema({
		cardsInHand: {
			type: [Schema.Types.ObjectId],
			ref: Card.model,
			select: false
		},
		cardsInStorage: {
			type: [Schema.Types.ObjectId],
			ref: Card.model
		},
		img: {
			type: String
		},
		isActive: {
			type: Boolean,
			default: false
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		score: {
			type: Number,
			default: 0
		},
		sessionId: {
			type: String,
			required: true,
			select: false
		},
		isFirstTurn: {
			type: Boolean,
			default: true
		},
		totalCards: {
			type: Number,
			default: 0
		}
	}, {
		collection: 'players',
		timestamps: true,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	});

module.exports = {
	schema: PlayerSchema,
	model: mongoose.model('Player', PlayerSchema)
};
