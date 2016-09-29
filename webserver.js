const path = require('path');
//const ip = require("ip");
const express = require('express');
const exphbs = require('express-handlebars');

function create(PORT) {
	const app = express()

	app.engine('.hbs', exphbs({  
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir: path.join(__dirname, 'views/layouts')
	}));
	app.use(express.static('public'));
	app.set('view engine', '.hbs');
	app.set('views', path.join(__dirname, 'views'));

	/*app.get('/', (request, response) => {  
		response.render('home', {
			ip: ip.address()
		})
	});

	app.get('/master', (request, response) => {
		response.render('master', {
			ip: ip.address()
		});
	})*/

	app.listen(PORT, (err) => {  
		if (err) {
			return console.log('something bad happened', err)
		}
		console.log(`server is listening on ${PORT}`)
	});

	return app;
}

module.exports = {
	create: create
};