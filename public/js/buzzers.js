(function(angular) {
	angular.module('buzzers', [])
	.component('buzzers', {
		controllerAs: 'buzzers',
		controller: function() {
			this.buzzers = [{
				color: 'red'
			}, {
				color: 'greeen'
			}, {
				color: 'blue'
			}, {
				color: 'orange'
			}];

			var websocket = new WebSocket("ws://vdraspi.local:"+window.port);
			websocket.onopen = function (event) {
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
