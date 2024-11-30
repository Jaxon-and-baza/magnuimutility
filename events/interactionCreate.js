const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    try {
      if (interaction.isCommand()) {
        const { commands } = client;
        const command = commands.get(interaction.commandName);

        if (command) {
          await command.execute(interaction, client);
        } else {
          console.warn(`Command '${interaction.commandName}' not found in the client.commands collection.`);
        }
      }
    } catch (error) {
      console.error('Error during interaction processing:', error.stack);
    }
  },
};
