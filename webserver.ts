
'use strict';

import * as path from 'path';
import * as express from 'express';
import * as exphbs from 'express-handlebars';

export function create(PORT: number) {
	const app = express()

	app.engine('.hbs', exphbs({  
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir: path.join(__dirname, '../views/layouts')
	}));
	app.use(express.static('public'));
	app.set('view engine', '.hbs');
	app.set('views', path.join(__dirname, '../views'));

	

	app.listen(PORT, (err) => {  
		if (err) {
			return console.log('something bad happened', err)
		}
		console.log(`server is listening on ${PORT}`)
	});

	

	return app;
}