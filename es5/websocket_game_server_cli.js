'use strict';

var _websocket_game_server = require('./websocket_game_server');

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
// Possible arguments :
// 	- buzzer : "web" or "ps2"
//
var argv = (0, _minimist2.default)(_process2.default.argv.slice(2));
argv.buzzer = argv.buzzer || 'ps2';

var preferences = {
	game: {
		port: 8081,
		questions_directory: getUserHome() + '/quizzy/questions'
	},
	master: {
		type: 'websocket',
		port: 8082
	},
	buzzer: {
		type: argv.buzzer
	}
};

console.log('start cli');
var game = (0, _websocket_game_server.start)(preferences, 'start');

_process2.default.stdin.resume();
_process2.default.on('exit', function (code) {
	_process2.default.exit(code);
	console.log('process exit');
});
_process2.default.on('SIGINT', function () {
	console.log('\nCTRL+C...');
	game.buzzer.leave();
	_process2.default.exit(0);
});
_process2.default.on('uncaughtException', function (err) {
	console.dir(err, { depth: null });
	_process2.default.exit(1);
});

function getUserHome() {
	return _process2.default.env[_process2.default.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}
//# sourceMappingURL=websocket_game_server_cli.js.map
