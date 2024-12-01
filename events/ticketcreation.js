const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            if (interaction.isButton() && interaction.customId === 'open_ticket') {
                console.log('Button pressed: open_ticket');

                const modal = new ModalBuilder()
                    .setCustomId('ticketModal')
                    .setTitle('Ticket Information');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel('Reason for opening the ticket')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Enter your reason here');

                const actionRow = new ActionRowBuilder().addComponents(reasonInput);
                modal.addComponents(actionRow);

                return await interaction.showModal(modal);
            }

            if (interaction.isModalSubmit() && interaction.customId === 'ticketModal') {
                const reason = interaction.fields.getTextInputValue('reasonInput');
                if (!reason) {
                    return interaction.reply({ content: 'A reason is required to open a ticket.', ephemeral: true });
                }

                const guild = interaction.guild;
                const categoryId = '1143259888244502590'; // Replace with your category ID

                const ticketChannel = await guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: '1255792278295937126', allow: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }
                    ]
                });

                await ticketChannel.setTopic(`Ticket created by: ${interaction.user.id}`);

                const embed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Ticket Assistance')
                    .setDescription(`Hey ${interaction.user}, thank you for opening a ticket! Please describe your issue here. Our staff team will assist you shortly.\n\n**Reason:** ${reason}`)
                    .setFooter({ text: 'Magnum Store', iconURL: guild.iconURL() });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(closeButton);

                await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

                return interaction.reply({ content: 'Your ticket has been created.', ephemeral: true });
            }

            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                const ticketChannel = interaction.channel;

                if (!ticketChannel.topic || !ticketChannel.topic.includes(interaction.user.id)) {
                    return interaction.reply({ content: 'You are not authorized to close this ticket.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Confirm Ticket Closure')
                    .setDescription('Are you sure you want to close this ticket?');

                const confirmButton = new ButtonBuilder()
                    .setCustomId('close_ticket_confirm')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Danger);

                const cancelButton = new ButtonBuilder()
                    .setCustomId('close_ticket_cancel')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

                return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }

            if (interaction.isButton() && interaction.customId === 'close_ticket_confirm') {
                const ticketChannel = interaction.channel;

                const transcript = await discordTranscripts.createTranscript(ticketChannel, {
                    limit: -1,
                    returnType: 'attachment',
                    filename: `ticket-${interaction.channel.id}.html`,
                });

                await interaction.user.send({ content: 'Here is the transcript for your ticket.', files: [transcript] });
                await ticketChannel.delete();
                return console.log(`Ticket closed: ${ticketChannel.id}`);
            }

            if (interaction.isButton() && interaction.customId === 'close_ticket_cancel') {
                return interaction.update({ content: 'Ticket closure canceled.', embeds: [], components: [] });
            }
        } catch (error) {
            console.error('Error processing interaction:', error);
            if (interaction.deferred || interaction.replied) {
                return interaction.followUp({ content: 'An error occurred. Please try again.', ephemeral: true });
            } else {
                return interaction.reply({ content: 'An error occurred. Please try again.', ephemeral: true });
            }
        }
    },
};
