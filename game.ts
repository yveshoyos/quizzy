/// <reference path="node_modules/definitely-typed/node/node.d.ts" />

import * as sounds from './sounds';
import { Ps2Buzzer } from './ps2_buzzer';
import { WebGameUI } from './web_game_ui';
import { WebMasterUI } from './web_master_ui';

interface Team {
	name: string;
	id: string;
	active: boolean;
	flash: boolean;
}

export class Game {
	buzzer: Ps2Buzzer;
	gameUI: WebGameUI;
	masterUI: WebMasterUI;
	started: boolean;
	activatedTeams: number;
	step: number;
	teams: Array<Team>;
	mode: string;
	stopTeamActivation: Function;
	stopTeamActivationTimeout: any;
	constructor(buzzer) {
		this.buzzer = buzzer;
		this.gameUI = null;
		this.masterUI = null;
		this.started = false;

		// Make sur all buzzer are off
		for (var i=0; i < 4; i++) {
			this.buzzer.lightOff(i);
		}
	}

	start() {
		console.log('start game');
		this.started = true;
		this.activatedTeams = 0;
		this.step = 0;
		this.teams = [{
			name: 'A',
			id: 'a',
			active: false,
			flash: false
		},{
			name: 'B',
			id: 'b',
			active: false,
			flash: false
		},{
			name: 'C',
			id: 'c',
			active: false,
			flash: false
		},{
			name: 'D',
			id: 'd',
			active: false,
			flash: false
		}];

		this.modeStep();
	}

	isStarted() {
		return this.started;
	}

	stop() {
		if (!this.isStarted()) {
			return;
		}
		// Do something
	}

	register(type, instance) {
		if (type == 'game') {
			this.gameUI = instance;
		} else if (type == 'master') {
			this.masterUI = instance;
		}

		if (!this.isStarted() && this.masterUI && this.gameUI) {
			this.start();
		} else if (this.isStarted()) {
			console.log('set currentStep')
			instance.setTeams(this.teams);
			instance.setStep(this.step);
		}
	}

	unregister(type) {
		if (type == 'game') {
			this.gameUI = null;
		} else if (type == 'master') {
			this.masterUI = null;
		}
	}

	setMode(mode) {
		this.mode = mode;
		this.activationStep();
	}

	//
	// Steps
	//
	modeStep() {
		this.step = 1;
		this.gameUI.setStep(1);
		this.masterUI.setStep(1);
	}

	activationStep() {
		this.step = 2;

		this.gameUI.setTeams(this.teams);
		this.gameUI.setStep(2);

		this.masterUI.setTeams(this.teams);
		this.masterUI.setStep(2);

		this.stopTeamActivation = this.buzzer.onPress((controllerIndex, buttonIndex) => {
			this.activateTeam(controllerIndex);
		});

		this.stopTeamActivationTimeout = setTimeout(() => {
			this.quizzStep();
		}, 9000);
	}

	activateTeam(controllerIndex) {
		var team = this.teams[controllerIndex];

		// make sure a team can only be activated once
		if (team.active) {
			return;
		}

		sounds.play('activate_team');

		// Count the activated teams
		this.activatedTeams++;

		// Light the buzzer on
		this.buzzer.lightOn(controllerIndex);

		// Activate the team
		
		team.active = true;
		team.flash = true;
		this.gameUI.activateTeam(team);
		this.masterUI.activateTeam(team);
		team.flash = false; // Just flash during activation

		if (this.activatedTeams == 4) {
			this.quizzStep();
		}
	}

	quizzStep() {
		// Stop the team activation
		this.stopTeamActivation();
		if (this.stopTeamActivationTimeout) {
			clearTimeout(this.stopTeamActivationTimeout);
		}

		this.step = 3;
		this.gameUI.setStep(3);
		this.masterUI.setStep(3);
	}
}