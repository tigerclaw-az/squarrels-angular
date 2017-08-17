var logger = require('loggy'),
	Q = require('q'),
	Player = require('../../models/PlayerModel.js').model;

let playerMod = {
	update: (id, data, sid) => {
		let playerId = { _id: id },
			options = { new: true },
			defer = Q.defer();

		Player
			.findOneAndUpdate(playerId, data, options)
			.populate('actionCard')
			.then(doc => {
				/* eslint-disable no-undef */
				wss.broadcast(
					{ type: 'players', action: 'update', nuts: doc },
					sid
				);
				/* eslint-enable no-undef */

				defer.resolve(doc);
			})
			.catch(err => {
				defer.reject(err);
			});

		return defer.promise;
	}
};

module.exports = playerMod;
