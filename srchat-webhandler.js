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

var the_source_of_instability = undefined;

function WebHandler(setkey, settimeout, wkey, waddr, wpath) {
	if (the_source_of_instability !== undefined) {
		console.log(":err second call to the fragility that is webhandler");
		return the_source_of_instability;
	};

	this.lastmsg = 0;
	this.ready = false;
	this.key = setkey;
	this.timeout = settimeout;
	this.paused = false;
	this.muted = false;
	this.interval = undefined;
	
	this.respondlerLabels = ["all"];
	this.respondlers = [];
	this.respondlers["all"] = (v) => {
		var i = 0;
		while (i < this.respondlerLabels.length) {
			if (this.respondlerLabels[i] != "all" && this.respondlers[this.respondlerLabels[i]] !== undefined)
				this.respondlers[this.respondlerLabels[i]](v);
			i++;
		}
	};
	
	web_key = wkey;
	web_addr = waddr;
	web_options.hostname = waddr;
	web_options.path = wpath;
	
	the_source_of_instability = this;
}

WebHandler.prototype.setRespondler = function(label, stringsender) {
	if (label == "all") {
		console.log(":err won't override web responder 'all'");
		return;
	}
	
	the_source_of_instability.respondlers[label] = stringsender;
	if (!the_source_of_instability.respondlerLabels.includes(label)) the_source_of_instability.respondlerLabels.push(label);
};
WebHandler.prototype.unsetRespondler = function(label) {
	if (label == "all") {
		console.log(":err won't unset web responder 'all'");
		return;
	}
	
	if (the_source_of_instability.respondlers[label] !== undefined) the_source_of_instability.respondlers[label] = undefined;
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
	
	var req = (callback === undefined ? http.request(options) : http.request(options, callback) );
	
	req.on("error", (e) => { console.log(":err " + e.message); });
	req.write(postData);
	req.end();
}

function TryParseJson(js) {
	try { return JSON.parse(js); }
	catch(e) { return null; }
}

WebHandler.prototype.relayData = function (js) {
	//console.log(js);
	var d = TryParseJson(js);
	if (d === null) {
		the_source_of_instability.ready = false;
		return;
	}
	
	the_source_of_instability.lastmsg = d.last;
	if (!the_source_of_instability.ready) {
		the_source_of_instability.ready = true;
	} else {
		var i = 0;
		while (i < d.lines.length) {
			console.log("[w] " + d.lines[i]);
			the_source_of_instability.respondlers[d.side](d.lines[i]);
			++i;
		}
	}
}
WebHandler.prototype.receiveFunc = function (r) {
	r.setEncoding("utf8");
	r.blobHope = "";
	r.on("data", (c) => { r.blobHope += c; });
	r.on("end", () => { the_source_of_instability.relayData(r.blobHope); });
}
WebHandler.prototype.readWeb = function () {
	//console.log(":readweb w/ last = "+the_source_of_instability.lastmsg);
	if (the_source_of_instability.ready) the_source_of_instability.sendRequest("get", ""+the_source_of_instability.lastmsg, the_source_of_instability.timeout, the_source_of_instability.receiveFunc);
	else the_source_of_instability.sendRequest("last", "", the_source_of_instability.timeout, the_source_of_instability.receiveFunc);
}
WebHandler.prototype.start = function (i) {
	if (the_source_of_instability.interval !== undefined) clearInterval(the_source_of_instability.interval);
	the_source_of_instability.interval = setInterval(the_source_of_instability.readWeb, i);
}

module.exports = WebHandler;