(function(angular) {
	angular.module('game', [])
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

			var websocket = new WebSocket("ws://vdraspi.local:"+window.port);
			websocket.onopen = function (event) {
				websocket.send(JSON.stringify({
					register: 'game'
				}));
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);
				console.log('game : ', data);

				if (angular.isDefined(data.set_teams)) {
					ctrl.teams = data.set_teams;
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

				if (angular.isDefined(data.activate_team)) {
					for(var i=0; i < ctrl.teams.length; i++) {
						if (ctrl.teams[i].id == data.activate_team.id) {
							ctrl.teams[i] = data.activate_team;
							break;
						}
					}
				}

				if (angular.isDefined(data.set_mode)) {
					ctrl.mode = data.set_mode;
					setTimeout(function() {
						websocket.send(JSON.stringify({
							set_activation_step: 1
						}));
					}, 400);
				}

				if (angular.isDefined(data.set_step)) {
					ctrl.step  = data.set_step;
				}

				scope.$digest();
			};
		}],
		templateUrl: 'template/teams.html'
	});

})(angular)
