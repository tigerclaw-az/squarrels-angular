import controller from './communismModal.controller';

export const CommunismModalComponent = {
	bindings: {
		modalInstance: '<',
		resolve: '<'
	},
	controller,
	controllerAs: '$ctrl',
	templateUrl: 'components/communism-modal/communismModal.tpl.html'
};
