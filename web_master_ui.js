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
var WebMasterUI = (function (_super) {
    __extends(WebMasterUI, _super);
    function WebMasterUI() {
        _super.apply(this, arguments);
    }
    WebMasterUI.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/master', function (request, response) {
            response.render('master', {
                ip: ip.address(),
                port: _this.port
            });
        });
    };
    WebMasterUI.prototype.initWebsocket = function () {
        var _this = this;
        this.ws = ws.createServer(function (conn) {
            _this.conn = conn;
            conn.on("text", function (str) {
                console.log('master receive : ', str);
                var data = JSON.parse(str);
                if (data.register) {
                    console.log('register master');
                    _this.game.register('master', _this);
                }
                if (data.set_mode) {
                    console.log('set mode dude');
                    _this.game.setMode(data.set_mode);
                }
                if (data.add_points) {
                    console.log('add points');
                    _this.game.addPoints(data.add_points);
                }
            });
            conn.on("close", function (code, reason) {
                _this.game.unregister('master');
            });
        }).listen(this.port);
    };
    return WebMasterUI;
}(web_ui_1.WebUI));
exports.WebMasterUI = WebMasterUI;
