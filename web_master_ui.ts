/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/ip/ip.d.ts" />
/// <reference path="nodejs-websocket.d.ts" />

'use strict';

import * as ip from 'ip';
import * as ws from 'nodejs-websocket';
import { WebUI } from './web_ui';


export class WebMasterUI extends WebUI {
	app: any;
	ws: ws.Server;
	conn: ws.Connection;
	initWebapp() {
		this.app.get('/master', (request, response) => {
			response.render('master', {
				ip: ip.address(),
				port: this.port
			})
		});
	}

	initWebsocket() {
		this.ws = ws.createServer((conn) => {
			this.conn = conn;
			conn.on("text", (str:string) => {
				console.log('master receive : ', str)
				var data = JSON.parse(str);

				if (data.register) {
					console.log('register master');
					this.game.register('master', this);
				}

				if (data.set_mode) {
					console.log('set mode dude')
					this.game.setMode(data.set_mode);
				}
			});

			conn.on("close", (code:number, reason:string) => {
				this.game.unregister('master');
			});
		}).listen(this.port);
	}
}