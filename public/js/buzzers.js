(function(angular) {
	angular.module('buzzers', [])
	.component('buzzers', {
		controllerAs: 'buzzers',
		controller: function() {
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
				var data = JSON.parse(event.data);
				console.log('buzzer : ', data);

				if ('lights' in data) {
					if (data.on) {

					} else {

					}
				}
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);
			};

			this.press = function(controllerIndex) {
				console.log('press...')
				websocket.send(JSON.stringify({
					'press': controllerIndex
				}));				
			};
		},
		templateUrl: 'template/buzzers.html'
	});
})(angular);
