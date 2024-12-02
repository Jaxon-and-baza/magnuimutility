const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            let ticketCreator;

            // Triggering modal for purchase ticket
            if (interaction.isButton() && interaction.customId === 'purchase_ticket') {
                console.log('Button pressed: purchase_ticket');

                // Creating modal for ticket creation
                const modal = new ModalBuilder()
                    .setCustomId('ticketModal2')
                    .setTitle('Form to open a ticket')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('reasonInput')
                                .setLabel("What Type of service")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your reason here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('amount')
                                .setLabel("Amount")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your amount here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('paymentmethod')
                                .setLabel("Payment method")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter your payment method here')
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('video')
                                .setLabel("Video Link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder('Enter the video link')
                        ),
                    );

                await interaction.showModal(modal);
            }

            // Handling modal submission
            if (interaction.isModalSubmit() && interaction.customId === 'ticketModal2') {
                const reason = interaction.fields.getTextInputValue('reasonInput');
                const amount = interaction.fields.getTextInputValue('amount');
                const paymentmethod = interaction.fields.getTextInputValue('paymentmethod');
                const video = interaction.fields.getTextInputValue('video');
                console.log(`Collected info: ${reason}, ${amount}, ${paymentmethod}, ${video}`);
                ticketCreator = interaction.user;

                if (!reason || !amount || !paymentmethod || !video) {
                    return interaction.reply({ content: 'All fields are required to create a ticket.', ephemeral: true });
                }

                const categoryId = '1143259888244502590'; // The category ID for the ticket channels
                const guild = interaction.guild;

                // Create the ticket channel with specific permissions
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
                    .setTitle('Purchase Request Assistance')
                    .setDescription(`Thank you for creating a ticket! Below are the details:

                    > Service Type: ${reason}
                    > Amount: ${amount}
                    > Payment Method: ${paymentmethod}
                    > Video Link: ${video}`)
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
        } catch (error) {
            console.error('Error processing interaction:', error);
        }
    },
};
