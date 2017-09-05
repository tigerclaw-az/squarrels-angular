import controller from './storageModal.controller';

export const StorageModalComponent = {
	bindings: {
		modalInstance: '<',
		resolve: '<'
	},
	controller,
	controllerAs: '$ctrl',
	templateUrl: 'components/modals/storage/storageModal.tpl.html'
};
