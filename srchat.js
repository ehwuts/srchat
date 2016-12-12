const config = require("./srchat-config.js");

const WebHandler = require("./srchat-webhandler.js");
var web = new WebHandler(config.web_key, config.web_timeout, config.web_key, config.web_host, config.web_path);

const Eris = require("eris");
var discord = new Eris(config.discord_token);


discord.on("ready", () => {
	console.log(":Discord connection ready.");
	web.setRespondler("discord", function (v) {discord.createMessage(config.discord_channel, v);});
});

discord.on("messageCreate", (msg) => {
	if (msg.channel.id === config.discord_channel && msg.author.id != discord.user.id) {
		console.log("[DSC] " + msg.author.username + ": " + msg.content);
		web.sendMessage(msg.author.username + ": " + msg.content);
		
		if (msg.content === "!test") 
discord.createMessage(msg.channel.id, "nou");
	}
});

discord.connect();
