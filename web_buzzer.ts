/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ip from 'ip';
import * as ws from 'nodejs-websocket';
import { Buzzer } from './buzzer';
import * as express from 'express';

function callHandlers(handlers:Array<Function>, controllerIndex:number, buttonIndex:number) {
	if (!handlers) {
		return;
	}

	for (var i in handlers) {
		handlers[i](controllerIndex, buttonIndex);
	}
}

export class WebBuzzer implements Buzzer {
	ws: ws.Server;
	conn: ws.Connection;
	app: express.Express;
	port: number;
	handlers: Array<Array<Function>>;
	readyCallbacks: Array<Function>;
	constructor(app:express.Express, port:number=8083) {
		this.port = port;
		this.app = app;
		this.readyCallbacks = [];
		this.handlers = [];
		
		this.initWebapp()
		this.initWebsocket()
	}

	ready(callback: Function) {
		if (this.conn) {
			this.readyCallbacks.map(() => {
				this.readyCallbacks.forEach((f) => {
					f();
				});
			});
		}
		this.readyCallbacks.push(callback);
	}

	leave(): void {
		this.ws.close();
	}

	lightOn(controllerIndexes:any) {
		this.conn.send(JSON.stringify({
			'lights': controllerIndexes,
			'on': true
		}));
	}

	lightOff(controllerIndexes:any) {
		this.conn.send(JSON.stringify({
			'lights': controllerIndexes,
			'on': false
		}));
	}
	
	blink(controllerIndexes:Array<number>, times:number=5, duration:number=0.2) {
	}

	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function {
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
	
	initWebapp() {
		this.app.get('/buzzer', (request, response) => {
			response.render('buzzer', {
				ip: ip.address(),
				port: this.port
			})
		});
	}

	initWebsocket() {
		console.log('Buzzer : listening ws on ', this.port);
		this.ws = ws.createServer((conn) => {
			this.conn = conn;

			this.readyCallbacks.forEach((f) => {
				f();
			});

			conn.on("text", (str:string) => {
				var data = JSON.parse(str);
				console.log('buzzer press : ', data)
				if (data.press != undefined) {
					var controllerIndex = data.press;
					var buttonIndex = 0;
					
					var key = 'c'+controllerIndex;
					callHandlers(this.handlers[key], controllerIndex, buttonIndex);

					callHandlers(this.handlers['all'], controllerIndex, buttonIndex);					
				}
			});

			conn.on("close", (code:number, reason:string) => {
			});
		}).listen(this.port);
	}

	controllersCount():number {
		return 4;
	}
}

