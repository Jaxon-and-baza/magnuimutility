const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'ticketsystem',
    description: 'ticket support',
    permissions: ['SEND_MESSAGES'],
    async execute(message, args) {

        // Define the banner URL (if it's a URL)
        const banner = "https://cdn.discordapp.com/attachments/1311352918036975726/1312433384844169297/standard_1.gif?ex=674c7a56&is=674b28d6&hm=447edb36e3404d27414c15f8e2113c1e5831cde5ef1b09def9c818d2cd58e4cb&";

        // Create the ticket embed
        const ticketEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Ticket Support')
            .setDescription('Click on the button below to open a support ticket and get help from our support team. Troll tickets, and inactive tickets (last 24 hours) will be closed.');

        // Create the "Open Ticket" button
        const openTicketButton = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('Open Ticket')
            .setStyle(ButtonStyle.Primary);

        const purchasebutton = new ButtonBuilder()
            .setCustomId('purchase_ticket')
            .setLabel('Purchase')
            .setStyle(ButtonStyle.Primary);

        // Create the action row with the button
        const row = new ActionRowBuilder().addComponents(openTicketButton, purchasebutton);

        // Send the message with the embed, button, and banner image URL
        message.channel.send({
            embeds: [ticketEmbed],
            components: [row],
            files: [banner]  // Sending the image URL as a file
        });
    }
};
