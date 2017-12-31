"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Game = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _question = require('./question');

var _question_loader = require('./question_loader');

var _jsonfile = require('jsonfile');

var jsonfile = _interopRequireWildcard(_jsonfile);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//type Screen = "starting" | "devices" | "mode-select" | "team-activation" | "questions" | "score"
//type Devices = { buzzer: boolean, game: boolean, master: boolean }
//type Mode = "random" | "normal"
//type PlayState = "play" | "continue" | "stop" | "pause"

var Game = exports.Game = function () {
	// buzzer: Buzzer
	// gameUI: GameUI
	// masterUI: GameUI
	// devices: Devices
	// started: boolean
	// screen: Screen
	// oldScreen: Screen
	// mode: Mode
	// teams: Array<Team>
	// questions: QuestionList
	// answers: Array<Array<number>>
	// currentQuestionIndex: number
	// answerWaitingForValidation: number
	// questionsDirectory: string
	// startOrContinue: string

	function Game(buzzer, gameUI, masterUI, questionsDirectory, startOrContinue) {
		var _this = this;

		_classCallCheck(this, Game);

		this.buzzer = buzzer;
		this.gameUI = gameUI;
		this.masterUI = masterUI;
		this.questionsDirectory = questionsDirectory;
		this.devices = { buzzer: false, game: false, master: false };
		this.started = false;
		//this.screen = 'starting'
		this.oldScreen = null;
		this.mode = null;
		this.teams = [];
		this.questions = null;
		this.currentQuestionIndex = -1;
		this.answerWaitingForValidation = null;
		this.answers = [];
		this.startOrContinue = startOrContinue;
		this.buzzOnPressUnregister = null;

		if (startOrContinue == 'continue') {
			this.recoverFromSave();
			console.log('RESEST TEAMS');
			//this.resetTeams();
		}

		this.buzzer.addEventListener('ready', function () {

			var max = _this.buzzer.controllersCount();
			for (var i = 0; i < max; i++) {
				_this.buzzer.lightOff(i);
			}

			_this.devices.buzzer = true;
			_this.checkReady();
		});

		this.gameUI.addEventListener('ready', function () {
			_this.devices.game = true;
			_this.gameUI.setGame(_this);
			_this.checkReady();
		});

		this.masterUI.addEventListener('ready', function () {
			_this.devices.master = true;
			_this.masterUI.setGame(_this);
			_this.checkReady();
		});

		this.buzzer.addEventListener('leave', function () {
			_this.devices.buzzer = false;
			_this.leave();
		});

		this.gameUI.addEventListener('leave', function () {
			_this.devices.game = false;
			_this.leave();
		});

		this.masterUI.addEventListener('leave', function () {
			_this.devices.master = false;
			_this.leave();
		});

		this.buzzer.connect();
	}

	_createClass(Game, [{
		key: 'checkReady',
		value: function checkReady() {
			if (this.devices.game) {
				this.gameUI.sendDevices(this.devices);
			}
			if (this.devices.master) {
				this.masterUI.sendDevices(this.devices);
			}

			if (!this.devices.buzzer || !this.devices.game || !this.devices.master) {
				return;
			}

			if (!this.isStarted()) {
				this.start();
				return;
			}

			// Continue Game
			this.continue();
		}
	}, {
		key: 'leave',
		value: function leave() {
			//this.oldScreen = this.screen;
			//this.screen = 'devices'

			if (this.devices.game) {
				this.gameUI.sendDevices(this.devices);
				//this.gameUI.sendScreen(this.screen)
			}
			if (this.devices.master) {
				this.masterUI.sendDevices(this.devices);
				//this.masterUI.sendScreen(this.screen)
			}
		}
	}, {
		key: 'isStarted',
		value: function isStarted() {
			return this.started;
		}
	}, {
		key: 'start',
		value: function start() {
			var _this2 = this;

			this.started = true;
			console.log('start....');
			this.initTeams();
			this.sendTeams(this.teams);
			if (this.buzzOnPressUnregister) {
				this.buzzOnPressUnregister();
			}
			this.buzzOnPressUnregister = this.buzzer.onPress(function (controllerIndex, buttonIndex) {
				console.log('Server -- buzz1 : ', controllerIndex);
				_this2.activateTeam(controllerIndex);
			});
			//this.setScreen('mode-select')
		}
	}, {
		key: 'continue',
		value: function _continue() {
			//this.setScreen(this.oldScreen)

			// Send the mode if already one
			console.log('SERVER -- CONTINUE : ', this.mode, this.questions.length());
			if (this.mode) {
				this.setMode(this.mode, false, false);
			}

			if (this.teams) {
				this.sendTeams(this.teams);
			}

			console.log(this.currentQuestionIndex, this.questions.length() - 1);
			if (this.questions && this.currentQuestionIndex < this.questions.length() - 1) {
				//this.gameUI.sendQuestions(this.questions.all(), this.currentQuestionIndex)
				//this.masterUI.sendQuestions(this.questions.all(), this.currentQuestionIndex)
				this.startQuestions();
			}

			/*if (this.currentQuestionIndex && this.screen != 'score') {
   	console.log('currentQuestionIndex  : ', this.currentQuestionIndex)
   	this.startQuestion(this.currentQuestionIndex);
   }*/
		}
	}, {
		key: 'save',
		value: function save() {
			var file = path.join(this.questionsDirectory, 'game.json');

			var data = {
				mode: this.mode,
				teams: this.teams,
				started: this.started,
				//screen: this.screen,
				currentQuestionIndex: this.currentQuestionIndex,
				answerWaitingForValidation: this.answerWaitingForValidation,
				answers: this.answers,
				questions: this.questions && this.questions.all()
			};

			var promise = new Promise(function (resolve, reject) {
				jsonfile.writeFile(file, data, function () {
					resolve();
				});
			});

			return promise;
		}
	}, {
		key: 'recoverFromSave',
		value: function recoverFromSave() {
			var file = path.join(this.questionsDirectory, 'game.json');

			var save = jsonfile.readFileSync(file);
			console.log('Server -- save : ', save);
			this.mode = save.mode;
			this.teams = save.teams;
			this.started = save.started;
			//this.screen = save.screen
			//this.oldScreen = save.screen
			this.currentQuestionIndex = save.currentQuestionIndex;
			this.answerWaitingForValidation = save.answerWaitingForValidation;
			this.answers = save.answers;
			this.questions = new _question_loader.QuestionList(this.mode);
			this.questions.fromArray(save.questions);
		}
	}, {
		key: 'removeSave',
		value: function removeSave() {
			var file = path.join(this.questionsDirectory, 'game.json');
			fs.unlink(file);
		}

		/*setScreen(screen) {
  	this.screen = screen
  	this.gameUI.sendScreen(this.screen)
  	this.masterUI.sendScreen(this.screen)
  }*/

		/********************************************
   * MODE SCREEN
   ********************************************/

	}, {
		key: 'setMode',
		value: function setMode(mode) {
			var setScreenMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
			var loadQuestions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

			this.mode = mode;
			this.save();
			if (setScreenMode) {
				this.gameUI.sendPlayMode(mode);
				this.masterUI.sendPlayMode(mode);
			}
			if (loadQuestions) {
				this.loadQuestions(this.mode);
			}
		}

		/********************************************
   * TEAM ACTIVATION SCREEN
   ********************************************/

	}, {
		key: 'initTeams',
		value: function initTeams() {
			var letters = 'ABCDEFGHIJKLMNOPQRST'.split('');
			this.teams = new Array(this.buzzer.controllersCount()).join().split(',').map(function (_, index) {
				return {
					name: letters[index],
					id: letters[index].toLowerCase(),
					lightOn: false,
					active: false,
					flash: false,
					points: 0,
					answered: false
				};
			});
		}

		/*cleanTeams() {
  	this.teams = this.teams.filter((team) => {
  		return this.
  	})
  }*/

	}, {
		key: 'sendTeams',
		value: function sendTeams(teams) {
			this.gameUI.sendTeams(teams);
			this.masterUI.sendTeams(teams);
		}
	}, {
		key: 'updateTeamName',
		value: function updateTeamName(teamIndex, newName) {
			var team = this.teams[teamIndex];
			team.name = newName;
			team.lightOn = true;
			team.flash = true;
			team.answered = false;
			this.sendTeam(team);
		}
	}, {
		key: 'sendTeam',
		value: function sendTeam(team) {
			this.gameUI.sendUpdateTeam(team);
			this.masterUI.sendUpdateTeam(team);
			team.flash = false;
		}

		/*setTeamsActivation() {
  	// Initialize the teams
  	//this.initTeams();
  	//this.sendTeams(this.teams)
  		//this.loadQuestions(this.mode)
  		this.setScreen('team-activation')
  	this.buzzer.onPress((controllerIndex, buttonIndex) => {
  		console.log('Server -- buzz2 : ', controllerIndex)
  		this.activateTeam(controllerIndex)
  	})
  		this.save()
  }*/

	}, {
		key: 'activateTeam',
		value: function activateTeam(controllerIndex) {
			console.log('Server -- activateTeam', controllerIndex, this.teams.length);
			var team = this.teams[controllerIndex];

			// Make sure a team can only be activated once
			if (team.active) {
				return;
			}

			// Light on the new activated team
			this.buzzer.lightOn(controllerIndex);

			// Update the team
			team.active = true;
			team.lightOn = true;
			team.flash = true;
			team.answered = false;
			this.sendTeam(team);

			this.save();
		}

		/********************************************
   * QUESTIONS SCREEN
   ********************************************/

	}, {
		key: 'startQuestions',
		value: function startQuestions() {
			var _this3 = this;

			//this.setScreen('questions')

			//this.cleanTeams(this.teams)
			//this.gameUI.sendTeams(this.teams)
			//this.masterUI.sendTeams(this.teams)

			// Send questions list to UI's
			//this.gameUI.sendQuestions(this.questions.all(), this.currentQuestionIndex)
			//this.masterUI.sendQuestions(this.questions.all(), this.currentQuestionIndex)

			var start = {
				currentQuestionIndex: this.currentQuestionIndex,
				questionsCount: this.questions.length()
			};
			console.log('######', start);
			this.gameUI.send('start', start);
			this.masterUI.send('start', start);

			// Light of all teams and theirs buzzers
			this.teams.map(function (team, index) {
				team.lightOn = false;
				_this3.buzzer.lightOff(index);
				_this3.gameUI.sendUpdateTeam(team);
				_this3.masterUI.sendUpdateTeam(team);
			});

			//console.log('Server -- start questions')
			if (this.buzzOnPressUnregister) {
				this.buzzOnPressUnregister();
			}

			this.buzzOnPressUnregister = this.buzzer.onPress(function (controllerIndex, buttonIndex) {
				// Buzz
				_this3.buzzed(controllerIndex);
			});

			this.save();
		}
	}, {
		key: 'sendQuestion',
		value: function sendQuestion(index) {
			var question = {
				question: this.questions.get(index),
				index: index
			};
			this.gameUI.send('question', question);
			this.masterUI.send('question', question);
		}
	}, {
		key: 'loadQuestions',
		value: function loadQuestions(mode) {
			var _this4 = this;

			var ql = new _question_loader.QuestionLoader();

			this.questions = null;
			ql.load(this.questionsDirectory, mode, function (questions) {
				_this4.questions = questions;
				_this4.questions.map(function (question) {
					question.loadInformations(function () {});
				});
			});
		}
	}, {
		key: 'buzzed',
		value: function buzzed(controllerIndex) {
			console.log('Server -- Press on ' + controllerIndex);
			console.log('Server -- currentQuestionIndex : ', this.currentQuestionIndex);
			console.log('Server -- answerWaitingForValidation : ', this.answerWaitingForValidation);
			if (this.currentQuestionIndex == -1 || this.answerWaitingForValidation != null) {
				return;
			}

			var answer = this.answers[this.currentQuestionIndex];
			console.log('Server -- answer : ', answer);
			if (answer[controllerIndex] != -1) {
				return;
			}

			// Buzz accepted
			var team = this.teams[controllerIndex];
			this.buzzer.lightOn(controllerIndex);
			team.lightOn = true;
			team.flash = true;
			team.answered = true;
			this.sendTeam(team);
			this.answerWaitingForValidation = controllerIndex;

			this.gameUI.sendAnswered(this.currentQuestionIndex, true, controllerIndex);
			this.masterUI.sendAnswered(this.currentQuestionIndex, true, controllerIndex);
		}
	}, {
		key: 'resetTeams',
		value: function resetTeams() {
			var _this5 = this;

			this.answers[this.currentQuestionIndex] = new Array(this.buzzer.controllersCount()).join().split(',').map(function () {
				return -1;
			});

			this.teams.map(function (team) {
				if (team.lightOn || team.answered) {
					team.lightOn = false;
					team.flash = false;
					team.answered = false;
					_this5.sendTeam(team);
				}
			});
		}
	}, {
		key: 'resetBuzzers',
		value: function resetBuzzers() {
			var _this6 = this;

			this.teams.map(function (team, index) {
				_this6.buzzer.lightOff(index);
			});
		}
	}, {
		key: 'startQuestion',
		value: function startQuestion(data) {
			this.answerWaitingForValidation = null;
			this.currentQuestionIndex = data.index;

			if (this.currentQuestionIndex >= this.questions.length()) {
				// end of game, no more questions :(
				console.log('ici ???');
				this.started = false;
				this.removeSave();
				this.gameUI.send('EOG', true);
				this.masterUI.send('EOG', true);
				return;
			}

			this.resetTeams();
			this.resetBuzzers();

			// Set answers for the questions => [-1, -1, -1, -1]


			this.gameUI.sendPlayQuestion(data.index, "play");
			this.masterUI.sendPlayQuestion(data.index, "play");

			this.save();
		}
	}, {
		key: 'continueQuestion',
		value: function continueQuestion() {
			console.log('continue question....');
			this.answerWaitingForValidation = null;
			//this.resetTeams();
			this.resetBuzzers();
			this.gameUI.sendPlayQuestion(this.currentQuestionIndex, "continue");
			this.masterUI.sendPlayQuestion(this.currentQuestionIndex, "continue");

			this.save();
		}
	}, {
		key: 'setPoints',
		value: function setPoints(points) {
			if (this.answerWaitingForValidation == null) {
				return;
			}

			var controllerIndex = this.answerWaitingForValidation;
			var team = this.teams[controllerIndex];

			team.points += points;

			this.answers[this.currentQuestionIndex][controllerIndex] = 1;

			this.buzzer.lightOff(controllerIndex);
			team.lightOn = points > 0;
			team.flash = true;
			this.sendTeam(team);

			this.save();
		}

		/********************************************
   * FINISH SCREEN
   ********************************************/

	}, {
		key: 'finishGame',
		value: function finishGame() {
			//this.setScreen('score')

			this.save();
		}
	}]);

	return Game;
}();
//# sourceMappingURL=game.js.map
