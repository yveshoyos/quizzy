/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="play.d.ts" />

import { Play } from 'play';

const _play = new Play();

// player
_play.usePlayer('mplayer');

const sounds = {
	activate_team: './sounds/music_marimba_chord.wav',
	answer: './sounds/answer.wav'
};

export function play(type) {
	console.log('playyyyy')
	_play.sound(sounds[type]);
}

