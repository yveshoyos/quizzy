declare module "play" {
    export class Play {
		sound(file: string, callback?: Function): Function;
		usePlayer(player: string);
	}
}