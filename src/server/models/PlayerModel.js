var mongoose = require('mongoose'),
	uuid = require('uuid/v1'),
	CardsModel = require('./CardsModel'),
	Schema = mongoose.Schema,
	PlayerSchema = new Schema({
		name: {
			type: String,
			trim: true
		},
		img: String,
		isActive: {
			type: Boolean,
			default: false
		},
		score: {
			type: Number,
			default: 0
		},
		cardsInHand: [Schema.Types.ObjectId],
		cardsUsed: [Schema.Types.ObjectId]
	}, {
		collection: 'players',
		timestamps: true
	});

module.exports = mongoose.model('Player', PlayerSchema);
