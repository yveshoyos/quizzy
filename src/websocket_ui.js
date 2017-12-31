'use strict';

import * as ws from 'nodejs-websocket'
import { Game } from './game'
import { Question } from './question'

export class WebsocketUI {
	//ws: ws.Server
	//conn: ws.Connection
	//eventListeners: {}
	//game: Game

	constructor(port) {
		this.eventListeners = { 'ready': [], 'leave': [] };

		this.ws = ws.createServer((conn) => {
			this.conn = conn

			conn.on("text", (str) => {
				var data = JSON.parse(str)
				console.log('Server -- receive ', data)
				this.receive(data)
			})

			conn.on("close", (code, reason) => {
				this.conn = null
				this.triggerEvent('leave', {})
			})

			conn.on("error", () => {
				this.triggerEvent('error', {})
			})

		}).listen(port);

		this.addEventListener('register', this.register.bind(this))
		this.addEventListener('mode', this.setMode.bind(this))
		this.addEventListener('mode_ok', this.setModeOK.bind(this))
		this.addEventListener('team_name', this.updateTeamName.bind(this))
		this.addEventListener('start', this.startQuestions.bind(this))
		this.addEventListener('question', this.sendQuestion.bind(this))
		this.addEventListener('play_question', this.startQuestion.bind(this))
		this.addEventListener('points', this.addPoints.bind(this))
		this.addEventListener('continue_question', this.continueQuestion.bind(this))
		this.addEventListener('reset_teams', this.resetTeams.bind(this))
		this.addEventListener('finish_game', this.finishGame.bind(this))
		this.addEventListener('error', this.error.bind(this))
	}

	addEventListener(event, callback) {
		if (!(event in this.eventListeners)) {
			this.eventListeners[event] = []
		}
		this.eventListeners[event].push(callback)
	}

	removeEventListener(event, callback) {
		var index = this.eventListeners[event].indexOf(callback)
		this.eventListeners[event].splice(index, 1)
	}

	triggerEvent(event, value) {
		if (event in this.eventListeners) {
			this.eventListeners[event].forEach((f) => {
				f(value)
			})
		}
	}

	receive(data) {
		for(var property in data) {
			if (data.hasOwnProperty(property)) {
				this.triggerEvent(property, data[property])
			}
		}
	}

	send(event, value) {
		var data = {}
		data[event] = value
		this.conn.send(JSON.stringify(data))
	}

	/**
	 *
	 */
	setGame(game) {
		this.game = game;
	}

	sendDevices(devices) {
		this.send('devices', devices)
	}

	sendTeams(teams) {
		this.send('teams', teams)
	}

	sendUpdateTeam(team) {
		this.send('team', team)
	}

	/*sendScreen(screen) {
		this.send('screen', screen)
	}*/

	sendPlayMode(mode) {
		this.send('mode', mode)
	}

	sendQuestions(questions, startQuestionIndex=-1) {
		this.send('questions', {
			questions: questions,
			startQuestionIndex: startQuestionIndex
		})
	}

	sendPlayQuestion(questionIndex, state) {
		this.send('play_question', {
			'questionIndex': questionIndex,
			'state': state
		})
	}

	sendAnswered(questionIndex, answered, controllerIndex) {
		this.send('answered', {
			'questionIndex': questionIndex,
			'answer': answered
		})
	}

	sendAnswer(questionIndex, correct) {
		this.send('answer', {
			'questionIndex': questionIndex,
			'correct': correct
		})
	}

	/**
	 *
	 */
	register() {
		this.eventListeners['ready'].forEach((f) => {
			f();
		});
	}

	setMode(mode) {
		this.game.setMode(mode, true)
	}

	setModeOK() {
		this.game.setTeamsActivation()
	}

	updateTeamName(data) {
		this.game.updateTeamName(data.index, data.name)
	}

	startQuestions() {
		this.game.startQuestions()
	}

	sendQuestion(data) {
		this.game.sendQuestion(data.index)
	}

	startQuestion(index) {
		this.game.startQuestion(index);
	}

	addPoints(points) {
		this.game.setPoints(points)
	}

	continueQuestion() {
		this.game.continueQuestion();
	}

	resetTeams() {
		this.game.resetTeams();
	}

	error() {

	}

	finishGame() {
		this.game.finishGame()
	}

}