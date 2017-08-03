var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	CardSchema = new Schema({
		name: {
			type: String,
			required: true
		},
		amount: {
			type: Number,
			required: true
		},
		cardType: {
			type: String,
			required: true
		},
		action: {
			type: String
		}
	}, {
		collection: 'cards',
		timestamps: false
	});

module.exports = {
	schema: CardSchema,
	model: mongoose.model('Card', CardSchema)
};
