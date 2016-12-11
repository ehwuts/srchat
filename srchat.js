const config = require("./srchat-config.js");

const Eris = require("eris");

var bot = new Eris(config.discord_token);

bot.on("ready", () => {
	console.log("Ready.");
});

bot.on("messageCreate", (msg) => {
	console.log("<" + msg.channel.name + ">" + 
			msg.author.username +  ": " + msg.content);
	if (msg.channel.name === config.discord_channel) {
		if (msg.content === "!ping") 
bot.createMessage(msg.channel.id, "Pong!");
		else if (msg.content === "!pong") 
bot.createMessage(msg.channel.id, "Ping!");
	}
});

bot.connect();
