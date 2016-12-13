const config = require("./srchat-config.js");
const Eris = require("eris");
var IRC = require("irc");
const WebHandler = require("./srchat-webhandler.js");

var web = new WebHandler(config.web_key, config.web_timeout, config.web_key, config.web_host, config.web_path, config.web_interval);
var discord = new Eris(config.discord_token);
var irc = new IRC.Client(config.irc_server, config.irc_user, { channels : [config.irc_channel] });

irc.on("message#", (from, to, text, message) => {
	if (to === config.irc_channel && from !== irc.nick) {
		if (text === "!test") {
			irc.say(config.irc_channel, "nou");
		} else if (text === "!who") {
			web.sendRequest("who", "irc", web.timeout, web.receiveFunc);
		} else {
			var m = "[i] " + from + ": " + text;
			console.log(m);
			web.sendRequest("msg", m);
			discord.createMessage(config.discord_channel, m);
		}
	}
});
web.setRespondler("irc", function (v) {irc.say(config.irc_channel, v);});

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
			var m = "[d] " + msg.author.username + ": " + msg.content;
			console.log(m);
			web.sendRequest("msg", m);
			irc.say(config.irc_channel, m);
		}
	}
});

discord.connect();
