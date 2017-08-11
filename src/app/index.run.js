export function runBlock($log, $state, $trace) {
	'ngInject';

	// Enable logging of state transition
	$trace.enable('TRANSITION');

	// Add any logic for handling errors from state transitions
	$state.defaultErrorHandler(function() {
		// console.error('error:', error);
	});
}
