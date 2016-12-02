import { start, Preferences, BuzzerType, BuzzerPreferences } from './websocket_game_server'

import * as process from 'process';
import * as minimist from 'minimist';

//
// Possible arguments :
// 	- buzzer : "web" or "ps2"
//
interface Args extends minimist.ParsedArgs {
	buzzer:string,
	buttons:string
}
var argv:Args = minimist(process.argv.slice(2)) as Args
argv.buzzer = argv.buzzer || 'ps2'

var preferences: Preferences = {
	game: {
		port: 8081,
		questions_directory: __dirname + '/questions'
	},
	master: {
		type: 'websocket',
		port: 8082
	},
	buzzer: {
		type: argv.buzzer as BuzzerType
	} as BuzzerPreferences
}

start(preferences)

process.stdin.resume();
process.on('exit', (code:number) => {
	process.exit(code);
	console.log('process exit');
});
process.on('SIGINT', () => {
	console.log('\nCTRL+C...');
	process.exit(0);
});
process.on('uncaughtException', (err) => {
	console.dir(err, { depth: null });
	process.exit(1);
});