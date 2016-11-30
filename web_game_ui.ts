import { GameUI } from './game_ui';

export class WebGameUI extends GameUI {

	receive(data) {
		console.log('receive')
	}
}