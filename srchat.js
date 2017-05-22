const config = require("./srchat-config.js");
const Eris = require("eris");
var IRC = require("irc");
const WebHandler = require("./srchat-webhandler.js");

var web = new WebHandler(config.web_key, config.web_timeout, config.web_key, config.web_host, config.web_path, config.web_interval);
var discord = new Eris(config.discord_token);
var irc = new IRC.Client(config.irc_server, config.irc_user, { userName: "srchat", realName: "soulraver bridge", channels : [config.irc_channel] });
irc.activateFloodProtection(500);

var irc_expectwho = false;

irc.on("action", (from, to, text, message) => {
	if (to === config.irc_channel && from !== irc.nick) {
		var m = "[i] *" + from + " " + text+"*";
		console.log(m);
		web.sendRequest("msg", m);
		discord.createMessage(config.discord_channel, m);
	}
});
irc.on("message#", (from, to, text, message) => {
	if (to === config.irc_channel && from !== irc.nick) {
		if (text === "!test") {
			irc.say(config.irc_channel, "nou");
		} else if (text === "!who") {
			web.sendRequest("who", "irc", web.timeout, web.receiveFunc);
			
			var discord_people = discord.getChannel(config.discord_channel).guild.members.filter((v) => {
				return ((v.status !== "offline") && (!v.user.bot));
			});
			if (discord_people.length > 0) {
				var discord_names = [];
				var i = 0;
				while (i < discord_people.length) {
					if (discord_people[i].status === "idle" ) {
						discord_names.push(""+discord_people[i].user.username+"");
					} else {
						discord_names.push(discord_people[i].user.username);
					}
					i++;
				}
				var m = "[d] The following people are in " + discord.getChannel(config.discord_channel).name + ": " + discord_names.join(", ");
				irc.say(config.irc_channel, m);
			}
		} else {
			var m = "[i] " + from + ": " + text;
			console.log(m);
			web.sendRequest("msg", m);
			discord.createMessage(config.discord_channel, m);
		}
	}
});
irc.on("registered", (m) => { console.log(":irc server connected"); });
irc.on("names", (channel, nicks) => {
	if (irc_expectwho) {
		//console.log(Object.keys(nicks).join(", "));
		var irc_users = Object.keys(nicks).filter((v)=>{return !(["D","Q",irc.nick].includes(v));});
		m = "[i] The following people are in "+channel+": "+irc_users.join(", ");
		if (irc_users.length > 0) {
			discord.createMessage(config.discord_channel, m);
		}
		irc_expectwho = false;
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
			irc_expectwho = true;
			irc.send("NAMES", config.irc_channel);
		} else {
			var m = "[d] " + msg.author.username + ": " + msg.cleanContent.replace(/<(:.+?:)\d+>/g, '$1');
			console.log(m);
			web.sendRequest("msg", m);
			irc.say(config.irc_channel, m);
		}
	}
});

discord.connect();
