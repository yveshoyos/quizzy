import * as webserver from './webserver';

import { WebsocketUI } from './websocket_ui'
import { Game } from './game'

import { TeensyBuzzer } from 'node-buzzer/teensy'
import { Buzzer } from 'node-buzzer/buzzer'
import { Ps2Buzzer } from 'node-buzzer/ps2'
import { WebsocketBuzzer } from 'node-buzzer/websocket'

export interface Preferences {
	game: {
		port: number,
		questions_directory: string
	},
	master: WebsocketMasterPreferences,
	buzzer: BuzzerPreferences
}

export interface WebsocketMasterPreferences {
	port: number,
	type: 'websocket'
}
export type MasterPreference = WebsocketMasterPreferences

export type BuzzerType = 'teensy' | 'websocket' | 'ps2'
export interface WebsocketBuzzerPreferences {
	type: 'websocket',
	port: number
}

export interface TeensyBuzzerPreferences {
	type: 'teensy'
}

export interface  Ps2BuzzerPreferences {
	type: 'ps2'
}
export type BuzzerPreferences = WebsocketBuzzerPreferences | TeensyBuzzerPreferences | Ps2BuzzerPreferences

export function start(preferences: Preferences) {
	var buzzer;
	switch(preferences.buzzer.type) {
		case 'teensy':
			buzzer = get_teensy_buzzer();
			break;
		case 'ps2':
			buzzer = get_ps2_buzzer();
			break;
		case 'websocket':
			buzzer = get_websocket_buzzer(preferences.buzzer as WebsocketBuzzerPreferences);
			break;
		default:
			console.log('error');
	}
	
	var gameUI = new WebsocketUI(preferences.game.port)
	var masterUI = new WebsocketUI(preferences.master.port)
	var game = new Game(buzzer, gameUI, masterUI, preferences.game.questions_directory)
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
	return new TeensyBuzzer();
}

function get_websocket_buzzer(prefs: WebsocketBuzzerPreferences) {
	return new WebsocketBuzzer(prefs.port);
}