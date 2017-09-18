export function runBlock($log, $state, $trace, $transitions) {
	'ngInject';

	// Enable logging of state transition
	$trace.enable('TRANSITION');

	// Add any logic for handling errors from state transitions
	$state.defaultErrorHandler(function() {
		// console.error('error:', error);
	});

	// Test when application is changing to 'app.start' route
	// to determine if a websocket connected has already been opened
	// so we can re-route the user back to the 'game'
	$transitions.onEnter({ to: 'app.start' }, (trans) => {

	});
}
