var mongoose = require('mongoose'),
	logger = require('loggy'),
	config = require('./config');

mongoose.Promise = require('q').Promise;
mongoose.connect(`mongodb://${config.server}/squarrels`, function(err) {
	if (err) {
		logger.error('mongodb connection error', err);
	} else {
		logger.info('mongodb connection successful');
	}
});
