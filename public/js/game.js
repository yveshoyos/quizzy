(function(angular) {
	const electron = require('electron');
	const dialog = electron.remote.dialog;
	const path = require('path');

	angular.module('game', ['sounds'])
	.component('ui', {
		bindings: {
			type: '@'
		},
		controllerAs: 'ui',
		controller: ['$scope', '$element', '$q', 'Sounds', function(scope, $element, $q, Sounds) {
			var ui = this;
			var ws = null;

			this.screen = "starting";
			this.preferences = { 
				websocket_port: 8081,
				questions_directory: __dirname + '/questions',
				buzzer_type: 'hid'
			};

			ui.sounds = new Sounds(true);
			ui.sounds.add('actors', __dirname + '/sounds/Cinema_Sins_Background_Song.mp3');
			ui.sounds.add('buzz', __dirname + '/sounds/buzz.mp3');

			/**
			 * Preferences
			 */
			this.openPreferences = function() {
				this.screen = "preferences";
			}

			this.preferencesClose = function(preferences) {
				if (preferences) {
					this.preferences = preferences;
				}
				
				this.screen = 'starting';
			}

			this.initStartGame = function() {
				this.screen = 'devices';
				ws = new WebSocket("ws://localhost:8081");
				ws.onopen = () => {
					console.log('open')
					ui.sounds.play('actors', 500);
				}
			}
		}],
		templateUrl: 'public/template/game.html'
	})
	.component('preferences', {
		bindings: {
			appPreferences: '=preferences',
			onClose: '&',
			show: '='
		},
		controllerAs: 'preferences',	
		controller: ['$scope', function(scope) {
			

			scope.$watch(() => {
				return this.show
			}, (show) => {
				if (show) {
					this.preferences = angular.copy(this.appPreferences) || {};
				}
			});

			this.browseQuestionsDirectory = function() {
				this.preferences.questions_directory = dialog.showOpenDialog({properties: ['openDirectory']})[0];
			}

			this.cancel = function() {
				this.onClose(null);
			}

			this.save = function() {
				this.onClose({
					preferences: this.preferences
				});
			}
		}],
		templateUrl: 'public/template/preferences.html'
	})
	.component('devices', {
		bindings: {

		},
		controllerAs: 'devices',
		controller: ['$scope', function(scope) {
			this.game = true;
			this.master = false;
			this.buzzer = false;
		}],
		templateUrl: 'public/template/devices.html'
	});

})(angular)
