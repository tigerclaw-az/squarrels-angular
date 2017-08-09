import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { AppConfigConstant } from './config/appConfig.constant';

/* import-inject:js */
/* endinject */

let deps = [
	'angular-logger',
	'angular-websocket',
	'ngAnimate',
	'ngAria',
	'ngDraggable',
	'ngMessages',
	'ngResource',
	'ngStorage',
	'ngTouch',
	'toastr',
	'ui.bootstrap',
	'ui.router',
	'webcam'
	/* deps-inject:js */
	/* endinject */
];

(function(ng) {
	'use strict';

	ng.module('squarrels', deps)
		.constant('moment', moment)
		.constant('_', _)
		.constant('appConfig', AppConfigConstant)
		.config(config)
		.config(routerConfig)
		.run(runBlock)
	;
})(angular);
