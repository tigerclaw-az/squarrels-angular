export function routerConfig($stateProvider, $urlRouterProvider) {
	'ngInject';

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('app', {
			abstract: true,
			url: '',
			controller: 'mainController',
			controllerAs: 'mainCtrl',
			templateUrl: 'main/main.tpl.html',
			resolve: {

			}
		})
		.state('app.start', {
			url: '/'
		})
		.state('app.game', {
			url: '/game',
			views: {
				content: {
					controller: 'gameController as gameCtrl',
					templateUrl: 'components/game/game.tpl.html'
				}
			}
		});
}
