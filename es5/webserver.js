'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.create = create;

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _express = require('express');

var express = _interopRequireWildcard(_express);

var _expressHandlebars = require('express-handlebars');

var exphbs = _interopRequireWildcard(_expressHandlebars);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function create(PORT) {
	var app = express();

	app.engine('.hbs', exphbs({
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir: path.join(__dirname, '../views/layouts')
	}));
	app.use(express.static('public'));
	app.set('view engine', '.hbs');
	app.set('views', path.join(__dirname, '../views'));

	app.listen(PORT, function (err) {
		if (err) {
			return console.log('something bad happened', err);
		}
		console.log('server is listening on ' + PORT);
	});

	return app;
}
//# sourceMappingURL=webserver.js.map
