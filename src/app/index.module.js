let _ 		= require('lodash'),
	angular = require('angular'),
	moment 	= require('moment');

import { config } 				from './index.config';
import { routerConfig } 		from './index.route';
import { runBlock } 			from './index.run';
import { AppConfigConstant } 	from './config/appConfig.constant';

/* import-inject:js */
/* endinject */

import 'angular-animate';
import 'angular-aria';
import 'angular-ui-bootstrap';
import 'angular-logger';
import 'angular-messages';
import 'angular-resource';
import 'angular-touch';
import 'angular-ui-router';
import 'angular-toastr';
import 'ng-draggable';
import 'ngstorage';
import 'webcam-directive';

let deps = [
	'angular-logger',
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
