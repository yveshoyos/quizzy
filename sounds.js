/// <reference path="play.d.ts" />
"use strict";
var play_1 = require('play');
var child_process_1 = require('child_process');
var _play = new play_1.Play();
// player
_play.usePlayer('mplayer');
var sounds = {
    activate_team: './sounds/music_marimba_chord.mp3',
    answer: './sounds/answer.wav',
    actors: '/home/pi/Codes/blindpy/sounds/Cinema_Sins_Background_Song.mp3'
};
/*export function play(type) {
    console.log('playyyyy')
    _play.sound(sounds[type]);
}*/
var commands = {};
function play(type) {
    var cmd = 'mpg123';
    console.log(cmd);
    var proc = child_process_1.spawn(cmd, [sounds[type]]);
    commands[type] = proc;
}
exports.play = play;
function stop(type) {
    var proc = commands[type];
    proc.kill('SIGINT');
}
exports.stop = stop;
