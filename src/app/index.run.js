export function runBlock($log, $state, $trace, $transitions) {
	'ngInject';

	// Enable logging of state transition
	$trace.enable('TRANSITION');

	// Add any logic for handling errors from state transitions
	$state.defaultErrorHandler(function(error) {
		$log.error(error);
	});

	// Test when application is changing to 'app.game' route
	// to determine if a websocket connection has been OPEN
	// and route the user back to 'start' if not
	$transitions.onEnter({ to: 'app.game' }, (trans) => {
		let websocket = trans.injector().get('websocket');

		if (websocket.$ws) {
			let status = websocket.getStatus();

			if (status !== websocket.STATUS.OPEN) {
				$state.go('app.start');
			}
		}
	});
}
