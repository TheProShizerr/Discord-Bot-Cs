const Gamedig = require('gamedig');
const Database = require('better-sqlite3');
const db = new Database('./main.db');
const { EmbedBuilder } = require('@discordjs/builders');

// Ensure that the highlightedPlayers table exists
db.prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT)").run();

// Add the 'type' column to the highlightedPlayers table if it doesn't exist
const hasTypeColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'type');
if (!hasTypeColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN type TEXT").run();
}

module.exports = {
    name: "serverinfo",
    aliases: ["csinfo"],
    cooldown: 50000, // 50 seconds
    run: async (client, message, args) => {
        let serverInfo;
        try {
            serverInfo = await Gamedig.query({
                type: 'cs16',
                host: '51.83.164.138',
                port: '27015'
            });
        } catch (error) {
            console.error(error);
            return message.reply("An error occurred while trying to retrieve server information.");
        }

        try {
            const rows = db.prepare("SELECT name, type FROM highlightedPlayers").all();
            const highlightedPlayerNames = rows.filter(row => row.type === 'Admin').map(row => row.name);
            const ownerRow = rows.find(row => row.type === 'Owner');
            const playerNames = serverInfo.players.map((player, index) => {
                let name;
                if (ownerRow && player.name === ownerRow.name) {
                    name = `**Owner ${player.name}**`;
                } else if (highlightedPlayerNames.includes(player.name)) {
                    name = `**Admin ${player.name}**`;
                } else {
                    name = player.name;
                }
                return `${index + 1}. ${name}`;
            });

            // Split the player names into two columns
            const halfLength = Math.ceil(playerNames.length / 2);
            const playerNamesLeftColumn = playerNames.slice(0, halfLength).join("\n") || "Na serwerze aktualnie nikt nie gra";
            const playerNamesRightColumn = playerNames.slice(halfLength).join("\n");

            const embed = new EmbedBuilder()
                .setTitle(serverInfo.name)
                .setThumbnail('https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559') // Set the thumbnail of the embed
                .addFields(
                    { name: 'Nazwa mapy', value: serverInfo.map },
                    { name: 'Liczba graczy', value: `${serverInfo.players.length}/${serverInfo.maxplayers}` },
                    { name: 'Nicki graczy', value: playerNamesLeftColumn, inline: true },
                    { name: '\u200B', value: playerNamesRightColumn || '\u200B', inline: true }
                )
                .setFooter({ text: 'Csowicze', iconURL: 'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559' }) // Set the footer text and icon of the embed
                .setColor(15418179); // Set the color of the embed to #D96E57

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply({ content: "An error occurred while trying to retrieve highlighted players from the database.", ephemeral: true });
        }
    }
};
