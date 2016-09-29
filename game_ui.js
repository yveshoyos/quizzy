'use strict';

const ip = require('ip');
const ws = require("nodejs-websocket");
const WebUI = require('./web_ui');

class GameUI extends WebUI {
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

module.exports = GameUI;