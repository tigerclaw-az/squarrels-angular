export function config(logEnhancerProvider, $httpProvider, toastrConfig, appConfig) {
	'ngInject';

	// Enable log
	logEnhancerProvider.logLevels = {
		'*': logEnhancerProvider.LEVEL[appConfig.logLevel]
	};

	// Setup http cache
	$httpProvider.defaults.cache = false;
	$httpProvider.useApplyAsync(true);

	// Set options third-party lib
	angular.extend(toastrConfig, {
		allowHtml: true,
		closeButton: false,
		extendedTimeOut: 0,
		positionClass: 'toast-top-right',
		preventDuplicates: false,
		progressBar: false,
		tapToDismiss: true,
		timeOut: 5000
	});
}
