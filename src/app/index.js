import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { AppConfigConstant } from './config/appConfig.constant';

/* import-inject:js */
import { MainModule } from './main/main.module';
import { PlayersModule } from './components/players/players.module';
import { MainSidebarModule } from './main/sidebar/mainSidebar.module';
import { PantherParserModule } from './shared/parsers/pantherParser.module';
import { PlayersApiModule } from './shared/api/playersApi.module';
import { UtilsModule } from './shared/utils/utils.module';
import { WebsocketModule } from './shared/websocket/websocket.module';
import { PlayerModule } from './components/players/player/player.module';
/* endinject */

let deps = [
	'ngAnimate',
	'ngAria',
	'ngMessages',
	'ngResource',
	'ngStorage',
	'ngTouch',
	'angular-logger',
	'toastr',
	'ui.bootstrap',
	'ui.router',
	'webcam'
	/* deps-inject:js */
	,'main'
	,'players'
	,'mainSidebar'
	,'pantherParser'
	,'playersApi'
	,'utils'
	,'websocket'
	,'player'
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
