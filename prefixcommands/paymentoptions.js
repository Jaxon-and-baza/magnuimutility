const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'payment-options',
  description: 'Provides payment instructions',

  execute(message, args) {
    const paymentEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('Payment Instructions')
      .setDescription(
        `**Instructions:**\n\n` +
        `**1. PayPal Payment Method**\n` +
        `Use PayPal Friends and Family for the transaction.\n\n` +
        `**2. Provide Proof**\n` +
        `Take a screenshot of the transaction.\n` +
        `Include a screenshot of PayPal's home page for confirmation.\n\n` +
        `**3. Send Payment Details**\n` +
        `Send the following PayPal email address: **sp4rky0s1@gmail.com**.`
      )
      .setFooter({ text: 'Ensure all steps are followed for successful payment processing.' });

    message.channel.send({ embeds: [paymentEmbed] });
  },
};
