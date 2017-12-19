"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_ui_1 = require("./websocket_ui");
const game_1 = require("./game");
const teensy_1 = require("node-buzzer/teensy");
const ps2_1 = require("node-buzzer/ps2");
const websocket_1 = require("node-buzzer/websocket");
function start(preferences, startOrContinue) {
    var buzzer;
    switch (preferences.buzzer.type) {
        case 'teensy':
            console.log('teeeeeensy');
            buzzer = get_teensy_buzzer();
            console.log('got');
            break;
        case 'ps2':
            buzzer = get_ps2_buzzer();
            break;
        case 'websocket':
            buzzer = get_websocket_buzzer(preferences.buzzer);
            break;
        default:
            console.log('error');
    }
    console.log('uis...');
    var gameUI = new websocket_ui_1.WebsocketUI(preferences.game.port);
    var masterUI = new websocket_ui_1.WebsocketUI(preferences.master.port);
    var game = new game_1.Game(buzzer, gameUI, masterUI, preferences.game.questions_directory, startOrContinue);
    console.log('Server started...');
}
exports.start = start;
function get_ps2_buzzer() {
    var buzzer = null;
    try {
        var HID = require('node-hid');
        var device = new HID.HID(0x054c, 0x1000);
        buzzer = new ps2_1.Ps2Buzzer(device);
    }
    catch (e) {
        throw new Error("No buzzer found : " + e.message);
    }
    return buzzer;
}
function get_teensy_buzzer() {
    console.log('build TeensyBuzzer object...');
    return new teensy_1.TeensyBuzzer();
}
function get_websocket_buzzer(prefs) {
    return new websocket_1.WebsocketBuzzer(prefs.port);
}
//# sourceMappingURL=websocket_game_server.js.map