import { WebGameUI } from './web_game_ui'
import { WebMasterUI } from './web_master_ui'
import { Game } from './game'

import { TeensyBuzzer } from './teensy_buzzer'
import { Buzzer } from 'node-buzzer/buzzer'
import { Ps2Buzzer } from 'node-buzzer/ps2'

export function start(buzzer_type, websocket_port) {
	var buzzer;
	switch(buzzer_type) {
		case 'teensy':
			buzzer = get_teensy_buzzer();
			break;
		case 'ps2':
			buzzer = get_ps2_buzzer();
			break;
		case 'web':
			break;
		default:
			console.log('error');
	}
	
	var gameUI = new WebGameUI(websocket_port)
	var masterUI = new WebMasterUI(8082);
	var game = new Game(buzzer, gameUI, masterUI)
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
	var buzzer = new TeensyBuzzer();
	return buzzer
}