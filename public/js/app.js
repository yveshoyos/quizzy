(function(angular) {
	angular.module('app', [])
	.component('game', {
		controllerAs: 'game',
		controller: ['$scope', function(scope) {
			var ctrl = this;
			ctrl.first = true;
			console.log('game ctrl : ', window.ip)

			function active() {
				/*document.querySelector('.widget-xs-a').classList.add('flash');
				document.querySelector('.widget-xs-a').classList.add('active');
				setTimeout(function() {
					document.querySelector('.widget-xs-a').classList.remove('flash');
				}, 500);*/
			}

			var websocket = new WebSocket("ws://"+window.ip+":8081");
			websocket.onopen = function (event) {
				console.log('connnected');
				
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);

				if (data.teams) {
					ctrl.teams = data.teams;
					ctrl.startTeamsActivation = true;
					
					ctrl.secondsLeft = 8;
					var interval = setInterval(function() {
						ctrl.secondsLeft--;
						scope.$digest();
						if (ctrl.secondsLeft <= 0) {
							clearInterval(interval);
						}
					}, 1000);

					scope.$digest();

				} else if (data.activate_team) {
					for(var i=0; i < ctrl.teams.length; i++) {
						if (ctrl.teams[i].id == data.activate_team.id) {
							ctrl.teams[i] = data.activate_team;
							break;
						}
					}
					scope.$digest();
				}
			};
		}],
		templateUrl: 'template/teams.html'
	})
})(angular)