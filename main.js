const process = require('process');
const Game = require('./game');
const WebGameUI = require('./web_game_ui');
const WebMasterUI = require('./web_master_ui');
const webserver = require('./webserver');
const Ps2Buzzer = require('./ps2_buzzer');

const PORT=8080;

var HID;
var buzzer;
try {
	HID = require('node-hid');
	var device = new HID.HID(0x054c, 0x1000);
	buzzer = new Ps2Buzzer(device);
} catch(e) {
	throw new Error("No buzzer found : ", e.message);
	process.exit()
}

var game = new Game(buzzer);

// web server used by the gameUI and masterUI webapps
var webapp = webserver.create(8080);
var gameUI = new WebGameUI(webapp, game, 8081);
var masterUI = new WebMasterUI(webapp, game, 8082);