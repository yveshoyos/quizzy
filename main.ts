/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/minimist/minimist.d.ts" />

import * as webserver from './webserver';
import { Game } from './game';
import { WebGameUI } from './web_game_ui';
import { WebMasterUI } from './web_master_ui';
import { Ps2Buzzer } from './ps2_buzzer';
import { Buzzer } from './buzzer';
import { WebBuzzer } from './web_buzzer';
import * as process from 'process';
import * as minimist from 'minimist';

const PORT=8080;

//
// Possible arguments :
// 	- buzzer : "web" or "ps2"
//
interface Args extends minimist.ParsedArgs {
	buzzer:string
}
var argv:Args = minimist(process.argv.slice(2)) as Args;
argv.buzzer = argv.buzzer || 'ps2';

//
// Buzzer
//
var buzzer:Buzzer;
var webapp = webserver.create(8080);
switch(argv.buzzer) {
	case 'ps2':
		try {
        		var HID = require('node-hid');
        		var device = new HID.HID(0x054c, 0x1000);
        		buzzer = new Ps2Buzzer(device);
		} catch(e) {
        		throw new Error("No buzzer found : "+e.message);
		}								
		break;
	case 'web':
		buzzer = new WebBuzzer(webapp, 8083);
		break;
}

var game = new Game(buzzer);

// web server used by the gameUI and masterUI webapps
var gameUI = new WebGameUI(webapp, game, 8081);
var masterUI = new WebMasterUI(webapp, game, 8082);
