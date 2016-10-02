/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
"use strict";
var webserver = require('./webserver');
var game_1 = require('./game');
var web_game_ui_1 = require('./web_game_ui');
var web_master_ui_1 = require('./web_master_ui');
var ps2_buzzer_1 = require('./ps2_buzzer');
var PORT = 8080;
var buzzer;
try {
    var HID = require('node-hid');
    var device = new HID.HID(0x054c, 0x1000);
    buzzer = new ps2_buzzer_1.Ps2Buzzer(device);
}
catch (e) {
    throw new Error("No buzzer found : " + e.message);
}
var game = new game_1.Game(buzzer);
// web server used by the gameUI and masterUI webapps
var webapp = webserver.create(8080);
var gameUI = new web_game_ui_1.WebGameUI(webapp, game, 8081);
var masterUI = new web_master_ui_1.WebMasterUI(webapp, game, 8082);
