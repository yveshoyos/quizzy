
/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ws from 'nodejs-websocket';
import * as express from 'express';
import { Game } from './game';
import { Team } from './team';
import { Question } from './question';
import { GameUI } from './game_ui';

export abstract class WebUI implements GameUI {
	app: express.Express;
	game: Game;
	port: number;
	conn: ws.Connection;
	constructor(expressApp: express.Express, game: Game, websocketPort: number) {
		this.app = expressApp;
		this.game = game;
		this.port = websocketPort;
		this.conn = null;

		this.initWebapp();
		this.initWebsocket();
	}

	abstract initWebapp(): void;
	abstract initWebsocket(): void;

	/**
	 * Set the main game
	 */
	setGame(game: Game) {
		this.game = game;
	}

	setTeams(teams: Array<Team>) {
		this.conn.send(JSON.stringify({
			set_teams: teams
		}));
	}

	setMode(mode: string) {
		this.conn.send(JSON.stringify({
			set_mode: mode
		}));
	}

	setStep(step: number) {
		this.conn.send(JSON.stringify({
			set_step: step
		}));
	}

	activateTeam(team: Team, active: boolean) {
		this.conn.send(JSON.stringify({
			activate_team: team
		}));
	}

	updateTeam(team: Team) {
		this.conn.send(JSON.stringify({
			update_team: team
		}));
	}

	setQuestion(question: Question) {
		this.conn.send(JSON.stringify({
			set_question: question
		}));
	}

	setAnswered(controllerIndex: number, answered: boolean) {
		this.conn.send(JSON.stringify({
			set_answered: {
				controllerIndex: controllerIndex,
				answered: answered
			}
		}));
	}
}