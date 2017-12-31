'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.QuestionLoader = exports.QuestionList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _question = require('./question');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*export interface QuestionList {
	[name: string]: Array<Question>;
}*/

var QuestionList = exports.QuestionList = function () {
	//mode: string;
	//questions: Array<Question>;
	//index: number;

	function QuestionList(mode) {
		_classCallCheck(this, QuestionList);

		this.mode = mode;
		this.questions = [];
		this.index = 0;
	}

	_createClass(QuestionList, [{
		key: 'add',
		value: function add(question) {
			this.questions.push(question);
		}
	}, {
		key: 'reorder',
		value: function reorder() {
			if (this.mode == 'random') {
				this.questions = shuffle(this.questions);
			} else {
				this.questions = this.questions.sort(function (a, b) {
					return a.category.localeCompare(b.category);
				});
			}
		}
	}, {
		key: 'get',
		value: function get(index) {
			return this.questions[index];
		}
	}, {
		key: 'next',
		value: function next() {
			this.index++;
			return this.questions[this.index];
		}
	}, {
		key: 'length',
		value: function length() {
			return this.questions.length;
		}
	}, {
		key: 'all',
		value: function all() {
			return this.questions;
		}
	}, {
		key: 'fromArray',
		value: function fromArray(questions) {
			var _this = this;

			questions.map(function (question) {
				_this.add(question);
			});
		}
	}, {
		key: 'map',
		value: function map(callback) {
			this.questions.forEach(callback);
		}
	}]);

	return QuestionList;
}();

var QuestionLoader = exports.QuestionLoader = function () {

	//questions: QuestionList;

	function QuestionLoader() {
		_classCallCheck(this, QuestionLoader);

		this.questions = null;
	}

	_createClass(QuestionLoader, [{
		key: 'load',
		value: function load(directory, mode, callback) {
			var _this2 = this;

			this.questions = new QuestionList(mode);

			(0, _glob2.default)(directory + "/**/*", function (err, files) {
				files.forEach(function (file) {
					var f = _fs2.default.lstatSync(file);
					if (f.isFile() && _path2.default.basename(file) != 'game.json') {
						var q = _question.Question.fromFile(file);

						_this2.questions.add(q);
					}

					_this2.questions.reorder();
				});
				callback(_this2.questions);
			});
		}
	}]);

	return QuestionLoader;
}();

function shuffle(array) {
	var counter = array.length;

	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		var index = Math.floor(Math.random() * counter);

		// Decrease counter by 1
		counter--;

		// And swap the last element with it
		var temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}
//# sourceMappingURL=question_loader.js.map
