export default class GameController {
	constructor($rootScope, $scope, $log, gamesApi, gameModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playersStore = playersStore;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		var self = this;

		this.$scope.isGameStarted = false;
		this.$scope.canStartGame = true;

		this.$scope.model = this.gameModel.model;

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', function(event, data) {
			self.$log.info('$on -> websocket:games:create', data);
			self.gameModel.update(data);
		});

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	newGame() {
		var self = this,
			playersData = this.playersStore.getAll(),
			players = [];

		_.forEach(playersData, function(obj) {
			players.push(obj.id);
		});

		this.$scope.canStartGame = false;

		this.gamesApi.update(players)
			.then(function(res) {
				if (res.status === 201) {
					self.$scope.isGameStarted = true;

					// Will only fire for the client that clicked 'New Game'
					self.gameModel.update(res.data);
				}
			})
			.catch(function() {

			});
	}
};
