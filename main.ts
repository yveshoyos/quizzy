
import * as webserver from './webserver';
import { Game } from './game';
import { WebGameUI } from './web_game_ui';
import { WebMasterUI } from './web_master_ui';

import { Buzzer, Ps2Buzzer, WebBuzzer, GPIOBuzzer, GPIODomePushButton } from 'node-buzzer';
import { HIDBuzzer } from './hid_buzzer';

import * as process from 'process';
import * as minimist from 'minimist';

const PORT=8080;

//
// Possible arguments :
// 	- buzzer : "web" or "ps2"
//
interface Args extends minimist.ParsedArgs {
	buzzer:string,
	buttons:string
}
var argv:Args = minimist(process.argv.slice(2)) as Args;
argv.buzzer = argv.buzzer || 'ps2';

//
// Buzzer
//
var buzzer:Buzzer;
var webapp = webserver.create(8080);
var device;
switch(argv.buzzer) {
	case 'ps2':
		try {
        		var HID = require('node-hid');
        		device = new HID.HID(0x054c, 0x1000);
        		buzzer = new Ps2Buzzer(device);
		} catch(e) {
        		throw new Error("No buzzer found : "+e.message);
		}								
		break;
	case 'hid':
		var HID = require('node-hid');
		var devices = HID.devices();
		console.log('==>', devices);
		var deviceInfo = devices.find( function(d) {
			console.log('##', d.usagePage);
			console.log('##', d.usage);
 			return d.vendorId===0x16C0 
 				&& d.productId===0x0486 
 				&& d.usagePage===0xFFAB 
 				&& d.usage===0x200;
 		});

		// Under linux, usagePage and usage is not working correctly 
		// (see https://github.com/node-hid/node-hid/issues/168) so no device is found.
		// We have to try without them
 		var device;
		if (!deviceInfo) {
			try {
				device = new HID.HID(5824, 1158);
			} catch(e) {
				throw new Error("No buzzer found");
			}
		} else {
			device = new HID.HID(deviceInfo.path);
		}

		buzzer = new HIDBuzzer(device);
		break;
	case 'gpio':
		var buttons:Array<GPIODomePushButton> = [];
		var b = JSON.parse(argv.buttons);
		for(var i=0; i < b.length; i++) {
			buttons.push({
				button: b[i][0],
				led: b[i][1]
			});
		}
		buzzer = new GPIOBuzzer(buttons);
		break;
	case 'web':
		buzzer = new WebBuzzer(webapp, 8083);
		break;
}


// web server used by the gameUI and masterUI webapps
var gameUI = new WebGameUI(webapp, 8081);
var masterUI = new WebMasterUI(webapp, 8082);
var game = new Game(buzzer, gameUI, masterUI);

//buzzer.leave();

process.stdin.resume();
process.on('exit', (code:number) => {
	process.exit(code);
	console.log('process exit');
});
process.on('SIGINT', () => {
	console.log('\nCTRL+C...');
	buzzer.leave();
	process.exit(0);
});
process.on('uncaughtException', (err) => {
	console.dir(err, { depth: null });
	buzzer.leave();
	process.exit(1);
});


