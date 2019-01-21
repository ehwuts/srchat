const config = require("./srchat-config.js");
const Eris = require("eris");
var IRC = require("irc");
const WebHandler = require("./srchat-webhandler.js");

var web = new WebHandler(config.web_key, config.web_timeout, config.web_key, config.web_host, config.web_path, config.web_interval);
var discord = new Eris(config.discord_token);
var irc = new IRC.Client(config.irc_server, config.irc_user, { userName: "srchat", realName: "soulraver bridge" });
irc.activateFloodProtection(500);

var irc_expectwho_discord = false;
var irc_expectwho_web = false;

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
			} else {
				irc.say(config.irc_channel, "[d] The Discord #commons is currently empty.");
			}
		} else {
			var m = "[i] " + from + ": " + text;
			console.log(m);
			web.sendRequest("msg", m);
			discord.createMessage(config.discord_channel, m);
		}
	}
});
irc.on("registered", (m) => {
	console.log(":irc server connected");
	if (config.irc_auth_name != "") irc.send("auth", config.irc_auth_name, config.irc_auth_password);
	irc.send("mode", irc.nick, "+x");
	irc.join(config.irc_channel);
});
irc.on("names", (channel, nicks) => {
	if (irc_expectwho_discord || irc_expectwho_web) {
		//console.log(Object.keys(nicks).join(", "));
		var irc_users = Object.keys(nicks).filter((v)=>{return !(["D","Q",irc.nick].includes(v));});
		m = "[i] The following people are in "+channel+": "+irc_users.join(", ");
		if (irc_users.length <= 0) {
			m = "[i] #soulraver is currently empty";
		}
		if (irc_expectwho_discord) {
			discord.createMessage(config.discord_channel, m);
			irc_expectwho_discord = false;
		} 
		if (irc_expectwho_web) {
			web.sendRequest("msg", m);
			irc_expectwho_web = false;
		}
	}
});
web.setRespondler("irc", function (v) {	
	var commandparse = line.match(/(@?)([\w ]+?): (.+)/);
	if (commandparse !== null && commandparse[3] === "!who") {
		irc_expectwho_web = true;
		irc.send("NAMES", config.irc_channel);
	} else {
		irc.say(config.irc_channel, v);
	}
});

discord.on("ready", () => {
	console.log(":Discord connection ready.");
	web.setRespondler("discord", function (v) {
		var commandparse = line.match(/(@?)([\w ]+?): (.+)/);
		if (commandparse !== null && commandparse[3] === "!who") {
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
				web.sendRequest("msg", m);
			} else {
				web.sendRequest("msg", "[d] The Discord #commons is currently empty.");
			}
			
		} else {
			discord.createMessage(config.discord_channel, v.replace("","**").replace("","__").replace("","*"));
		}
	});
});

discord.on("messageCreate", (msg) => {
	if (msg.channel.id === config.discord_channel && msg.author.id != discord.user.id) {
		if (msg.content === "!test") {
			discord.createMessage(msg.channel.id, "nou");
		} else if (msg.content === "!who") {
			web.sendRequest("who", "discord", web.timeout, web.receiveFunc);
			irc_expectwho_discord = true;
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
/*
discord.on("disconnect", () => {
	discord.connect();
});
*/
discord.on("error", (e) => { console.log(":err " + e.message); });