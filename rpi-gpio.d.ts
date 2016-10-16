declare module "rpi-gpio" {
	export const DIR_IN: string;
	export const DIR_OUT: string;
	export const MODE_RPI: string;
	export const mode_BCM: string;
	export const EDGE_NONE: string;
	export const EDGE_RISING: string;
	export const EDGE_FALLING: string;
	export const EDGE_BOTH: string;

	export function setMode(mode: string): void;
	export function setup(channel: number, onSetup: Function);
	export function setup(channel: number, direction: string, onSetup: Function);
	export function setup(channel: number, direction: string, edge, onSetup: Function);

	export function write(channel: number, value: boolean, cb: Function);
	export function output(channel: number, value: boolean, cb: Function);
	export function read(channel: number, cb: Function);
	export function input(channel: number, cb: Function);

	export function destroy(cb: Function);
	export function reset();

	export function on(type: string, callback: Function);
}