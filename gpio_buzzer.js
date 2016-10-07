/// <reference path="rpio.d.ts" />
"use strict";
var rpio = require('rpio');
;
var GPIOBuzzer = (function () {
    function GPIOBuzzer(buttons) {
        this.buttons = buttons;
        console.log('construct...');
        openPins.call(this);
        this.handlers = {};
    }
    GPIOBuzzer.prototype.ready = function (callback) {
        callback();
    };
    GPIOBuzzer.prototype.lightOn = function (controllerIndexes) {
        light.call(this, controllerIndexes, rpio.HIGH);
    };
    GPIOBuzzer.prototype.lightOff = function (controllerIndexes) {
        light.call(this, controllerIndexes, rpio.LOW);
    };
    GPIOBuzzer.prototype.blink = function (controllerIndexes, times, duration) {
        if (times === void 0) { times = 5; }
        if (duration === void 0) { duration = 150; }
        for (var i = 0; i < times; i++) {
            this.lightOn(controllerIndexes);
            rpio.msleep(duration);
            this.lightOff(controllerIndexes);
            rpio.msleep(duration);
        }
    };
    GPIOBuzzer.prototype.onPress = function (callback, controllerIndex, buttonIndex) {
        var _this = this;
        if (controllerIndex === void 0) { controllerIndex = undefined; }
        if (buttonIndex === void 0) { buttonIndex = undefined; }
        console.log('onPress : ');
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
    return GPIOBuzzer;
}());
exports.GPIOBuzzer = GPIOBuzzer;
function light(controllerIndexes, value) {
    for (var i = 0; i < controllerIndexes.length; i++) {
        rpio.write(this.buttons[i].led, value);
    }
}
function openPins() {
    var _this = this;
    console.log('buttons : ', this.buttons);
    this.buttons.forEach(function (pin, controllerIndex) {
        rpio.open(pin.led, rpio.OUTPUT, rpio.LOW);
        rpio.open(pin.button, rpio.INPUT);
        console.log('listening : ', pin.button);
        rpio.poll(pin.button, function () {
            var pressed = !rpio.read(pin.button);
            if (pressed) {
                var key = 'c' + controllerIndex;
                if (key in _this.handlers) {
                    callHandlers(_this.handlers[key], controllerIndex, 0);
                }
                if ('all' in _this.handlers) {
                    callHandlers(_this.handlers['all'], controllerIndex, 0);
                }
            }
        });
    });
}
function callHandlers(handlers, controllerIndex, buttonIndex) {
    if (!handlers) {
        return;
    }
    for (var i in handlers) {
        handlers[i](controllerIndex, buttonIndex);
    }
}