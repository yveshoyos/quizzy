const play = require('play').Play();

// player
play.usePlayer('aplay');

const sounds = {
	activate_team: './sounds/music_marimba_chord.wav'
};

module.exports = {
	play: function(type) {
		play.sound(sounds[type]);
	}
};