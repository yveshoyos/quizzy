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
			this.screen = "starting";
			this.preferences = { 
				websocket_port: 8081,
				questions_directory: __dirname + '/questions',
				buzzer_type: 'hid'
			};
			console.log()

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
			

			scope.$watch(function() {
				return this.show
			}.bind(this), function(show) {
				if (show) {
					this.preferences = angular.copy(this.appPreferences) || {};
				}
			}.bind(this))

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
