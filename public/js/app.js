(function(angular) {
	angular.module('app', [])
	.component('game', {
		controllerAs: 'game',
		controller: ['$scope', function(scope) {
			var ctrl = this;
			ctrl.first = true;
			ctrl.step = 0;
			
			function active() {
				/*document.querySelector('.widget-xs-a').classList.add('flash');
				document.querySelector('.widget-xs-a').classList.add('active');
				setTimeout(function() {
					document.querySelector('.widget-xs-a').classList.remove('flash');
				}, 500);*/
			}

			var websocket = new WebSocket("ws://vdraspi.local:8081");
			websocket.onopen = function (event) {
				websocket.send(JSON.stringify({
					register: 'game'
				}));
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);

				if (data.teams) {
					ctrl.teams = data.teams;
					ctrl.startTeamsActivation = true;
					ctrl.progress = 0;
					
					ctrl.secondsLeft = 8;
					var interval = setInterval(function() {
						ctrl.secondsLeft--;
						ctrl.progress = 100;//Math.floor((8-ctrl.secondsLeft)/8 * 100);
						scope.$digest();
						if (ctrl.secondsLeft <= 0) {
							clearInterval(interval);
						}
					}, 1000);
				}

				if (data.activate_team) {
					for(var i=0; i < ctrl.teams.length; i++) {
						if (ctrl.teams[i].id == data.activate_team.id) {
							ctrl.teams[i] = data.activate_team;
							break;
						}
					}
				}

				if (data.step) {
					ctrl.step  = data.step;
				}

				scope.$digest();
			};
		}],
		templateUrl: 'template/teams.html'
	})
	.component('master', {
		controllerAs: 'master',
		controller: ['$scope', function(scope) {
			var ctrl = this;

			var websocket = new WebSocket("ws://vdraspi.local:8081");
			websocket.onopen = function (event) {
				websocket.send(JSON.stringify({
					register: 'master'
				}));
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);

				if (data.step) {
					ctrl.step  = data.step;
				}

				scope.$digest();
			};

			this.setMode = function(mode) {
				websocket.send(JSON.stringify({
					'set_mode': mode
				}));
			}
		}],
		templateUrl: 'template/master.html'
	})
})(angular)