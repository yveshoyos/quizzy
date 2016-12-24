import * as ws from 'nodejs-websocket'
import { Game, Devices, Screen, Mode, PlayState } from './game'
import { Team } from './team'
import { Question } from './question'
import { GameUI } from './game_ui'

export class WebsocketUI implements GameUI {
	ws: ws.Server
	conn: ws.Connection
	eventListeners: {}
	game: Game

	constructor(port: number) {
		this.eventListeners = { 'ready': [], 'leave': [] };

		this.ws = ws.createServer((conn) => {
			this.conn = conn

			conn.on("text", (str: string) => {
				var data = JSON.parse(str)
				console.log('receive ', data)
				this.receive(data)
			})

			conn.on("close", (code: number, reason: string) => {
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
		this.addEventListener('start_questions', this.startQuestions.bind(this))
		this.addEventListener('start_question', this.startQuestion.bind(this))
		this.addEventListener('points', this.addPoints.bind(this))
		this.addEventListener('continue_question', this.continueQuestion.bind(this))
		this.addEventListener('finish_game', this.finishGame.bind(this))
		this.addEventListener('error', this.error.bind(this))
	}

	addEventListener(event: string, callback: Function) {
		if (!(event in this.eventListeners)) {
			this.eventListeners[event] = []
		}
		this.eventListeners[event].push(callback)
	}

	removeEventListener(event: string, callback: Function) {
		var index = this.eventListeners[event].indexOf(callback)
		this.eventListeners[event].splice(index, 1)
	}

	triggerEvent(event: string, value: any) {
		if (event in this.eventListeners) {
			this.eventListeners[event].forEach((f) => {
				f(value)
			})
		}
	}

	private receive(data) {
		for(var property in data) {
			if (data.hasOwnProperty(property)) {
				this.triggerEvent(property, data[property])
			}
		}
	}

	private send(event: string, value: any) {
		var data = {}
		data[event] = value
		this.conn.send(JSON.stringify(data))
	}

	/**
	 *
	 */
	setGame(game: Game) {
		this.game = game;
	}

	sendDevices(devices: Devices) {
		this.send('devices', devices)
	}

	sendTeams(teams: Array<Team>) {
		this.send('teams', teams)
	}

	sendUpdateTeam(team: Team) {
		this.send('team', team)
	}

	sendScreen(screen: Screen) {
		this.send('screen', screen)
	}

	sendPlayMode(mode: Mode) {
		this.send('mode', mode)
	}

	sendQuestions(questions: Array<Question>) {
		this.send('questions', questions)
	}

	sendPlayQuestion(questionIndex: number, state: PlayState) {
		this.send('play_question', {
			'questionIndex': questionIndex,
			'state': state
		})
	}

	sendAnswered(questionIndex: number, answered: boolean) {
		this.send('answered', {
			'questionIndex': questionIndex,
			'answer': answered
		})
	}

	sendAnswer(questionIndex: number, correct: boolean) {
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

	setMode(mode: Mode) {
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

	startQuestion(index) {
		this.game.startQuestion(index);
	}

	addPoints(points) {
		this.game.setPoints(points)
	}

	continueQuestion() {
		this.game.continueQuestion();
	}

	error() {

	}

	finishGame() {
		this.game.finishGame()
	}

}