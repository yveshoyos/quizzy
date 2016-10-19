/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="qrcode-js.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ip from 'ip';
import * as ws from 'nodejs-websocket';
import * as qrCode from 'qrcode-js';
import { WebUI } from './web_ui';

export class WebGameUI extends WebUI {
	app: any;
	ws: ws.Server;
	conn: ws.Connection;

	initWebapp() {
		this.app.get('/game', (request, response) => {
			// engine, defaultConfiguration, options, request, response
			var url = qrCode.toDataURL('http://'+ip.address()+':'+request.socket.localPort+'/master?', 4);
			response.render('game', {
				ip: ip.address(),
				port: this.port,
				qrCodeUrl: url
			});
		});
	}

	initWebsocket() {
		this.ws = ws.createServer((conn) => {
			this.conn = conn;
			conn.on("text", (str:string) => {
				var data = JSON.parse(str);

				if ('register' in data) {
					console.log('register game');
					this.eventListeners['ready'].forEach((f) => {
						f();
					});
					//this.game.register('game', this);
				}

				if ('set_activation_step' in data) {
					//this.game.setMode(data.set_mode)
					if (this.game.step <= 1) {
						this.game.activationStep();
					}
				}
			});

			conn.on("close", (code:number, reason:string) => {
				//this.game.unregister('game');
				this.conn = null;
				this.eventListeners['leave'].forEach((f) => {
					f();
				});
			});
		}).listen(this.port);
	}
}