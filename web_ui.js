'use strict';

class WebUI {
	constructor(expressApp, game, websocketPort) {
		this.app = expressApp;
		this.game = game;
		this.port = websocketPort;
		this.conn = null;

		this.initWebapp();
		this.initWebsocket();
	}
	/**
	 * Set the main game
	 */
	setGame(game) {
		this.game = game;
	}

	setTeams(teams) {
		this.conn.send(JSON.stringify({
			set_teams: teams
		}));
	}

	setStep(step) {
		this.conn.send(JSON.stringify({
			set_step: step
		}));
	}

	activateTeam(team) {
		this.conn.send(JSON.stringify({
			activate_team: team
		}));
	}

	setQuestion(question) {
		this.conn.send(JSON.stringify({
			set_question: question
		}));
	}
}

module.exports = WebUI;