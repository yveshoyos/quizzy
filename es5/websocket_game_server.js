'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.start = start;

var _websocket_ui = require('./websocket_ui');

var _game = require('./game');

var _teensy = require('node-buzzer/es5/teensy');

var _ps = require('node-buzzer/es5/ps2');

var _websocket = require('node-buzzer/es5/websocket');

function start(preferences, startOrContinue) {
	var buzzer;
	switch (preferences.buzzer.type) {
		case 'teensy':
			buzzer = get_teensy_buzzer();
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

	var gameUI = new _websocket_ui.WebsocketUI(preferences.game.port);
	var masterUI = new _websocket_ui.WebsocketUI(preferences.master.port);
	var game = new _game.Game(buzzer, gameUI, masterUI, preferences.game.questions_directory, startOrContinue);
	return game;
}

function get_ps2_buzzer() {
	var buzzer = null;
	try {
		var HID = require('node-hid');
		var device = new HID.HID(0x054c, 0x1000);
		buzzer = new _ps.Ps2Buzzer(device);
	} catch (e) {
		throw new Error("No buzzer found : " + e.message);
	}
	return buzzer;
}

function get_teensy_buzzer() {
	return new _teensy.TeensyBuzzer();
}

function get_websocket_buzzer(prefs) {
	return new _websocket.WebsocketBuzzer(prefs.port);
}
//# sourceMappingURL=websocket_game_server.js.map
