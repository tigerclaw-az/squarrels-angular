import { PlayersComponent } from './players.component';
import PlayersStoreService from './playersStore.service';

export default angular
	.module('players', [])
	.component('players', PlayersComponent)
	.service('playersStore', PlayersStoreService)
;
