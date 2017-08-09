import { CardComponent } from './card.component';
import CardsApiService from './cardsApi.service';

export default angular
		.module('card', [])
		.component('card', CardComponent)
		.service('cardsApi', CardsApiService)
;
