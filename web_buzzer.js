/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />
'use strict';
var ip = require('ip');
var ws = require('nodejs-websocket');
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}
var WebBuzzer = (function () {
    function WebBuzzer(app, port) {
        if (port === void 0) { port = 8083; }
        this.port = port;
        this.app = app;
        this.readyCallbacks = [];
        this.handlers = [];
        this.initWebapp();
        this.initWebsocket();
    }
    WebBuzzer.prototype.ready = function (callback) {
        var _this = this;
        if (this.conn) {
            this.readyCallbacks.map(function () {
                _this.readyCallbacks.forEach(function (f) {
                    f();
                });
            });
        }
        this.readyCallbacks.push(callback);
    };
    WebBuzzer.prototype.lightOn = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': true
        }));
    };
    WebBuzzer.prototype.lightOff = function (controllerIndexes) {
        this.conn.send(JSON.stringify({
            'lights': controllerIndexes,
            'on': false
        }));
    };
    WebBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 0.2; }
    };
    WebBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
        var _this = this;
        var key = 'all';
        if (controllerIndex != undefined || buttonIndex != undefined) {
            key = '';
            if (controllerIndex != undefined) {
                key = 'c' + controllerIndex;
            }
            if (buttonIndex != undefined) {
                key += 'b' + buttonIndex;
            }
        }
        if (!(key in this.handlers)) {
            this.handlers[key] = [];
        }
        this.handlers[key].push(callback);
        return function () {
            var index = _this.handlers[key].indexOf(callback);
            if (index >= 0) {
                _this.handlers[key].splice(index, 1);
            }
        };
    };
    WebBuzzer.prototype.initWebapp = function () {
        var _this = this;
        this.app.get('/buzzer', function (request, response) {
            response.render('buzzer', {
                ip: ip.address(),
                port: _this.port
            });
        });
    };
    WebBuzzer.prototype.initWebsocket = function () {
        var _this = this;
        console.log('Buzzer : listening ws on ', this.port);
        this.ws = ws.createServer(function (conn) {
            _this.conn = conn;
            _this.readyCallbacks.forEach(function (f) {
                f();
            });
            conn.on("text", function (str) {
                var data = JSON.parse(str);
                console.log('buzzer press : ', data);
                if (data.press != undefined) {
                    var controllerIndex = data.press;
                    var buttonIndex = 0;
                    var key = 'c' + controllerIndex;
                    callHandlers(_this.handlers[key], controllerIndex, buttonIndex);
                    callHandlers(_this.handlers['all'], controllerIndex, buttonIndex);
                }
            });
            conn.on("close", function (code, reason) {
            });
        }).listen(this.port);
    };
    WebBuzzer.prototype.controllersCount = function () {
        return 4;
    };
    return WebBuzzer;
}());
exports.WebBuzzer = WebBuzzer;
