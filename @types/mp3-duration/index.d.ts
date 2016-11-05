declare module "mp3-duration" {

	function mp3Duration(path: string, callback: Function): void;

	namespace mp3Duration {}

	export = mp3Duration;
}