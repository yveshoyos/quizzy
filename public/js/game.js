(function(angular) {
	const electron = require('electron');
	const dialog = electron.remote.dialog;
	const path = require('path');

	function camelCase(str) {
		return str.replace(/-([a-z])/g, function (m, w) {
		    return w.toUpperCase();
		});
	}

	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	angular.module('game', ['sounds'])
	.component('ui', {
		bindings: {
			type: '@'
		},
		controllerAs: 'ui',
		controller: ['$scope', '$element', '$q', 'Sounds', function(scope, $element, $q, Sounds) {
			console.log('game angular app')

			var ui = this;
			var ws = null;

			this.screen = "starting";
			this.preferences = { 
				websocket_port: 8081,
				questions_directory: __dirname + '/questions',
				buzzer_type: 'teensy'
			};
			this.devices = {
				game: false,
				master: false,
				buzzer: false
			}

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
				start(
					this.preferences.buzzer_type, 
					this.preferences.websocket_port
				);
				console.log('===>', this.preferences.websocket_port)
				this.screen = 'devices';
				ws = new WebSocket("ws://localhost:"+this.preferences.websocket_port);
				ws.onopen = () => {
					console.log('open')
					ui.sounds.play('actors', 500);
					this.send('register', 'game')
				}

				ws.onmessage = (event) => {
					var data = JSON.parse(event.data)
					console.log('game : ', data)

					for(var property in data) {
						if (data.hasOwnProperty(property)) {
							var method = 'receive'+capitalize(camelCase(property));
							this[method].call(this, data[property])
						}
					}
				}

				ws.onerror = () => {
					console.log('ws error')
				}

				ws.onclose = () => {
					console.log('ws close')
				}
			}

			this.send = function(key, value) {
				var data = {}
				data[key] = value
				ws.send(JSON.stringify(data))
			}

			this.receiveDevices = function(devices) {
				console.log('receive devices bro', devices)
				this.devices = devices
				scope.$digest();
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
			devices: '='
		},
		controllerAs: 'devices',
		controller: ['$scope', function(scope) {

			this.$onInit = function() {
				this.devices.game = false;
				this.devices.master = false;
				this.devices.buzzer = false;
			}
			
		}],
		templateUrl: 'public/template/devices.html'
	});

})(angular)
