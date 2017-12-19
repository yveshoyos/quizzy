'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.WebsocketUI = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodejsWebsocket = require('nodejs-websocket');

var ws = _interopRequireWildcard(_nodejsWebsocket);

var _game = require('./game');

var _question = require('./question');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebsocketUI = exports.WebsocketUI = function () {
	//ws: ws.Server
	//conn: ws.Connection
	//eventListeners: {}
	//game: Game

	function WebsocketUI(port) {
		var _this = this;

		_classCallCheck(this, WebsocketUI);

		this.eventListeners = { 'ready': [], 'leave': [] };

		this.ws = ws.createServer(function (conn) {
			_this.conn = conn;

			conn.on("text", function (str) {
				var data = JSON.parse(str);
				console.log('receive ', data);
				_this.receive(data);
			});

			conn.on("close", function (code, reason) {
				_this.conn = null;
				_this.triggerEvent('leave', {});
			});

			conn.on("error", function () {
				_this.triggerEvent('error', {});
			});
		}).listen(port);

		this.addEventListener('register', this.register.bind(this));
		this.addEventListener('mode', this.setMode.bind(this));
		this.addEventListener('mode_ok', this.setModeOK.bind(this));
		this.addEventListener('team_name', this.updateTeamName.bind(this));
		this.addEventListener('start_questions', this.startQuestions.bind(this));
		this.addEventListener('start_question', this.startQuestion.bind(this));
		this.addEventListener('points', this.addPoints.bind(this));
		this.addEventListener('continue_question', this.continueQuestion.bind(this));
		this.addEventListener('finish_game', this.finishGame.bind(this));
		this.addEventListener('error', this.error.bind(this));
	}

	_createClass(WebsocketUI, [{
		key: 'addEventListener',
		value: function addEventListener(event, callback) {
			if (!(event in this.eventListeners)) {
				this.eventListeners[event] = [];
			}
			this.eventListeners[event].push(callback);
		}
	}, {
		key: 'removeEventListener',
		value: function removeEventListener(event, callback) {
			var index = this.eventListeners[event].indexOf(callback);
			this.eventListeners[event].splice(index, 1);
		}
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(event, value) {
			if (event in this.eventListeners) {
				this.eventListeners[event].forEach(function (f) {
					f(value);
				});
			}
		}
	}, {
		key: 'receive',
		value: function receive(data) {
			for (var property in data) {
				if (data.hasOwnProperty(property)) {
					this.triggerEvent(property, data[property]);
				}
			}
		}
	}, {
		key: 'send',
		value: function send(event, value) {
			var data = {};
			data[event] = value;
			this.conn.send(JSON.stringify(data));
		}

		/**
   *
   */

	}, {
		key: 'setGame',
		value: function setGame(game) {
			this.game = game;
		}
	}, {
		key: 'sendDevices',
		value: function sendDevices(devices) {
			this.send('devices', devices);
		}
	}, {
		key: 'sendTeams',
		value: function sendTeams(teams) {
			this.send('teams', teams);
		}
	}, {
		key: 'sendUpdateTeam',
		value: function sendUpdateTeam(team) {
			this.send('team', team);
		}
	}, {
		key: 'sendScreen',
		value: function sendScreen(screen) {
			this.send('screen', screen);
		}
	}, {
		key: 'sendPlayMode',
		value: function sendPlayMode(mode) {
			this.send('mode', mode);
		}
	}, {
		key: 'sendQuestions',
		value: function sendQuestions(questions) {
			var startQuestionIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

			this.send('questions', {
				questions: questions,
				startQuestionIndex: startQuestionIndex
			});
		}
	}, {
		key: 'sendPlayQuestion',
		value: function sendPlayQuestion(questionIndex, state) {
			this.send('play_question', {
				'questionIndex': questionIndex,
				'state': state
			});
		}
	}, {
		key: 'sendAnswered',
		value: function sendAnswered(questionIndex, answered) {
			this.send('answered', {
				'questionIndex': questionIndex,
				'answer': answered
			});
		}
	}, {
		key: 'sendAnswer',
		value: function sendAnswer(questionIndex, correct) {
			this.send('answer', {
				'questionIndex': questionIndex,
				'correct': correct
			});
		}

		/**
   *
   */

	}, {
		key: 'register',
		value: function register() {
			this.eventListeners['ready'].forEach(function (f) {
				f();
			});
		}
	}, {
		key: 'setMode',
		value: function setMode(mode) {
			this.game.setMode(mode, true);
		}
	}, {
		key: 'setModeOK',
		value: function setModeOK() {
			this.game.setTeamsActivation();
		}
	}, {
		key: 'updateTeamName',
		value: function updateTeamName(data) {
			this.game.updateTeamName(data.index, data.name);
		}
	}, {
		key: 'startQuestions',
		value: function startQuestions() {
			this.game.startQuestions();
		}
	}, {
		key: 'startQuestion',
		value: function startQuestion(index) {
			this.game.startQuestion(index);
		}
	}, {
		key: 'addPoints',
		value: function addPoints(points) {
			this.game.setPoints(points);
		}
	}, {
		key: 'continueQuestion',
		value: function continueQuestion() {
			this.game.continueQuestion();
		}
	}, {
		key: 'error',
		value: function error() {}
	}, {
		key: 'finishGame',
		value: function finishGame() {
			this.game.finishGame();
		}
	}]);

	return WebsocketUI;
}();
//# sourceMappingURL=websocket_ui.js.map
