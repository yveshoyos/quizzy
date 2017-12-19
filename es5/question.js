'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.BlindQuestion = exports.DeafQuestion = exports.Question = exports.Category = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _mime = require('mime');

var mime = _interopRequireWildcard(_mime);

var _musicmetadata = require('musicmetadata');

var mm = _interopRequireWildcard(_musicmetadata);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _mp3Duration = require('mp3-duration');

var mp3Duration = _interopRequireWildcard(_mp3Duration);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
			var extension = path.extname(file);
			var filename = path.basename(file, extension);
			var dir = path.basename(path.dirname(file));

			//var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*\((\d+)\))?$/i
			//var infos:Array<any> = filename.match(regex);

			//var infos:Array<string> = filename.split('--');
			var m = mime.lookup(file).split('/');

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
			var extension = path.extname(this.file);
			var filename = path.basename(this.file, extension);

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

			var extension = path.extname(this.file);
			var filename = path.basename(this.file, extension);

			//   (N°). (author) -- (music) -- (album)? (year)?
			var regex = /^(\d+)\.\s*(.*?)\s*--\s*(.*?)(?:\s*--\s*(.*?))?(?:\s*\((\d+)\))?$/i;
			var infos = filename.match(regex);

			console.log(filename, infos);

			this.author = infos[2].trim();
			this.name = infos[3].trim();
			this.album = infos[4] ? infos[4].trim() : '';
			this.year = infos[5] ? infos[5].trim() : '';

			var parser = mm(fs.createReadStream(this.file), function (err, metadata) {
				if (err) {
					throw err;
				}
				mp3Duration(_this3.file, function (err, duration) {
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
