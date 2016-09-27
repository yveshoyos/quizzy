// Web server
const HID = require('node-hid');
const ws = require("nodejs-websocket");

const webserver = require('./webserver');
const Buzzer = require('./buzzer');
const Sounds = require('./sounds');

var device = new HID.HID(0x054c, 0x1000);
var buzzer = new Buzzer(device)


//
// Ensure that all buzzers are off
//
for (var i=0; i < 4; i++) {
	buzzer.lightOff(i);
}

// Intial teams
var teams = [{
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
var stopTeamActivation;

function activateTeam(conn, controllerIndex, buttonIndex) {
	// make sure a team can only be activated once
	if (teams[controllerIndex].active) {
		return;
	}

	Sounds.play('activate_team');


	//activatedTeams++;
	buzzer.lightOn(controllerIndex);
	teams[controllerIndex].active = true;
	teams[controllerIndex].flash = true;
	conn.sendText(JSON.stringify({
		'activate_team': teams[controllerIndex]
	}));
	teams[controllerIndex].flash = false;

	var activatedTeams = teams.filter(function(team) {
		return team.active;
	});
	if (activatedTeams == 4) {
		// stop count
	}
}

function teamActivationStep(conn) {
	// Send teams to app
	conn.sendText(JSON.stringify({'teams': teams}));

	stopTeamActivation = buzzer.onPress(function(controllerIndex, buttonIndex) {
		activateTeam(conn, controllerIndex, buttonIndex)
	});

	// Make sure we can't activate any
	setTimeout(function() {
		stopTeamActivation();		
	}, 8000);
}

//
// Launch websocket server
//
var server = ws.createServer(function (conn) {
	
	teamActivationStep(conn);

	conn.on("text", function (str) {
        console.log("Received "+str)
        conn.sendText(str.toUpperCase()+"!!!")
    })
    conn.on("close", function (code, reason) {
        console.log("Connection closed")
        for (var i=0; i < 4; i++) {
        	buzzer.lightOff(i);
        }
        stopTeamActivation();
    })
}).listen(8081);

//
// Launch webserver for the (web) app
//
webserver.start();