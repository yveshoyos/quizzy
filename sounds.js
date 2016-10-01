/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="play.d.ts" />
"use strict";
var play_1 = require('play');
var _play = new play_1.Play();
// player
_play.usePlayer('aplay');
var sounds = {
    activate_team: './sounds/music_marimba_chord.wav'
};
function play(type) {
    _play.sound(sounds[type]);
}
exports.play = play;
