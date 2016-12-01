import { WebsocketUI } from './websocket_ui'
import { MasterUI } from './master_ui'

export class WebMasterUI extends WebsocketUI implements MasterUI {

	constructor(port: number) {
		super(port);
	}

}