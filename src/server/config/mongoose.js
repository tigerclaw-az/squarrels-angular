var mongoose = require('mongoose'),
	logger = require('loggy'),
	config = require('./config');

mongoose.Promise = require('q').Promise;
mongoose.set('debug', true);

module.exports = function() {
	return mongoose.connect(`mongodb://${config.server}/squarrels`);
};
