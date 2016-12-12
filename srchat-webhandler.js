const querystring = require("querystring");
var http = require("http");

var web_key = "";
var web_options = {
	hostname : "",
	path : "",
	method : "POST",
	headers : {
		"Content-type" : "application/x-www-form-urlencoded",
		"Content-Length" : 0
	}
};

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
	web_options.hostname = waddr;
	web_options.path = wpath;
}

WebHandler.prototype.setRespondler = function(label, stringsender) {
	this.respondlers[label] = stringsender;
	if (!this.respondlerLabels.includes(label)) this.respondlerLabels[label] = label;
};
WebHandler.prototype.unsetRespondler = function(label) {
	if (this.respondlers[label] !== undefined) this.respondlers[label] = undefined;
}
WebHandler.prototype.sendRequest = function(action, content) {
	var postData = querystring.stringify({
		"k" : web_key,
		"a" : action,
		"content" : content
	});
	var options = Object.assign({}, web_options);
	options.headers["Content-Length"] = Buffer.byteLength(postData);
	
	var req = http.request(options);
	req.on("error", (e) => { console.log(":err " + e.message); });
	req.write(postData);
	req.end();
}

module.exports = WebHandler;