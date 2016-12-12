const querystring = require("querystring");
var http = require("http");

var web_key = "";
var web_addr = "";
var options = {};

function WebHandler(setkey, settimeout, wkey, waddr, wpath) {
	this.lastmsg = 0;
	this.ready = false;
	this.key = setkey;
	this.timeout = settimeout;
	this.paused = false;
	this.muted = false;
	
	this.respondlerLabels = [];
	this.respondlers = [];
	
	web_key = wkey;
	web_addr = waddr;
	options = {
		hostname : waddr,
		port : 80,
		path : wpath,
		method : "POST",
		headers : {
			"Content-Type" : "application/x-www-form-urlencoded",
			"Content-Length" : 0;
		}
	};
}

WebHandler.prototype.setRespondler = function(label, stringsender) {
	this.respondlers[label] = stringsender;
	if (!this.respondlerLabels.includes(label)) this.respondlerLabels[label] = label;
};
WebHandler.prototype.unsetRespondler = function(label) {
	if (this.respondlers[label] !== undefined) this.respondlers[label] = undefined;
}
WebHandler.prototype.sendMessage = function(msg) {
	var postData = querystring.stringify({
		"key" : web_key,
		"message" : msg
	});
}

module.exports = WebHandler;