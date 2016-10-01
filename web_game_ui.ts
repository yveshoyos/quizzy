/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ip from 'ip';
import * as ws from 'nodejs-websocket';
import { WebUI } from './web_ui';

export class WebGameUI extends WebUI {
	app: any;
	ws: ws.Server;
	conn: ws.Connection;
	initWebapp() {
		this.app.get('/game', (request, response) => {
			response.render('game', {
				ip: ip.address(),
				port: this.port
			})
		});
	}

	initWebsocket() {
		this.ws = ws.createServer((conn) => {
			this.conn = conn;
			conn.on("text", (str) => {
				var data = JSON.parse(str);

				if (data.register) {
					console.log('register game');
					this.game.register('game', this);
				}

				if (data.set_mode) {
					this.game.setMode(data.set_mode)
				}
			});

			conn.on("close", (code, reason) => {
				this.game.unregister('game');
			});
		}).listen(this.port);
	}
}