var controller = require('./controller');

module.exports = function(http, registrationCallback, receiveCallback) {
	var connect = require('./connect')(http, function(connection){
		controller.addConnection(connection, registrationCallback);
	});
	
	return controller;
};