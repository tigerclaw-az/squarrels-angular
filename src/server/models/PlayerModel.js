var mongoose = require('mongoose'),
	uuid = require('uuid/v1'),
	Schema = mongoose.Schema,
	PlayerSchema = new Schema({
		name: String
	}, {
		collection: 'players'
	});

module.exports = mongoose.model('Player', PlayerSchema);
