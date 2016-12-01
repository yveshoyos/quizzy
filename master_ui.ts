import { Game, Devices } from './game'

export interface MasterUI {
	addEventListener(event: string, callback: Function)
	removeEventListener(event: string, callback: Function)
	triggerEvent(event: string, value: any)
	setGame(game: Game)
	//setDevices(devices: Devices)
}