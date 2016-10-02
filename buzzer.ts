export interface Buzzer {
	lightOn(controllerIndexes);
	lightOff(controllerIndexes);
	blink(controllerIndexes, times?, duration?);
	onPress(callback: Function, controllerIndex?:number, buttonIndex?:number);
}