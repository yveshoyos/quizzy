/// <reference path="node_modules/definitely-typed/node/node.d.ts" />
/// <reference path="node_modules/definitely-typed/express/express.d.ts" />
/// <reference path="node_modules/definitely-typed/promise/promise.d.ts" />
/// <reference path="node_modules/definitely-typed/express-handlebars/express-handlebars.d.ts" />
'use strict';
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
function create(PORT) {
    var app = express();
    app.engine('.hbs', exphbs({
        defaultLayout: 'main',
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'views/layouts')
    }));
    app.use(express.static('public'));
    app.set('view engine', '.hbs');
    app.set('views', path.join(__dirname, 'views'));
    app.listen(PORT, function (err) {
        if (err) {
            return console.log('something bad happened', err);
        }
        console.log("server is listening on " + PORT);
    });
    return app;
}
exports.create = create;
