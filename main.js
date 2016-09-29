const process = require('process');
const Game = require('./game');
const GameUI = require('./game_ui');
const MasterUI = require('./master_ui');
const webserver = require('./webserver');
const Buzzer = require('./buzzer');

const PORT=8080;

var HID;
var buzzer;
try {
	HID = require('node-hid');
	var device = new HID.HID(0x054c, 0x1000);
	buzzer = new Buzzer(device);
} catch(e) {
	throw new Error("No buzzer found : ", e.message);
	process.exit()
}

// web server used by the gameUI and masterUI webapps
var webapp = webserver.create(8080);

var game = new Game(buzzer);
var gameUI = new GameUI(webapp, game, 8081);
var masterUI = new MasterUI(webapp, game, 8082);