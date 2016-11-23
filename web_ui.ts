
'use strict';

import * as ws from 'nodejs-websocket';
import * as express from 'express';
import { Game } from './game';
import { Team } from './team';
import { Question } from './question';
import { GameUI } from './game_ui';

interface eventListeners {

}

export abstract class WebUI implements GameUI {
	app: express.Express;
	game: Game;
	port: number;
	conn: ws.Connection;
	eventListeners: { 'ready': Array<Function>, 'leave': Array<Function> };

	constructor(expressApp: express.Express, websocketPort: number) {
		this.app = expressApp;
		this.port = websocketPort;
		this.conn = null;
		this.eventListeners = { 'ready': [], 'leave': [] };
		this.initWebapp();
		this.initWebsocket();
	}

	abstract initWebapp(): void;
	abstract initWebsocket(): void;

	addEventListener(event: string, callback: Function) {
		this.eventListeners[event].push(callback);
	}

	removeEventListener(event: string, callback: Function) {
		var index = this.eventListeners[event].indexOf(callback);
		this.eventListeners[event].splice(index, 1);
	}

	leave() {
		
	}

	_send(data) {
		if (this.conn) {
			this.conn.send(JSON.stringify(data));
		}
	}

	/**
	 * Set the main game
	 */
	setGame(game: Game) {
		this.game = game;
	}

	setActors(actors: { buzzer: boolean, game: boolean, master: boolean }): void {
		this._send({
			set_actors: actors
		});
	}

	setTeams(teams: Array<Team>) {
		this._send({
			set_teams: teams
		});
	}

	setTeamActivationDuration(duration: number) {
		this._send({
			team_activation_duration: duration
		});
	}

	setMode(mode: string) {
		this._send({
			set_mode: mode
		});
	}

	setStep(step: string) {
		this._send({
			set_step: step
		});
	}

	activateTeam(team: Team, active: boolean) {
		this._send({
			activate_team: team
		});
	}

	updateTeam(team: Team) {
		this._send({
			update_team: team
		});
	}

	setQuestion(question: Question) {
		this._send({
			set_question: question
		});
	}

	setAnswered(controllerIndex: number, answered: boolean) {
		this._send({
			set_answered: {
				controllerIndex: controllerIndex,
				answered: answered
			}
		});
	}

	//
	setQuestions(questions: Array<Question>): void {
		this._send({
			questions: questions
		});
	}

	startQuestion(index: number): void {
		this._send({
			start_question: index
		});
	}

	continueQuestion(index: number): void {
		this._send({
			continue_question: index
		});
	}

	validateAnswer(points: number): void {
		this._send({
			validate_answer: points
		});
	}

	finishGame(): void {
		this._send({
			finish_game: true
		});
	}
}