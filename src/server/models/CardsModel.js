var mongoose = require('mongoose'),
	uuid = require('uuid/v1'),
	Schema = mongoose.Schema,
	CardsSchema = new Schema({
		name: String
	}, {
		collection: 'cards'
	});

module.exports = {
	schema: CardsSchema,
	model: mongoose.model('Cards', CardsSchema)
};
