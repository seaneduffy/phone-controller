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

http.listen(8880, function(){
	console.log('listening on *:8880');
});

let socketManager = require('socket.io-connection-manager')(http);
socketManager.onRegistration(function(connection){
	let session = connection.getSession();
	switch(connection.getLabel()) {
		case 'gameScreen':
			games[session.getId()] = {
				gameScreenConnection: connection
			};
			socketManager.sendToConnection(connection, 'registration code', session.getRegistrationCode());
			break;
		case 'controls':
			games[session.getId()].controlsConnection = connection;
			init(games[session.getId()]);
			break;
		default: break;
	}
});
socketManager.onSessionEnd(function(session){
	delete games[session.getId()];
});
let games = {},
	init = function(game){
		socketManager.sendToConnection(game.controlsConnection, 'game start');
		socketManager.sendToConnection(game.gameScreenConnection, 'game start');
		socketManager.listenToConnection(game.controlsConnection, 'input', (input) => {
			socketManager.sendToConnection(game.gameScreenConnection, 'input', input.data);
		});
	};