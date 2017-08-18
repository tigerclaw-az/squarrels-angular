import controller from './storageModal.controller';

export const StorageModalComponent = {
	bindings: {
		modalInstance: '<',
		resolve: '<'
	},
	controller,
	controllerAs: '$ctrl',
	templateUrl: 'components/storage-modal/storageModal.tpl.html'
};
