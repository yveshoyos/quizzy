'use strict';

const ip = require('ip');
const ws = require("nodejs-websocket");
const WebUI = require('./web_ui');


class WebMasterUI extends WebUI {
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
			conn.on("text", (str) => {
				var data = JSON.parse(str);

				if (data.register) {
					console.log('register master');
					this.game.register('master', this);
				}

				if (data.set_mode) {
					this.game.setMode(data.set_mode)
				}
			});

			conn.on("close", (code, reason) => {
				this.game.unregister('master');
			});
		}).listen(this.port);
	}
}

module.exports = WebMasterUI;