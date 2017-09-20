import controller from './start.controller';

export const StartComponent = {
	controller,
	controllerAs: 'startCtrl',
	template: `
		<div class="winter">
			<button class="btn btn-primary button-join-game"
				ng-show="startCtrl.isConnected"
				ng-click="startCtrl.joinGame()"
				ng-cloak>JOIN GAME</button>

			<div class="alert alert-danger error" role="alert"
				ng-show="!startCtrl.isConnected"
				ng-cloak>Taking a nap. Be back later.</div>
		</div>
	`
};
