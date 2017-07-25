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
			// resolve: {
			// 	// Ensure that puzzles are loaded properly before other route(s) that
			// 	// requires them is run.
			// 	puzzlesLoaded: (puzzleStore) => {
			// 		'ngInject';

			// 		return puzzleStore.loadPuzzles('puzzles.json');
			// 	}
			// }
		})
		.state('app.home', {
			url: '/'
		})
		;
}
