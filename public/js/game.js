(function(angular) {

	angular.module('game', [])
	.service('Sounds', function() {
	 	function Sounds(active) {
	 		this.active = (angular.isDefined(active)) ? active : true;
	 		this.sounds = {};
		}

		Sounds.prototype = {
			constructor: Sounds,
			add: function(type, mp3) {
				if (!this.active) {
					return;
				}

				this.sounds[type] = {
					howl: new Howl({
						src: [mp3],
						preload: true
					}),
					ids: {}
				};
			},
			play: function(type, delay) {
				if (!this.active) {
					return;
				}
				
				var id = new Date().valueOf();
				var delay = angular.isDefined(delay) ? delay : 0;
				var callback = angular.isDefined(callback) ? callback : function() {};

				var sound = this.sounds[type];
				if (!sound) {
					return;
				}
				
				if (delay > 0) {
					sound.ids[id] = {
						timeout: setTimeout(function() {
							sound.ids[id].howlId = sound.howl.play();
							sound.ids[id].timeout = null;
						}, delay)
					};
				} else {
					sound.ids[id] = {
						howlId: sound.howl.play()
					};
				}
				return id;
			},
			stop: function(type, id) {
				if (!this.active) {
					return;
				}

				var id = angular.isDefined(id) ? id : null;
				var sound = this.sounds[type];
				if (!sound) {
					return;
				}

				if (id) {
					var play = sound.ids[id];
					if (play.timeout) {
						clearTimeout(play.timeout);
					} else {
						sound.howl.stop(play.id);
					}
				} else {
					for(var id in sound.ids) {
						var play = sounds.ids[id];
						if (play.timeout) {
							clearTimeout(play.timeout);
						} else {
							sound.howl.stop(play.id);
						}
					}
				}
			},
			fade: function(type, duration, id) {
				if (!this.active) {
					return;
				}

				var id = angular.isDefined(id) ? id : null;
				var duration = angular.isDefined(duration) ? duration : 0;
				var sound = this.sounds[type];
				if (!sound) {
					return;
				}

				if (id) {
					var play = sound.ids[id];
					if (play.timeout) {
						clearTimeout(play.timeout);
					} else {
						sound.howl.fade(1, 0, duration, play.id);
						setTimeout(function() {
							sound.howl.stop(play.id);
						}, duration);
					}
				} else {
					for(var id in sound.ids) {
						var play = sound.ids[id];
						if (play.timeout) {
							clearTimeout(play.timeout);
						} else {
							sound.howl.fade(1, 0, duration, play.id);
							setTimeout(function() {
								sound.howl.stop(play.id);
							}, duration);
						}
					}
				}
			},
			playing: function(type, id) {
				if (!this.active) {
					return false;
				}

				var sound = this.sounds[type];
				if (!sound) {
					return;
				}

				if (id) {
					var play = sound.ids[id];
					if (play.howlId) {
						return sound.howl.playing(play.howlId);
					}
				} else {
					return sound.howl.playing();
				}
			}
		}

		return Sounds;
	})
	.component('ui', {
		bindings: {
			type: '@'
		},
		controllerAs: 'game',
		controller: ['$scope', '$element', '$q', 'Sounds', function(scope, $element, $q, Sounds) {
			var game = this;
			var websocket = new WebSocket("ws://"+window.ip+":"+window.port);
			var howls = [];

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
			game.currentQuestionIndex = -1;
			
			this.isMaster = function() {
				return game.type == 'master';
			};

			this.isGame = function() {
				return game.type == 'game';
			}

			//
			game.sounds = new Sounds(!game.isMaster());
			game.sounds.add('actors', '/sounds/Cinema_Sins_Background_Song.mp3');
			game.sounds.add('buzz', '/sounds/buzz.mp3');

			this.setMode = function(mode) {
				websocket.send(JSON.stringify({
					set_mode: mode
				}));
			};

			this.validateAnswer = function(points, correct) {
				// Only the master is authorized to set the points
				if (!game.isMaster()) {
					return;
				}

				// Master can only set points when an answer is given
				if (!game.answered) {
					return;
				}

				websocket.send(JSON.stringify({
					validate_answer: {
						points: points,
						correct: correct
					}
				}));
			};

			this.reload = function() {
				window.location.reload();
			};

			function turnOffSounds() {
				if (game.sounds.playing('actors')) {
					game.sounds.fade('actors', 1000);
				}
			}

			function preloadQuestion(index) {
				console.log('preloadQuestion : ', index, game.questions[index].file)
				var deferred = $q.defer();

				howls[index] = new Howl({
					src: game.questions[index].file,
					preload: true,
					html5: true,
					onload: function() {
						deferred.resolve(howls[index]);
						scope.$digest();
					}
				});

				return deferred.promise;
			}

			function startQuestion(index) {
				websocket.send(JSON.stringify({
					start_question: index
				}));
			}

			websocket.onopen = function (event) {
				console.log('open')
				game.sounds.play('actors', 500);
				
				websocket.send(JSON.stringify({
					register: game.type
				}));
			};

			websocket.onerror = function(error) {
				game.error = true;
				turnOffSounds();
				scope.$digest();
			}

			websocket.onclose = function(event) {
				game.error = true;
				turnOffSounds();
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
							game.sounds.play('buzz');
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
					if (!game.isMaster()) {
						howls[game.currentQuestionIndex].pause();
					}

					game.start = false;
					game.answered = true;
					game.sounds.play('buzz');
					var bar = document.querySelector('.progress-bar');
					var computedStyle = window.getComputedStyle(bar),
					width = computedStyle.getPropertyValue('width');
					bar.style.width = width;
					bar.classList.remove('animated');
					scope.$digest();
				}

				if (angular.isDefined(data.questions)) {
					// turn off music of start game
					game.sounds.fade('actors', 1000);

					// Load question and reset index
					game.currentQuestionIndex = -1;
					game.questions = data.questions;

					if (game.isGame()) {
						// Preload the first question and start when ready
						preloadQuestion(game.currentQuestionIndex+1).then(function() {
							console.log('question loaded')
							game.currentQuestionIndex++;
							startQuestion(game.currentQuestionIndex);
						});
					}
				}

				if (angular.isDefined(data.start_question)) {
					game.currentQuestionIndex = data.start_question;

					var question = game.questions[game.currentQuestionIndex];
					// Set the question and remove old answer
					game.question = question;
					game.answered = false;
					
					// Set progress bar to 0 and start loading bar
					var bar = document.querySelector('.progress-bar');
					bar.style.width = '0%';

					setTimeout(function() {
						if (game.isGame()) {
							howls[game.currentQuestionIndex].play();
						}
						
						bar.classList.add('animated');
						bar.style.width = '100%';
					}, 100);
				}

				scope.$digest();
			};
		}],
		templateUrl: 'template/teams.html'
	});

})(angular)
