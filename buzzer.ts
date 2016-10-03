export interface Buzzer {
	ready(callabck: Function): void;
	lightOn(controllerIndexes:number): void;
	lightOff(controllerIndexes:number): void;
	blink(controllerIndexes:Array<number>, times?:number, duration?:number): void;
	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number): Function;
}
