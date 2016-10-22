/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="play.d.ts" />

import { Play } from 'play';
import { exec, spawn } from 'child_process';

const _play = new Play();

// player
_play.usePlayer('mplayer');

const sounds = {
	activate_team: './sounds/music_marimba_chord.mp3',
	answer: './sounds/answer.wav',
	actors: '/home/pi/Codes/blindpy/sounds/Cinema_Sins_Background_Song.mp3'
};

/*export function play(type) {
	console.log('playyyyy')
	_play.sound(sounds[type]);
}*/

var commands = {};

export function play(type: string) {
	var cmd = 'mpg123';
	console.log(cmd);
	
	var proc = spawn(cmd, [ sounds[type] ]);
	commands[type] = proc;

	
}

export function stop(type: string) {
	var proc = commands[type];
	proc.kill('SIGINT');
}
