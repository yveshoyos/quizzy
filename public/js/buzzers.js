(function(angular) {
	angular.module('buzzers', [])
	.component('buzzers', {
		controllerAs: 'buzzers',
		controller: ['$scope', function($scope) {
			var ctrl = this;

			this.buzzers = [{
				color: 'red',
				on: false
			}, {
				color: 'greeen',
				on: false
			}, {
				color: 'blue',
				on: false
			}, {
				color: 'orange',
				on: false
			}];

			var websocket = new WebSocket("ws://vdraspi.local:"+window.port);
			websocket.onopen = function (event) {

			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);

				if ('lights' in data) {
					ctrl.buzzers[data.lights].on = data.on;
					$scope.$digest();
				}
			};

			this.press = function(controllerIndex) {
				websocket.send(JSON.stringify({
					'press': controllerIndex
				}));				
			};
		}],
		templateUrl: 'template/buzzers.html'
	});
})(angular);
