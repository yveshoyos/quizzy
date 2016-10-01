/// <reference path="node_modules/definitely-typed/node/node.d.ts" />

import * as webserver from './webserver';
import { Game } from './game';
import { WebGameUI } from './web_game_ui';
import { WebMasterUI } from './web_master_ui';
import { Ps2Buzzer } from './ps2_buzzer';

const PORT=8080;

var buzzer:Ps2Buzzer;
try {
	var HID = require('node-hid');
	var device = new HID.HID(0x054c, 0x1000);
	buzzer = new Ps2Buzzer(device);
} catch(e) {
	throw new Error("No buzzer found : "+e.message);
}

var game = new Game(buzzer);

// web server used by the gameUI and masterUI webapps
var webapp = webserver.create(8080);
var gameUI = new WebGameUI(webapp, game, 8081);
var masterUI = new WebMasterUI(webapp, game, 8082);