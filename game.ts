import { Buzzer } from 'node-buzzer'

import { GameUI } from './game_ui'
import { MasterUI } from './master_ui'

export type Screen = "starting" | "devices" | "mode-select" | "team-activation" | "questions" | "score"
export type Devices = { buzzer: boolean, game: boolean, master: boolean }
export type Mode = "random" | "normal"
export type PlayState = "play" | "continue" | "stop" | "pause"


export class Game {
	buzzer: Buzzer
	gameUI: GameUI
	masterUI: MasterUI
	devices: Devices
	started: boolean
	screen: Screen

	constructor(buzzer: Buzzer, gameUI: GameUI, masterUI: MasterUI ) {
		this.buzzer = buzzer
		this.gameUI = gameUI
		this.masterUI = masterUI
		this.devices = { buzzer: false, game: false, master: false }
		this.started = false
		this.screen = 'starting'

		this.buzzer.addEventListener('ready', () => {
			console.log('buzzer ready')
			var max = this.buzzer.controllersCount()
			for(var i=0; i < max; i++) {
				this.buzzer.lightOff(i)
			}

			this.devices.buzzer = true
			this.checkReady()
		})

		this.gameUI.addEventListener('ready', () => {
			this.devices.game = true
			this.gameUI.setGame(this)
			this.checkReady()
		})

		this.masterUI.addEventListener('ready', () => {
			this.devices.master = true
			this.masterUI.setGame(this)
			this.checkReady()
		})

		this.buzzer.addEventListener('leave', () => {
			this.devices.buzzer = false
			this.leave()
		})

		this.gameUI.addEventListener('leave', () => {
			this.devices.game = false
			this.leave()
		})

		this.masterUI.addEventListener('leave', () => {
			this.devices.master = false
			this.leave()
		})
	}

	checkReady() {
		console.log('checkReady : ', this.devices)
		if (this.devices.game) {
			console.log('send devices to game')
			this.gameUI.sendDevices(this.devices)
		}
		
		//this.masterUI.sendDevices(this.devices)

		if (!this.devices.buzzer || !this.devices.game || !this.devices.master) {
			return
		}

		if (!this.isStarted()) {
			this.start()
			return
		}

		// Continue Game
		this.continue()
	}

	leave() {
		if (this.devices.game) {
			this.gameUI.sendDevices(this.devices)
		}
		//this.gameUI.setDevices(this.devices)
		//this.masterUI.setDevices(this.devices)
	}

	isStarted() {
		return this.started
	}

	start() {
		this.screen = 'mode-select'
		this.started = true
	}

	continue() {

	}


}