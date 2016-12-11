const config = require("./srchat-config.js");

const Eris = require("eris");

var bot = new Eris(config.discord_token);

bot.on("ready", () => {
	console.log("Ready.");
});

bot.on("messageCreate", (msg) => {
	console.log("<" + msg.channel + ">" + msg.user  + ": " + 
msg.content);
});

bot.connect();