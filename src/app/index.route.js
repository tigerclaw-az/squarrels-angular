export function routerConfig($stateProvider, $urlRouterProvider) {
	'ngInject';

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('app', {
			abstract: true,
			url: '',
			controller: 'mainController as mainCtrl',
			templateUrl: 'main/main.tpl.html',
			resolve: {

			}
		})
		.state('app.start', {
			url: '/',
			views: {
				content: {
					component: 'start'
				}
			}
		})
		.state('app.game', {
			resolve: {
				player: (playerModel) => {
					'ngInject';
					return playerModel.model.player;
				}
			},
			url: '/game',
			views: {
				content: {
					component: 'game'
				}
			}
		});
}
