const config = require("./srchat-config.js");

const WebHandler = require("./srchat-webhandler.js");
var web = new WebHandler(config.web_key, config.web_timeout, config.web_key, config.web_host, config.web_path);
web.start(config.web_interval);

const Eris = require("eris");
var discord = new Eris(config.discord_token);


discord.on("ready", () => {
	console.log(":Discord connection ready.");
	web.setRespondler("discord", function (v) {discord.createMessage(config.discord_channel, v.replace("","**").replace("","__").replace("","*"));});
});

discord.on("messageCreate", (msg) => {
	if (msg.channel.id === config.discord_channel && msg.author.id != discord.user.id) {
		if (msg.content === "!test") {
			discord.createMessage(msg.channel.id, "nou");
		} else if (msg.content === "!who") {
			web.sendRequest("who", "discord", web.timeout, web.receiveFunc);
		} else {
			console.log("[d] " + msg.author.username + ": " + msg.content);
			web.sendRequest("msg", "[d] " + msg.author.username + ": " + msg.content);
		}
	}
});

discord.connect();
