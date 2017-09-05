import controller from './actionCardModal.controller';

export const ActionCardModalComponent = {
	bindings: {
		modalInstance: '<',
		resolve: '<'
	},
	controller,
	controllerAs: '$ctrl',
	templateUrl: 'components/modals/actionCard/actionCardModal.tpl.html'
};
