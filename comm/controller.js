'use strict';

var Session = require('./session');

module.exports = new Controller();

function Controller() {
	
	this.sessionBuffer = {};
	
	this.registerConnection = function(connection, label, registrationCode) {
		let session = 0;
		if(typeof registrationCode !== "undefined") {
			session = this.sessionBuffer[registrationCode];
			if(!!session) {
				session.addConnection(connection, label);
			}
		} else {
			registrationCode = this.createRegistrationCode(connection);
			session = Session(registrationCode);
			this.sessionBuffer[registrationCode] = session;
			session.addConnection(connection, label);
			this.communicate(session, label, 'registration code', registrationCode);
			setTimeout(() => {
				delete this.sessionBuffer[registrationCode];
			}, 300000);
		}
		if(session === 0 || typeof session === "undefined") {
			connection.emit('connect error', 'Could not connect with this code');
		}
		return session;
	};
	
	this.createRegistrationCode = function(connection) {
		var code = "";
		var characters = "abcdefghijklmnopqrstuvwxyz";

		for( var i=0; i < 4; i++ )
			code += characters.charAt(Math.floor(Math.random() * characters.length));
		
		if(!this.sessionBuffer[code]) {
			return code;
		} else {
			return this.createRegistrationCode();
		}
	};
	
	this.communicate = function(session, label, event, data) {
		var connection = session.getConnection(label);
		connection.emit(event, data);
	};
	
	this.listen = function(session, label, event, callback) {
		var connection = session.getConnection(label);
		connection.addListener(event,callback);
	}
	
	return {
		addConnection: (connection, registrationCallback) => {
			connection.addListener('register', (data) => {
				var session = this.registerConnection(connection, data.label, data.registrationCode);
				registrationCallback(session, data.label);
			});
		},
		communicate: (session, label, event, data) => {
			this.communicate(session, label, event, data);
		},
		listen: (session, label, event, callback) => {
			this.listen(session, label, event, callback);
		}
	}
}