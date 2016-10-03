(function(angular) {
	angular.module('master', [])
	.component('master', {
		controllerAs: 'master',
		controller: ['$scope', function(scope) {
			var ctrl = this;

			var websocket = new WebSocket("ws://vdraspi.local:"+window.port);
			websocket.onopen = function (event) {
				websocket.send(JSON.stringify({
					register: 'master'
				}));
			};

			websocket.onmessage = function(event) {
				var data = JSON.parse(event.data);
				console.log('master : ', data);

				if (data.set_step) {
					ctrl.step  = data.set_step;
				}

				scope.$digest();
			};

			this.setMode = function(mode) {
				websocket.send(JSON.stringify({
					set_mode: mode
				}));
			}
		}],
		templateUrl: 'template/master.html'
	})
})(angular);
