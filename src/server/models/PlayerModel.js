var mongoose = require('mongoose'),
	uuid = require('uuid/v1'),
	Card = require('./CardModel'),
	Schema = mongoose.Schema,
	PlayerSchema = new Schema({
		sessionId: {
			type: String,
			required: true,
			select: false
		},
		name: {
			type: String,
			required: true,
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
		cardsInHand: {
			type: [Schema.Types.ObjectId],
			ref: Card.model,
			select: false
		},
		cardsUsed: {
			type: [Schema.Types.ObjectId],
			ref: Card.model
		}
	}, {
		collection: 'players',
		timestamps: true
	});

const log = require('loggy');

PlayerSchema.set('toJSON', {
	transform: function(doc, ret, options) {
		delete ret._id;
		return ret;
	},
	virtuals: true
});

module.exports = {
	schema: PlayerSchema,
	model: mongoose.model('Player', PlayerSchema)
};
