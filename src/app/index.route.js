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
				// Ensure that we have a connection to the websocket
				connectWs: ($q, $log, websocket) => {
					'ngInject';

					let defer = $q.defer(),
						heartbeats = 0;

					websocket.connect();

					let timer = setInterval(() => {
						heartbeats++;
						$log.info('WS STATUS:', websocket.getStatus());

						if (websocket.getStatus() === WebSocket.OPEN) { // Check for 'OPEN'
							clearInterval(timer);
							defer.resolve();
						} else if (heartbeats > 20) {
							clearInterval(timer);
							defer.reject();
						}
					}, 100);

					return defer;
				}
			}
		})
		.state('app.home', {
			url: '/'
		})
		;
}
