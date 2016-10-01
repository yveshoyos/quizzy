
/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ws from 'nodejs-websocket';
import * as express from 'express';
import { Game } from './game';

export abstract class WebUI {
	app: express.Express;
	game: Game;
	port: number;
	conn: ws.Connection;
	constructor(expressApp, game, websocketPort) {
		this.app = expressApp;
		this.game = game;
		this.port = websocketPort;
		this.conn = null;

		this.initWebapp();
		this.initWebsocket();
	}

	abstract initWebapp();
	abstract initWebsocket();

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