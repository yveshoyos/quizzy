
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

				if ('register' in data) {
					console.log('register master');
					//this.game.register('master', this);
					this.eventListeners['ready'].forEach((f) => {
						f();
					});
				}

				if ('set_mode' in data) {
					this.game.setMode(data.set_mode);
				}

				if ('validate_answer' in data) {
					console.log('add points')
					this.game.validateAnswer(data.validate_answer);
				}

			});

			conn.on("error", function() {
				console.log('errrrrr');
			})

			conn.on("close", (code:number, reason:string) => {
				//this.game.unregister('master');
				this.conn = null;
				this.eventListeners['leave'].forEach((f) => {
					f();
				});
			});
		}).listen(this.port);
	}
}
