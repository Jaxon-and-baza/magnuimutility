const { 
    EmbedBuilder, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle, 
    PermissionFlagsBits, 
    ChannelType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            let ticketCreator; // Track ticket creator
            
            // Handle purchase ticket button interaction
            if (interaction.isButton() && interaction.customId === 'purchase_ticket') {
                const modal = new ModalBuilder()
                    .setCustomId('ticketModal2')
                    .setTitle('Form to Open a Ticket')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('reasonInput')
                                .setLabel('What Type of Service?')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your reason here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('amount')
                                .setLabel('Amount')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your amount here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('paymentmethod')
                                .setLabel('Payment Method')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your payment method here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('video')
                                .setLabel('Video Link')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Link to video/account')
                        )
                    );

                await interaction.showModal(modal);
            }

            // Handle modal submission
            if (interaction.isModalSubmit() && interaction.customId === 'ticketModal2') {
                const reason = interaction.fields.getTextInputValue('reasonInput');
                ticketCreator = interaction.user;

                if (!reason) {
                    return interaction.reply({
                        content: 'A reason is required to open a ticket.',
                        ephemeral: true
                    });
                }

                const guild = interaction.guild;
                const categoryId = '1143259888244502590'; // Ticket category ID
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
                            id: '1255792278295937126', // Support role ID
                            allow: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Purchase Assistance')
                    .setImage('https://cdn.discordapp.com/attachments/1311352918036975726/1312433384844169297/standard_1.gif')
                    .setDescription(`
                        Hey, thank you for reaching out to our team for your purchase request. Please wait for our team to respond.

                        **Details:**
                        > User Name: ${interaction.user.tag}
                        > Service: ${reason}
                        > Amount: ${interaction.fields.getTextInputValue('amount')}
                        > Payment Method: ${interaction.fields.getTextInputValue('paymentmethod')}
                        > Video/Account Link: ${interaction.fields.getTextInputValue('video')}
                    `)
                    .setFooter({ text: 'Magnum Store', iconURL: guild.iconURL() });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket2')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger);

                await ticketChannel.send({
                    content: `${interaction.user}, <@&1255792278295937126>`,
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(closeButton)]
                });

                await interaction.reply({
                    content: 'Your ticket has been created successfully! Check the new channel for further assistance.',
                    ephemeral: true
                });
            }

            // Handle ticket close button
            if (interaction.isButton() && interaction.customId === 'close_ticket2') {
                if (interaction.channel.name.startsWith('purchase-')) {
                    if (ticketCreator.id !== interaction.user.id) {
                        return interaction.reply({
                            content: 'You cannot close this ticket as you are not the creator.',
                            ephemeral: true
                        });
                    }

                    const confirmationEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Confirm Ticket Closure')
                        .setDescription('Are you sure you want to close this ticket? Once closed, it cannot be reopened.')
                        .setFooter({ text: 'Magnum Store', iconURL: interaction.guild.iconURL() });

                    const yesButton = new ButtonBuilder()
                        .setCustomId('close_ticket_confirm2')
                        .setLabel('Yes, Close Ticket')
                        .setStyle(ButtonStyle.Danger);

                    await interaction.reply({
                        embeds: [confirmationEmbed],
                        components: [new ActionRowBuilder().addComponents(yesButton)],
                        ephemeral: true
                    });
                }
            }

            // Confirm ticket closure
            if (interaction.isButton() && interaction.customId === 'close_ticket_confirm2') {
                const ticketChannel = interaction.channel;

                await interaction.deferReply({ ephemeral: true });
                try {
                    const transcriptAttachment = await discordTranscripts.createTranscript(ticketChannel, {
                        limit: -1,
                        returnBuffer: true,
                        fileName: `${ticketChannel.name}.html`
                    });

                    await ticketChannel.delete();
                    await interaction.followUp({
                        content: 'Ticket closed successfully.',
                        ephemeral: true
                    });

                    await interaction.user.send({
                        content: 'Here is the transcript of your closed ticket:',
                        files: [transcriptAttachment]
                    });
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
