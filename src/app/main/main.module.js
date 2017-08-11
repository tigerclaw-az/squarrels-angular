'use strict';

import { MainController } from './main.controller';

let deps = [
	'angular-logger'
];

export default angular
	.module('main', deps)
	.controller('mainController', MainController)
;
