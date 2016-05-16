'use strict';

let express = require('express'),
	app = express(),
http = require('http').Server(app);

app.use(express.static('./public'));
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('gameScreen', {});
});

app.get('/controls', function(req, res) {
	res.render('controls', {});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

let comm = require('./comm/')(http, (session, label) => {
	if(typeof session !== "undefined") {
		switch(label) {
			case 'gameScreen':
				sessions[session.getId()] = session;
				break;
			case 'controls':
				init(sessions[session.getId()]);
				break;
			default: break;
		};
	}
});

let sessions = {},
	init = function(session){
		comm.communicate(session, 'controls', 'game start');
		comm.communicate(session, 'gameScreen', 'game start');
		comm.listen(session, 'controls', 'input', (input) => {
			comm.communicate(session, 'gameScreen', 'input', input.data);
		});
	};