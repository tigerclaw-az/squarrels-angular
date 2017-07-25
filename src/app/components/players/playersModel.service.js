export class PlayersModelService {
	constructor($log, $http, _, playersApi, websocket) {
		'ngInject';

		this.$log = $log;
		this.$http = $http;
		this._ = _;
		this.playersApi = playersApi;
		this.ws = websocket;

		this.players = [];
		this.playerData = null;
	}

	newPlayer() {
		var self = this;

		this.$http.post(`${this.playersApi.url}/players`, { name: 'WOOHOO' })
			.then(function(res) {
				self.$log.info(res);

				if (res.status === 201) {
					// angular.copy(res.data, self.playersModel.playerData);
					self.playerData = res.data;
					self.players.push(self.playerData);

					self.ws.send({
						action: 'new',
						data: self.playerData
					});
				}
			}, function(res) {
				self.$log.error(res);
			})
		;
	}
}
