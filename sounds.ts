/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="play.d.ts" />

import { Play } from 'play';

const _play = new Play();

// player
_play.usePlayer('aplay');

const sounds = {
	activate_team: './sounds/music_marimba_chord.wav'
};

export function play(type) {
	_play.sound(sounds[type]);
}

