var angular = require('angular');

export function config(logEnhancerProvider, $httpProvider, $animateProvider, toastrConfig, appConfig) {
	'ngInject';

	// Enable log
	logEnhancerProvider.logLevels = {
		'*': logEnhancerProvider.LEVEL[appConfig.logLevel]
	};

	// Setup http cache
	$httpProvider.defaults.cache = false;
	$httpProvider.useApplyAsync(true);

	// Animation config
	// This will fix performance issue with animations being fired for ALL elements
	// See: https://goo.gl/FZH8u7
	$animateProvider.classNameFilter( /\banimated\b/ );

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
