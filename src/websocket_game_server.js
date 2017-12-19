'use strict';

import { WebsocketUI } from './websocket_ui'
import { Game } from './game'

import { TeensyBuzzer } from 'node-buzzer/es5/teensy'
import { Ps2Buzzer } from 'node-buzzer/es5/ps2'
import { WebsocketBuzzer } from 'node-buzzer/es5/websocket'

export function start(preferences, startOrContinue) {
	
	var buzzer;
	switch(preferences.buzzer.type) {
		case 'teensy':
			console.log('teeeeeensy')
			buzzer = get_teensy_buzzer();
			console.log('got')
			break;
		case 'ps2':
			buzzer = get_ps2_buzzer();
			break;
		case 'websocket':
			buzzer = get_websocket_buzzer(preferences.buzzer);
			break;
		default:
			console.log('error');
	}
	
	console.log('uis...')
	var gameUI = new WebsocketUI(preferences.game.port)
	var masterUI = new WebsocketUI(preferences.master.port)
	var game = new Game(buzzer, gameUI, masterUI, preferences.game.questions_directory, startOrContinue)
	console.log('Server started...')
	return game;
}

function get_ps2_buzzer() {
	var buzzer = null;
	try {
		var HID = require('node-hid');
		var device = new HID.HID(0x054c, 0x1000);
		buzzer = new Ps2Buzzer(device);
	} catch(e) {
		throw new Error("No buzzer found : "+e.message);
	}
	return buzzer;
}

function get_teensy_buzzer() {
	console.log('build TeensyBuzzer object...')
	return new TeensyBuzzer();
}

function get_websocket_buzzer(prefs) {
	return new WebsocketBuzzer(prefs.port);
}