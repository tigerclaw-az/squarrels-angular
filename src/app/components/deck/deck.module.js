import { DeckComponent } from './deck.component';
import DeckStoreService from './deckStore.service';
import DecksApiService from './decksApi.service';

export default angular
	.module('deck', [])
	.component('deck', DeckComponent)
	.service('deckStore', DeckStoreService)
	.service('decksApi', DecksApiService)
;
