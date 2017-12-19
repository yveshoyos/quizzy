'use strict';

import { start } from './websocket_game_server'

import process from 'process';
import minimist from 'minimist';

//
// Possible arguments :
// 	- buzzer : "web" or "ps2"
//
var argv = minimist(process.argv.slice(2))
argv.buzzer = argv.buzzer || 'ps2'

var preferences = {
	game: {
		port: 8081,
		questions_directory: getUserHome()+'/quizzy/questions'
	},
	master: {
		type: 'websocket',
		port: 8082
	},
	buzzer: {
		type: argv.buzzer
	}
}

console.log('start cli')
let game = start(preferences, 'start')

process.stdin.resume();
process.on('exit', (code) => {
	process.exit(code);
	console.log('process exit');
});
process.on('SIGINT', () => {
	console.log('\nCTRL+C...');
	game.buzzer.leave();
	process.exit(0);
});
process.on('uncaughtException', (err) => {
	console.dir(err, { depth: null });
	process.exit(1);
});

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}