const { PermissionsBitField, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'close',
    description: 'Close a ticket and send the transcript to the user.',
    async execute(interaction) {
        // Check if the command is used in a ticket channel
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
        }

        // Fetch the ticket channel messages for the transcript
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse().join('\n');

        // Save transcript to a .txt file
        const transcriptFilePath = './transcript.txt';
        fs.writeFileSync(transcriptFilePath, transcript);

        // Get the user who opened the ticket
        const userId = interaction.channel.topic; // Assuming user ID is saved in the channel topic
        const user = await interaction.client.users.fetch(userId);

        if (user) {
            try {
                // Send the transcript and message to the user
                const logoURL = 'https://cdn.discordapp.com/attachments/1311352856556601536/1311725268167032989/Black_and_White_Simple_Typographic_Phantom_Halloween_Logo_20241128_180744_0000.png';
                const gifURL = 'https://cdn.discordapp.com/attachments/1266776833546911806/1312379055743701003/standard.gif';

                const file = new AttachmentBuilder(transcriptFilePath);

                const embed = new EmbedBuilder()
                    .setColor(`#8CFF9E`) // Match your bot's theme
                    .setImage(logoURL)
                    .setDescription('Ticket Closed\nThank you for using Magnum Store. Your ticket has been closed.\n\nMagnum Store');

                await user.send({
                    embeds: [embed],
                    files: [file],
                });

                await user.send(gifURL);
            } catch (error) {
                console.error(`Could not DM the user: ${error}`);
            }
        }

        // Inform in the channel and delete it after sending the messages
        await interaction.reply({ content: 'Closing the ticket...', ephemeral: true });
        await interaction.channel.delete();

        // Clean up transcript file
        fs.unlinkSync(transcriptFilePath);
    },
};
