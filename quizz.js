// Web server
const HID = require('node-hid');
const ws = require("nodejs-websocket");

const webserver = require('./webserver');
const Buzzer = require('./buzzer');
const Sounds = require('./sounds');

var device = new HID.HID(0x054c, 0x1000);
var buzzer = new Buzzer(device)

var gameConn;
var masterConn;

//
// Ensure that all buzzers are off
//
for (var i=0; i < 4; i++) {
	buzzer.lightOff(i);
}

function Game() {
	this.gameConn = null;
	this.masterConn = null;
	this.mode = null;
	this.teams = [];
}

Game.prototype = {
	start: function() {
		this.activatedTeams = 0;
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
	},
	isStarted: function() {
		return this.teams.length > 0;
	},
	setGameConn: function(conn) {
		this.gameConn = conn;
	},
	setMasterConn: function(conn) {
		this.masterConn = conn;
	},
	setMode: function(mode) {
		this.mode = mode;
		this.activationStep();
	},
	modeStep: function() {
		this.gameConn.sendText(JSON.stringify({
			'step': 1
		}));

		this.masterConn.sendText(JSON.stringify({
			'step': 1
		}));
	},
	activationStep: function() {
		var game = this;

		// Send teams to app
		this.gameConn.sendText(JSON.stringify({
			'teams': this.teams, 
			'step': 2
		}));

		game.stopTeamActivation = buzzer.onPress(function(controllerIndex, buttonIndex) {
			game.activateTeam(controllerIndex, buttonIndex)
		});

		// Make sure we can't activate any
		game.stopTeamActivationTimeout = setTimeout(function() {
			game.quizzStep();
		}, 9000);
	},
	activateTeam: function(controllerIndex, buttonIndex) {
		// make sure a team can only be activated once
		if (this.teams[controllerIndex].active) {
			return;
		}

		Sounds.play('activate_team');

		this.activatedTeams++;
		buzzer.lightOn(controllerIndex);
		this.teams[controllerIndex].active = true;
		this.teams[controllerIndex].flash = true;
		this.gameConn.sendText(JSON.stringify({
			'activate_team': this.teams[controllerIndex]
		}));
		this.teams[controllerIndex].flash = false;

		if (this.activatedTeams == 4) {
			// stop count
			this.quizzStep();
		}
	},
	quizzStep: function() {
		this.stopTeamActivation();
		if (this.stopTeamActivationTimeout) {
			clearTimeout(this.stopTeamActivationTimeout);
		}
		this.gameConn.sendText(JSON.stringify({
			'step': 3
		}));
	}
};


//
// Launch websocket server
//
var game = new Game();
var gameMaster = null;
var server = ws.createServer(function (conn) {
	
	conn.on("text", function (str) {
		var data = JSON.parse(str);

		if (data.register) {
			if (data.register == 'game') {
				gameConn = conn;
				game.setGameConn(conn);
			} else if (data.register == 'master') {
				masterConn = conn;
				game.setMasterConn(conn);
			}
		} else if (data.set_mode) {
			game.setMode(data.set_mode);
		}

		if (game.gameConn && game.masterConn) {
			if (!game.isStarted()) {
				game.start();
			}
		}
	});

    conn.on("close", function (code, reason) {
        for (var i=0; i < 4; i++) {
        	buzzer.lightOff(i);
        }
        if (game && game.stopTeamActivation) {
        	game.stopTeamActivation();
        }
    });

}).listen(8081);

//
// Launch webserver for the (web) app
//
webserver.start();