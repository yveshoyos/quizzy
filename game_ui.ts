import * as ws from 'nodejs-websocket';

export abstract class GameUI {
	ws: ws.Server
	conn: ws.Connection

	constructor(port: number) {
		console.log('create ws server')
		this.ws = ws.createServer((conn) => {
			this.conn = conn

			conn.on("text", (str: string) => {
				var data = JSON.parse(str);
				this.receive(data);
			})

			conn.on("close", (code: number, reason: string) => {
				this.conn = null
			})
		}).listen(port)
	}

	abstract receive(data);


}