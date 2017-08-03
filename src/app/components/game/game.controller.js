export default class GameController {
	constructor($rootScope, $scope, $log, gamesApi, gameModel, playerModel, playersStore) {
		'ngInject';

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$log = $log;

		this.gamesApi = gamesApi;
		this.gameModel = gameModel;
		this.playerModel = playerModel;
		this.playersStore = playersStore;

		this.$log.info('constructor()', this);
	}

	$onInit() {
		this.$scope.isGameStarted = false;
		this.$scope.canStartGame = true;

		this.$scope.model = this.gameModel.model;

		// Should only fire for clients that didn't click 'New Game'
		this.$rootScope.$on('websocket:games:create', (event, data) => {
			this.$log.info('$on -> websocket:games:create', data);
			this.gameModel.update(data);
		});

		this.$log.info('$onInit()', this);
	}

	$onDestroy() {
		return () => {
			this.$log.info('destroy', this);
		};
	}

	create() {
		var playersData = this.playersStore.getAll(),
			players = [],
			onSuccess = (res => {
				if (res.status === 201) {
					this.$scope.isGameStarted = true;

					// Will only fire for the client that clicked 'New Game'
					this.gameModel.update(res.data);
				}
			}),
			onError = (err => {
				this.$log.error(err);
			});

		_.forEach(playersData, function(obj) {
			players.push(obj.id);
		});

		this.$scope.canStartGame = false;

		this.gamesApi
			.update(players)
			.then(onSuccess, onError);
	}
};
