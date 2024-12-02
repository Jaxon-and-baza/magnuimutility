const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            let ticketCreator;

            // Triggering modal when the button is pressed
            if (interaction.isButton() && interaction.customId === 'open_ticket') {
                console.log('Button pressed: open_ticket');

                // Creating modal for ticket creation
                const modal = new ModalBuilder()
                    .setCustomId('ticketModal')
                    .setTitle('Ticket Information');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel("Reason for opening the ticket")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Enter your reason here');

                const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);

                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
            }

            // Handling modal submission
            if (interaction.isModalSubmit() && interaction.customId === 'ticketModal') {
                const reason = interaction.fields.getTextInputValue('reasonInput');
                console.log(`Collected reason: ${reason}`);
                ticketCreator = interaction.user;

                if (!reason) {
                    return interaction.reply({ content: 'Reason is required to open a ticket.', ephemeral: true });
                }

                const categoryId = '1143259888244502590'; // The category ID for the ticket channels
                const guild = interaction.guild;

                // Create the ticket channel with specific permissions
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: '1255792278295937126', // The role ID for staff
                            allow: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id, // The user who created the ticket
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });

                await ticketChannel.send(`${interaction.user}, <@&1255792278295937126>`);

                const embed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Ticket Assistance')
                    .setImage("https://cdn.discordapp.com/attachments/1311352918036975726/1312433384844169297/standard_1.gif")
                    .setDescription(`Thank you for creating a ticket! Please go ahead and tell us the reason why you opened a ticket, and our staff will shortly arrive to assist you.

                    > User Name: ${interaction.user.tag}
                    > Reason: ${reason}`)
                    .setFooter({ text: 'Magnum Store', iconURL: guild.iconURL() });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(closeButton);

                await ticketChannel.send({ embeds: [embed], components: [row] });

                await interaction.reply({
                    content: 'Your ticket has been created successfully! Check the new channel for further assistance.',
                    ephemeral: true
                });

                console.log(`Ticket channel created successfully for ${interaction.user.username}`);
            }

            // Close ticket button interaction
            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                const ticketChannel = interaction.channel;

                // Ensure the ticket creator is the one closing it
                if (ticketCreator.id !== interaction.user.id) {
                    return interaction.reply({
                        content: 'You are not the creator of this ticket and cannot close it.',
                        ephemeral: true
                    });
                }

                const confirmationEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Are you sure you want to close this ticket?')
                    .setDescription('Once closed, you won\'t be able to reply to this ticket. Please confirm.')
                    .setFooter({ text: 'Magnum Store', iconURL: ticketChannel.guild.iconURL() });

                const yesButton = new ButtonBuilder()
                    .setCustomId('close_ticket_confirm')
                    .setLabel('Yes, Close Ticket')
                    .setStyle(ButtonStyle.Danger);

                const noButton = new ButtonBuilder()
                    .setCustomId('close_ticket_cancel')
                    .setLabel('No, Keep Ticket Open')
                    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(yesButton, noButton);

                await interaction.reply({
                    embeds: [confirmationEmbed],
                    components: [row],
                    ephemeral: true
                });
            }

            // Confirm closing the ticket
            if (interaction.isButton() && interaction.customId === 'close_ticket_confirm') {
                const ticketChannel = interaction.channel;

                await interaction.deferReply({ ephemeral: true });

                try {
                    const transcriptAttachment = await discordTranscripts.createTranscript(ticketChannel, {
                        limit: 200000,
                        returnType: 'attachment',
                        filename: `${ticketCreator.id}.html`,
                        saveImages: true,
                        poweredBy: false,
                        hydrate: true,
                        filter: (message) => true
                    });

                    const embed = new EmbedBuilder()
                        .setColor(0x00AE86)
                        .setTitle('Ticket Closed')
                        .setDescription(`Hello ${interaction.user.username}, your support ticket has been closed successfully. Information about the ticket has been provided below.

                        > Ticket ID: ${interaction.channel.id}
                        > Closed By: ${interaction.user.tag}
                        > Open Time: ${interaction.channel.createdAt}
                        > Close Time: ${new Date().toLocaleString()}`)
                        .setFooter({ text: 'Magnum Store', iconURL: ticketChannel.guild.iconURL() });

                    await ticketCreator.send({ embeds: [embed], files: [transcriptAttachment] });

                    await ticketChannel.delete();
                    console.log(`Ticket closed and transcript sent successfully by ${interaction.user.username}`);
                } catch (error) {
                    console.error('Error closing ticket:', error);
                    await interaction.followUp({ content: 'There was an error while closing your ticket. Please try again later.', ephemeral: true });
                }
            }

            // Cancel ticket closure
            if (interaction.isButton() && interaction.customId === 'close_ticket_cancel') {
                await interaction.update({
                    content: 'Ticket close has been canceled. You can continue the conversation here.',
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error processing interaction:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: 'An error occurred while processing your request.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occurred. Please try again.', ephemeral: true });
            }
        }
    },
};
