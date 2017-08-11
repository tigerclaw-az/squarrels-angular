var _ = require('lodash');

module.exports = {
	/* eslint quotes: "off" */
	apiError: function(err) {
		if (!err) {
			err = "I'm sorry Dave, I'm afraid I can't do that.";
		}

		return {
			error: err
		};
	},

	getRandom(from, to) {
		return Math.random() * (to - from) + from;
	},

	getRandomStr(num) {
		var self = this;

		return _.times(num, function() {
			return String.fromCharCode(self.getRandom(96, 122));
		}).join('').replace(/`/g, ' ');
	},

	server: 'localhost',

	playerImage: 'https://placeimg.com/120/120/animals'
}
