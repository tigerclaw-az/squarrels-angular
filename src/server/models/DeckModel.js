var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Card = require('./CardModel'),
	DeckSchema = new Schema({
		type: {
			type: String,
			required: true
		},
		cards: [{
			type: Schema.Types.ObjectId,
			ref: 'Card'
		}]
	}, {
		collection: 'decks',
		timestamps: true,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	});

module.exports = {
	schema: DeckSchema,
	model: mongoose.model('Deck', DeckSchema)
};
