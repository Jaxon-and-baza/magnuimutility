module.exports = {
    name: 'deletechannel',
    description: 'Deletes the channel the command was used in.',
    async execute(message, args) {
      // Check if the user has the correct role
      const requiredRoleId = '1255792278295937126';
      if (!message.member.roles.cache.has(requiredRoleId)) {
        return message.reply('You do not have permission to use this command.');
      }
  
      // Check if the user is trying to delete the current channel
      const channel = message.channel;
  
      // Check if the bot has permission to manage the channel
      if (!message.guild.me.permissions.has('MANAGE_CHANNELS')) {
        return message.reply('I do not have permission to delete the channel.');
      }
  
      // Delete the channel
      try {
        // Send a DM to the user informing them about the deletion
        await message.author.send(`The channel **${channel.name}** has been deleted as per your request.`);
  
        // Delete the channel the command was used in
        await channel.delete();
  
        // Reply in the same channel (this message will be deleted after the channel is deleted)
        return message.reply(`The channel **${channel.name}** has been deleted, and you will receive a DM with more details.`);
      } catch (error) {
        console.error(error);
        return message.reply('An error occurred while trying to delete the channel.');
      }
    },
  };
  