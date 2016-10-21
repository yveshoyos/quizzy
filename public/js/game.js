(function(angular) {
	angular.module('game', [])
	.component('ui', {
		bindings: {
			type: '@'
		},
		controllerAs: 'game',
		controller: ['$scope', '$element', function(scope, $element) {
			var game = this;
			var websocket = new WebSocket("ws://"+window.ip+":"+window.port);

			// Initialisation
			game.actors = {
				game: false,
				buzzers: false,
				master: false
			};
			game.error = false;
			game.progress = 0;
			game.secondsLeft = 0;
			game.step = 0;
			game.ip = window.ip;
			game.qrCodeUrl = window.qrCodeUrl;
			game.answered = false;

			this.setMode = function(mode) {
				websocket.send(JSON.stringify({
					set_mode: mode
				}));
			};

			this.setPoints = function(value) {
				// Only the master is authorized to set the points
				if (!game.isMaster()) {
					console.log('not auth')
					return;
				}

				// Master can only set points when an answer is given
				if (!game.answered) {
					return;
				}

				console.log('adddddd')
				websocket.send(JSON.stringify({
					add_points: value
				}));
			};

			this.isMaster = function() {
				return game.type == 'master';
			};

			websocket.onopen = function (event) {
				websocket.send(JSON.stringify({
					register: game.type
				}));
			};

			websocket.onerror = function(error) {
				game.error = true;
				scope.$digest();
			}

			websocket.onclose = function(event) {
				game.error = true;
				scope.$digest();
			}

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);
				console.log('game : ', data);

				// Actors
				if (angular.isDefined(data.set_actors)) {
					game.actors = data.set_actors;
				}

				// Steps
				if (angular.isDefined(data.set_step)) {
					game.step  = data.set_step;
				}

				if (angular.isDefined(data.set_teams)) {
					game.teams = data.set_teams;
					game.progress = 0;
					game.secondsLeft = game.teamActivationDuration-1;
					game.startTeamsActivation = true;
					
					var interval = setInterval(function() {
						game.progress = 100;
						game.secondsLeft--;
						scope.$digest();

						// prevent secondsLeft to be negative
						if (game.secondsLeft <= 0) {
							clearInterval(interval);
						}
					}, 1000);
				}

				if (angular.isDefined(data.team_activation_duration)) {
					game.teamActivationDuration = data.team_activation_duration;
					console.log('==>', $element[0].querySelector('.radial-progress .circle .mask'));
					$element[0].querySelectorAll('.radial-progress .circle .mask').forEach(function(el) {
						el.style['transition-duration'] = data.team_activation_duration+'s';
						el.style['-webkit-transition-duration'] = data.team_activation_duration+'s';
					});
					$element[0].querySelectorAll('.radial-progress .circle .fill').forEach(function(el) {
						el.style['transition-duration'] = data.team_activation_duration+'s';
						el.style['-webkit-transition-duration'] = data.team_activation_duration+'s';
					});
					//$element[0].querySelector('.progress-bar').style.transitionDuration =  data.team_activation_duration+'s';
				}

				if (angular.isDefined(data.activate_team)) {
					for(var i=0; i < game.teams.length; i++) {
						if (game.teams[i].id == data.activate_team.id) {
							game.teams[i] = data.activate_team;
							break;
						}
					}
				}

				if (angular.isDefined(data.update_team)) {
					for(var i=0; i < game.teams.length; i++) {
						if (game.teams[i].id == data.update_team.id) {
							game.teams[i] = data.update_team;
							break;
						}
					}
				}

				if (angular.isDefined(data.set_mode)) {
					game.mode = data.set_mode;
					setTimeout(function() {
						websocket.send(JSON.stringify({
							set_activation_step: 1
						}));
					}, 400);
				}

				if (angular.isDefined(data.set_question)) {
					game.question = data.set_question;
					game.answered = false;
					var bar = document.querySelector('.progress-bar');
					bar.style.width = '0%';

					setTimeout(function() {
						bar.classList.add('animated');
						bar.style.width = '100%';
					}, 100);
				}

				if (angular.isDefined(data.set_answered)) {
					game.start = false;
					game.answered = true;
					var bar = document.querySelector('.progress-bar');
					var computedStyle = window.getComputedStyle(bar),
					width = computedStyle.getPropertyValue('width');
					bar.style.width = width;
					bar.classList.remove('animated');
					scope.$digest();
				}

				scope.$digest();
			};
		}],
		templateUrl: 'template/teams.html'
	});

})(angular)
