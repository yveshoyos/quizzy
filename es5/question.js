'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.BlindQuestion = exports.DeafQuestion = exports.Question = exports.Category = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _musicmetadata = require('musicmetadata');

var _musicmetadata2 = _interopRequireDefault(_musicmetadata);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mp3Duration = require('mp3-duration');

var _mp3Duration2 = _interopRequireDefault(_mp3Duration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Mp3


var Category =
//name: string;
//questionsCount: number;
exports.Category = function Category(name) {
	_classCallCheck(this, Category);

	this.name = name;
	this.questionsCount = 0;
};

var Question = exports.Question = function () {
	//file: string;
	//name: string;
	//author: string;
	//year: string;
	//type: string;
	//category: string;

	function Question() {
		_classCallCheck(this, Question);
	}

	_createClass(Question, [{
		key: 'loadInformations',
		value: function loadInformations(callback) {
			throw new Error("you have to implement loadInformations method");
		}
	}], [{
		key: 'fromFile',
		value: function fromFile(file) /*: Question*/{
			var extension = _path2.default.extname(file);
			var filename = _path2.default.basename(file, extension);
			var dir = _path2.default.basename(_path2.default.dirname(file));

			//var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
			//var infos:Array<any> = filename.match(regex);

			//var infos:Array<string> = filename.split('--');
			var m = _mime2.default.getType(file).split('/');

			var q;
			if (m[0] == 'audio') {
				q = new BlindQuestion();
			} else {
				q = new DeafQuestion();
			}

			q.file = file;
			q.category = dir;

			return q;
		}
	}]);

	return Question;
}();

var DeafQuestion = exports.DeafQuestion = function (_Question) {
	_inherits(DeafQuestion, _Question);

	function DeafQuestion() {
		_classCallCheck(this, DeafQuestion);

		var _this = _possibleConstructorReturn(this, (DeafQuestion.__proto__ || Object.getPrototypeOf(DeafQuestion)).call(this));

		_this.type = 'deaf';
		return _this;
	}

	_createClass(DeafQuestion, [{
		key: 'loadInformations',
		value: function loadInformations(callback) {
			var extension = _path2.default.extname(this.file);
			var filename = _path2.default.basename(this.file, extension);

			var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i;
			var infos = filename.match(regex);

			this.name = infos[3].trim();
			this.author = infos[2].trim();
			this.year = infos[4] ? infos[4].trim() : '';
		}
	}]);

	return DeafQuestion;
}(Question);

var BlindQuestion = exports.BlindQuestion = function (_Question2) {
	_inherits(BlindQuestion, _Question2);

	//duration: number
	//album: string
	function BlindQuestion() {
		_classCallCheck(this, BlindQuestion);

		var _this2 = _possibleConstructorReturn(this, (BlindQuestion.__proto__ || Object.getPrototypeOf(BlindQuestion)).call(this));

		_this2.type = 'blind';
		return _this2;
	}

	_createClass(BlindQuestion, [{
		key: 'loadInformations',
		value: function loadInformations(callback) {
			var _this3 = this;

			var extension = _path2.default.extname(this.file);
			var filename = _path2.default.basename(this.file, extension);

			//   (N°). (author) -- (music) -- (album)? (year)?
			var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*--\s*(.*?))?(?:\s*\((\d+)\))?$/i;
			var infos = filename.match(regex);

			console.log(filename, infos);

			this.author = infos[2].trim();
			this.name = infos[3].trim();
			this.album = infos[4] ? infos[4].trim() : '';
			this.year = infos[5] ? infos[5].trim() : '';

			var parser = (0, _musicmetadata2.default)(_fs2.default.createReadStream(this.file), function (err, metadata) {
				if (err) {
					throw filename + ":" + err;
				}
				(0, _mp3Duration2.default)(_this3.file, function (err, duration) {
					if (err) {
						throw err;
					}

					_this3.duration = metadata.duration;
					callback();
				});
			});
		}
	}]);

	return BlindQuestion;
}(Question);
//# sourceMappingURL=question.js.map
