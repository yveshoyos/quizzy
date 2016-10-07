/// <reference path="rpio.d.ts" />

import * as rpio from 'rpio';
import { Buzzer } from './buzzer';

export interface GPIODomePushButton {
	button: number,
	led: number
};

type indexes = number | Array<number>;

interface IDictionnary<T> {
	[index: string]: T;
}

export class GPIOBuzzer implements Buzzer {
	buttons: Array<GPIODomePushButton>;
	handlers: IDictionnary<Array<Function>>;
	constructor(buttons:Array<GPIODomePushButton>) {
		this.buttons = buttons;
		console.log('construct...');
		openPins.call(this);
		this.handlers = {};
	}

	ready(callback: Function) {
		callback();
	}

	lightOn(controllerIndexes) {
		light.call(this, controllerIndexes, rpio.HIGH);
	}

	lightOff(controllerIndexes) {
		light.call(this, controllerIndexes, rpio.LOW)
	}

	blink(controllerIndexes:Array<number>, times:number = 5, duration:number = 150): void {
		for(var i=0; i < times; i++) {
			this.lightOn(controllerIndexes);
			rpio.msleep(duration);
			this.lightOff(controllerIndexes);
			rpio.msleep(duration);
		}
	}

	onPress(callback: Function, controllerIndex: number = undefined, buttonIndex:number = undefined): Function {
		console.log('onPress : ')
		var key = 'all';
		if (controllerIndex != undefined || buttonIndex != undefined) {
			key = '';
			if (controllerIndex != undefined) {
				key = 'c'+controllerIndex;
			}
			if (buttonIndex != undefined) {
				key += 'b'+buttonIndex
			}
		}

		if (!(key in this.handlers)) {
			this.handlers[key] = [];
		}
		this.handlers[key].push(callback);
		return () => {
			var index = this.handlers[key].indexOf(callback);
			if (index >= 0) {
				this.handlers[key].splice(index, 1);
			}
		};
	}
}

function light(controllerIndexes:Array<number>, value:number) {
	for(var i=0; i < controllerIndexes.length; i++) {
		rpio.write(this.buttons[i].led, value);
	}
}

function openPins() {
	console.log('buttons : ', this.buttons);
	this.buttons.forEach((pin: GPIODomePushButton, controllerIndex:number) => {
		rpio.open(pin.led, rpio.OUTPUT, rpio.LOW);
		rpio.open(pin.button, rpio.INPUT);
		console.log('listening : ', pin.button)
		rpio.poll(pin.button, () => {
			var pressed = !rpio.read(pin.button);
			if (pressed) {
				var key = 'c'+controllerIndex;
				if (key in this.handlers) {
					callHandlers(this.handlers[key], controllerIndex, 0);
				}
				if ('all' in this.handlers) {
					callHandlers(this.handlers['all'], controllerIndex, 0);
				}
			}
		});
		
	});
}

function callHandlers(handlers:Array<Function>, controllerIndex:number, buttonIndex:number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}