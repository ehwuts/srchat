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
	this.interval = undefined;
	
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
//timeout and callback optional
WebHandler.prototype.sendRequest = function(action, content, timeout, callback) {
	var postData = querystring.stringify({
		"k" : web_key,
		"a" : action,
		"content" : content
	});
	var options = Object.assign({}, web_options);
	options.headers["Content-Length"] = Buffer.byteLength(postData);
	if (timeout !== undefined) options.timeout = timeout;
	
	var req = (callback === undefined ? http.request(options) );
	
	req.on("error", (e) => { console.log(":err " + e.message); });
	req.write(postData);
	req.end();
}
WebHandler.prototype.readWeb = function () {

}
WebHandler.prototype.start = function (i) {
	if (this.interval !== undefined) clearInterval(this.interval);
	this.interval = setInterval(this.readWeb, i);
}

module.exports = WebHandler;