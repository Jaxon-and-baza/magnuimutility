const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            let ticketCreator;

            // Purchase ticket modal trigger
            if (interaction.isButton() && interaction.customId === 'purchase_ticket') {
                console.log('Button pressed: purchase_ticket');

                // Creating the modal using addComponents() method
                const modal = new ModalBuilder()
                    .setCustomId('ticketModal2')
                    .setTitle('Form to open a ticket')
                    .addComponents(
                        // Reason input row
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('reasonInput')
                                .setLabel("What Type of service")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your reason here')
                        ),
                        // Amount input row
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('amount')
                                .setLabel("Amount")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your amount here')
                        ),
                        // Payment method input row
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('paymentmethod')
                                .setLabel("Payment method")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your payment method here')
                        ),
                        // Video link input row
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('video')
                                .setLabel("Video Link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Link to video/account')
                        )
                    );

                // Show the modal to the user
                await interaction.showModal(modal);
            }

            // Handling modal submission
            if (interaction.isModalSubmit() && interaction.customId === 'ticketModal2') {
                const reason = interaction.fields.getTextInputValue('reasonInput');
                console.log(`Collected reason: ${reason}`);
                ticketCreator = interaction.user;

                if (!reason) {
                    return interaction.reply({ content: 'Reason is required to open a ticket.', ephemeral: true });
                }

                const categoryId = '1143259888244502590'; // The ID for the ticket category
                const guild = interaction.guild;

                const ticketChannel = await guild.channels.create({
                    name: `purchase-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: '1255792278295937126',
                            allow: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });

                await ticketChannel.send(`${interaction.user}, <@&1255792278295937126>`);

                const embed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Purchase Assistance')
                    .setImage("https://cdn.discordapp.com/attachments/1311352918036975726/1312433384844169297/standard_1.gif")
                    .setDescription(`Hey, thank you for reaching out to our team for your purchase request. Please wait for our team response to your ticket.

                    > User Name: ${interaction.user.tag}
                    > Service: ${reason}
                    > Amount: ${interaction.fields.getTextInputValue('amount')}
                    > Payment Method: ${interaction.fields.getTextInputValue('paymentmethod')}
                    > Video/Account Link: ${interaction.fields.getTextInputValue('video')}`)
                    .setFooter({ text: 'Magnum Store', iconURL: guild.iconURL() });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket2')
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

            // Handling the ticket close button
            if (interaction.isButton() && interaction.customId === 'close_ticket2') {
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
                    .setCustomId('close_ticket_confirm2')
                    .setLabel('Yes, Close Ticket')
                    .setStyle(ButtonStyle.Danger);


                const row = new ActionRowBuilder().addComponents(yesButton);

                await interaction.reply({
                    embeds: [confirmationEmbed],
                    components: [row],
                    ephemeral: true
                });
            }

            // Confirming ticket closure
            if (interaction.isButton() && interaction.customId === 'close_ticket_confirm2') {
                const ticketChannel = interaction.channel;

                await interaction.deferReply({ ephemeral: true });

                try {
                    // Generate transcript of the ticket channel
                    const transcriptAttachment = await discordTranscripts.createTranscript(ticketChannel, {
                        limit: -1,
                        returnBuffer: true,
                        fileName: `${ticketChannel.name}.html`
                    });

                    await ticketChannel.delete();
                    await interaction.followUp({
                        content: 'The ticket has been closed successfully.',
                        ephemeral: true
                    });

                    await interaction.user.send({
                        content: 'Here is the transcript of your closed ticket:',
                        files: [transcriptAttachment]
                    });

                    console.log(`Ticket ${ticketChannel.name} has been closed and transcript sent.`);
                } catch (error) {
                    console.error('Error closing ticket:', error);
                    await interaction.followUp({ content: 'An error occurred while closing the ticket.', ephemeral: true });
                }
            }

        } catch (error) {
            console.error('Error processing interaction:', error);
        }
    }
};
