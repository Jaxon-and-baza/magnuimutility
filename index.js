require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const { token } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const prefix = "-";

const handleprefixcommands = async () => {
  try {
    const commandFiles = fs.readdirSync("./prefixcommands").filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`./prefixcommands/${file}`);
      client.commands.set(command.name, command);
      console.log(`Loaded prefix command: ${command.name}`);
    }
  } catch (error) {
    console.error("Error while handling prefix commands:", error.stack);
  }
};

const handleEvents = async () => {
  try {
    const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./events/${file}`);
      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
    }
  } catch (error) {
    console.error("Error while handling events:", error.stack);
  }
};

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(`Error executing command: ${commandName}`, error);
    message.channel.send("There was an error trying to execute that command!");
  }
});

client.handleEvents = handleEvents;
client.handleprefixcommands = handleprefixcommands;

(async () => {
  await client.handleEvents();
  await client.handleprefixcommands();
})();

client.login(token);
