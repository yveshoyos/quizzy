/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="qrcode-js.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ip = require('ip');
var ws = require('nodejs-websocket');
var qrCode = require('qrcode-js');
var web_ui_1 = require('./web_ui');
var WebGameUI = (function (_super) {
    __extends(WebGameUI, _super);
    function WebGameUI() {
        _super.apply(this, arguments);
    }
    WebGameUI.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/game', function (request, response) {
            // engine, defaultConfiguration, options, request, response
            var url = qrCode.toDataURL('http://' + ip.address() + ':' + request.socket.localPort + '/master?', 4);
            response.render('game', {
                ip: ip.address(),
                port: _this.port,
                qrCodeUrl: url
            });
        });
    };
    WebGameUI.prototype.initWebsocket = function () {
        var _this = this;
        this.ws = ws.createServer(function (conn) {
            _this.conn = conn;
            conn.on("text", function (str) {
                var data = JSON.parse(str);
                if ('register' in data) {
                    console.log('register game');
                    _this.eventListeners['ready'].forEach(function (f) {
                        f();
                    });
                }
                if ('set_activation_step' in data) {
                    //this.game.setMode(data.set_mode)
                    if (_this.game.step <= 1) {
                        _this.game.activationStep();
                    }
                }
                if ('start_question' in data) {
                    _this.game.startQuestion(data.start_question);
                }
            });
            conn.on("close", function (code, reason) {
                //this.game.unregister('game');
                _this.conn = null;
                _this.eventListeners['leave'].forEach(function (f) {
                    f();
                });
            });
        }).listen(this.port);
    };
    return WebGameUI;
}(web_ui_1.WebUI));
exports.WebGameUI = WebGameUI;
