var mongoose = require('mongoose'),
	logger = require('loggy');

mongoose.Promise = require('q').Promise;
mongoose.connect('mongodb://localhost:27017/squarrels', function(err) {
	if (err) {
		logger.error('mongodb connection error', err);
	} else {
		logger.info('mongodb connection successful');
	}
});
