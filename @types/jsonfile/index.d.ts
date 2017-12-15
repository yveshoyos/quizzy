declare module "jsonfile" {

	export function readFile(file: string, cb: Function);
	export function readFile(file: string, options: Object, cb: Function);
	export function readFileSync(file: string);
	export function readFileSync(file: string, options: Object);

	export function writeFile(file: string, obj: Object, cb: Function);
	export function writeFile(file: string, obj: Object, options: Object, cb:Function);
	export function writeFileSync(file: string, obj: Object);
	export function writeFileSync(file: string, obj: Object, options: Object);
}