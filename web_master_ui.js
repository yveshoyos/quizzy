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
                if ('register' in data) {
                    console.log('register master');
                    //this.game.register('master', this);
                    _this.eventListeners['ready'].forEach(function (f) {
                        f();
                    });
                }
                if ('set_mode' in data) {
                    _this.game.setMode(data.set_mode);
                }
                if ('validate_answer' in data) {
                    console.log('add points');
                    _this.game.validateAnswer(data.validate_answer);
                }
            });
            conn.on("error", function () {
                console.log('errrrrr');
            });
            conn.on("close", function (code, reason) {
                //this.game.unregister('master');
                _this.conn = null;
                _this.eventListeners['leave'].forEach(function (f) {
                    f();
                });
            });
        }).listen(this.port);
    };
    return WebMasterUI;
}(web_ui_1.WebUI));
exports.WebMasterUI = WebMasterUI;
