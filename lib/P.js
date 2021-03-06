var Emitter = require('events').EventEmitter,
	ConnectionManager = require('./ConnectionManager.js'),
	WebSocketConnection = require('./WebSocketConnection.js'),
	WebRTCConnection = require('./WebRTCConnection.js'),
	its = require('its');

function P(emitter, connectionManager){
	its.defined(emitter);
	its.defined(connectionManager);

	this.emitter = emitter;
	this.peers = connectionManager;

	this.peers.onAdd = function(peer){
		emitter.emit('connection', peer);
	};

	this.peers.onRemove = function(peer){
		emitter.emit('disconnection', peer);
	};

	this.on = emitter.on.bind(emitter);
	this.removeListener = emitter.removeListener.bind(emitter);
}

P.create = function(){
	var emitter = new Emitter(),
		connectionManager = new ConnectionManager();

	return new P(emitter, connectionManager);
};

P.prototype.getPeers = function(){
	return this.peers.get();
};

P.prototype.connect = function(address){
	its.string(address);

	var peers = this.peers,
		peer = WebSocketConnection.create(address, this.peers);

	peers.add(peer);

	peer.on('close', function(){
		peers.remove(peer);
	});

	return peer;
};

module.exports = P;