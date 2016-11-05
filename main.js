"use strict";
var webserver = require('./webserver');
var game_1 = require('./game');
var web_game_ui_1 = require('./web_game_ui');
var web_master_ui_1 = require('./web_master_ui');
//import { Ps2Buzzer } from './ps2_buzzer';
//import { Buzzer } from './buzzer';
//import { WebBuzzer } from './web_buzzer';
//import { GPIOBuzzer, GPIODomePushButton } from './gpio_buzzer';
var node_buzzer_1 = require('node-buzzer');
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
var device;
switch (argv.buzzer) {
    case 'ps2':
        try {
            var HID = require('node-hid');
            device = new HID.HID(0x054c, 0x1000);
            buzzer = new node_buzzer_1.Ps2Buzzer(device);
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
        buzzer = new node_buzzer_1.GPIOBuzzer(buttons);
        break;
    case 'web':
        buzzer = new node_buzzer_1.WebBuzzer(webapp, 8083);
        break;
}
// web server used by the gameUI and masterUI webapps
var gameUI = new web_game_ui_1.WebGameUI(webapp, 8081);
var masterUI = new web_master_ui_1.WebMasterUI(webapp, 8082);
var game = new game_1.Game(buzzer, gameUI, masterUI);
//buzzer.leave();
process.stdin.resume();
process.on('exit', function (code) {
    process.exit(code);
    console.log('process exit');
});
process.on('SIGINT', function () {
    console.log('\nCTRL+C...');
    buzzer.leave();
    process.exit(0);
});
process.on('uncaughtException', function (err) {
    console.dir(err, { depth: null });
    buzzer.leave();
    process.exit(1);
});
