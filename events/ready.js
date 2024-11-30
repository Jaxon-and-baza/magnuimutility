const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online`);
        client.user.setPresence({
            activities: [{ 
                name: 'Magnum Store', 
                type: ActivityType.Watching 
            }],
            status: "dnd",
        });
        console.log(`Status: ${client.presence?.status || "unknown"}`);

        client.guilds.cache.forEach(guild => {
            console.log(`Server: ${guild.name}`);
        });

        client.user.setStatus("dnd");
    },
};
