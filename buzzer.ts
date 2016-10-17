export interface Buzzer {
	addEventListener(event: string, callabck: Function): void
	removeEventListener(event: string, callback: Function): void;
	leave(): void;
	lightOn(controllerIndexes:number): void;
	lightOff(controllerIndexes:number): void;
	blink(controllerIndexes:Array<number>, times?:number, duration?:number): void;
	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function;
	controllersCount():number;
}
