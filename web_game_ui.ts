import { WebsocketUI } from './websocket_ui';
import { GameUI } from './game_ui'

export class WebGameUI extends WebsocketUI implements GameUI {

	constructor(port: number) {
		super(port);
		this.addEventListener('register', this.register.bind(this))
		this.addEventListener('start_question', this.startQuestion.bind(this))
		this.addEventListener('continue_question', this.continueQuestion.bind(this))
		this.addEventListener('set_activation_step', this.continueQuestion.bind(this))
		this.addEventListener('error', this.error.bind(this))
	}

	register() {
		this.eventListeners['ready'].forEach((f) => {
			f();
		});
	}

	setActivationStep() {
		//this.game.activationStep();
	}

	startQuestion() {
		//this.game.startQuestion();
	}

	continueQuestion() {
		//this.game.continueQuestion();
	}

	error() {

	}
}