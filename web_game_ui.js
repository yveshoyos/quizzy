/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ip = require('ip');
var ws = require('nodejs-websocket');
var web_ui_1 = require('./web_ui');
var WebGameUI = (function (_super) {
    __extends(WebGameUI, _super);
    function WebGameUI() {
        _super.apply(this, arguments);
    }
    WebGameUI.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/game', function (request, response) {
            response.render('game', {
                ip: ip.address(),
                port: _this.port
            });
        });
    };
    WebGameUI.prototype.initWebsocket = function () {
        var _this = this;
        this.ws = ws.createServer(function (conn) {
            _this.conn = conn;
            conn.on("text", function (str) {
                var data = JSON.parse(str);
                if (data.register) {
                    console.log('register game');
                    _this.game.register('game', _this);
                }
                if (data.set_activation_step) {
                    //this.game.setMode(data.set_mode)
                    _this.game.activationStep();
                }
            });
            conn.on("close", function (code, reason) {
                _this.game.unregister('game');
            });
        }).listen(this.port);
    };
    return WebGameUI;
}(web_ui_1.WebUI));
exports.WebGameUI = WebGameUI;
