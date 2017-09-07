var Q = require('q'),
	Player = require('../../models/PlayerModel.js').model;

let playerMod = {
	get: (data = {}) => {
		return Player
			.find(data)
			.select('+cardsInHand')
			.exec();
	},
	update: (id, data, sid) => {
		let playerId = { _id: id },
			options = { new: true },
			defer = Q.defer();

		if (data.cardsInHand) {
			data.totalCards = data.cardsInHand.length;
		}

		Player
			.findOneAndUpdate(playerId, data, options)
			.then(doc => {
				let wsData = {
					action: 'update',
					nuts: doc,
					type: 'players'
				};

				/* eslint-disable no-undef */
				wss.broadcast(wsData, sid);
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
