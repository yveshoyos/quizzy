/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/minimist/minimist.d.ts" />
"use strict";
var webserver = require('./webserver');
var game_1 = require('./game');
var web_game_ui_1 = require('./web_game_ui');
var web_master_ui_1 = require('./web_master_ui');
var ps2_buzzer_1 = require('./ps2_buzzer');
var web_buzzer_1 = require('./web_buzzer');
var gpio_buzzer_1 = require('./gpio_buzzer');
var process = require('process');
var minimist = require('minimist');
var PORT = 8080;
var argv = minimist(process.argv.slice(2));
argv.buzzer = argv.buzzer || 'ps2';
//
// Buzzer
//
var buzzer;
var webapp = webserver.create(8080);
switch (argv.buzzer) {
    case 'ps2':
        try {
            var HID = require('node-hid');
            var device = new HID.HID(0x054c, 0x1000);
            buzzer = new ps2_buzzer_1.Ps2Buzzer(device);
        }
        catch (e) {
            throw new Error("No buzzer found : " + e.message);
        }
        break;
    case 'gpio':
        var buttons = [];
        var b = JSON.parse(argv.buttons);
        for (var i = 0; i < b.length; i++) {
            buttons.push({
                button: b[i][0],
                led: b[i][1]
            });
        }
        buzzer = new gpio_buzzer_1.GPIOBuzzer(buttons);
        break;
    case 'web':
        buzzer = new web_buzzer_1.WebBuzzer(webapp, 8083);
        break;
}
// web server used by the gameUI and masterUI webapps
var gameUI = new web_game_ui_1.WebGameUI(webapp, 8081);
var masterUI = new web_master_ui_1.WebMasterUI(webapp, 8082);
var game = new game_1.Game(buzzer, gameUI, masterUI);
//buzzer.leave();
function exitHandler(options, err) {
    console.log('exit : ', options, err);
    if (options.ctrlc) {
        console.log('cleanup...');
        //buzzer.leave();
        process.exit();
    }
    if (err) {
        console.log(err.stack);
    }
    if (options.exit) {
        console.log('exit...');
    }
}
//do something when app is closing
process.on('exit', exitHandler.bind(null, { yep: true }));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { ctrlc: true }));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
