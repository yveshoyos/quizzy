"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_game_server_1 = require("./websocket_game_server");
const process = require("process");
const minimist = require("minimist");
var argv = minimist(process.argv.slice(2));
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
websocket_game_server_1.start(preferences, 'start');
process.stdin.resume();
process.on('exit', (code) => {
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
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
//# sourceMappingURL=websocket_game_server_cli.js.map