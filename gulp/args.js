/* jshint node: true */
'use strict';

// Dependencies
var args = require('yargs').argv;

// Export
module.exports = {
	env: args.env === 'production'
};
