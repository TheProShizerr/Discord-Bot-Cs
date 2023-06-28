const Gamedig = require('gamedig');
const Database = require('better-sqlite3');
const db = new Database('./zm.db');
const { EmbedBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

// Ensure that the highlightedPlayers table exists
db.prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT)").run();

// Add the 'type' column to the highlightedPlayers table if it doesn't exist
const hasTypeColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'type');
if (!hasTypeColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN type TEXT").run();
}

// Ensure that the serverInfoMessage table exists
db.prepare("CREATE TABLE IF NOT EXISTS serverInfoMessage (channelId TEXT PRIMARY KEY, messageId TEXT)").run();

module.exports = {
    name: "ready",
    once: true,
    execute: async (client) => {
        const channelId = 'ID-KANAŁU';
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            console.error(`Nie znaleziono kanału o ID ${channelId}.`);
            return;
        }
        
        let serverInfoMessage;
        const updateServerInfo = async () => {
            let serverInfo;
            try {
                serverInfo = await Gamedig.query({
                    type: 'cs16',
                    host: 'IP-SERWERA',
                    port: 'PORT-SERWERA'
                });
            } catch (error) {
                console.error(error);
                return;
            }

            try {
                const rows = db.prepare("SELECT name, type FROM highlightedPlayers").all();
                const highlightedPlayerNames = rows.filter(row => row.type === 'Admin').map(row => row.name);
                const ownerPlayerNames = rows.filter(row => row.type === 'Owner').map(row => row.name);
                const playerNames = serverInfo.players.map((player, index) => {
                    let name;
                    if (highlightedPlayerNames.includes(player.name)) {
                        name = `**Admin ${player.name}**`;
                    } else if (ownerPlayerNames.includes(player.name)) {
                        name = `**Owner ${player.name}**`;
                    } else {
                        name = player.name;
                    }
                    return `${index + 1}. ${name}`;
                });

                // Split the player names into two columns
                const halfLength = Math.ceil(playerNames.length / 2);
                const playerNamesLeftColumn = playerNames.slice(0, halfLength).join("\n") || "Na serwerze aktualnie nikt nie gra";
                const playerNamesRightColumn = playerNames.slice(halfLength).join("\n");

                const nextUpdateTimestamp = Math.floor((Date.now() + 50000) / 1000);

                const embed = new EmbedBuilder()
                    .setTitle(serverInfo.name)
                    .setThumbnail('https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559') // Set the thumbnail of the embed
                    .addFields(
                        { name: 'Nazwa mapy', value: serverInfo.map },
                        { name: 'Liczba graczy', value: `${serverInfo.players.length}/${serverInfo.maxplayers}` },
                        { name: 'Nicki graczy', value: playerNamesLeftColumn, inline: true },
                        { name: '\u200B', value: playerNamesRightColumn || '\u200B', inline: true },
                        { name: 'Następna aktualizacja', value: `<t:${nextUpdateTimestamp}:R>` }
                    )
                    .setFooter({ text: 'Csowicze', iconURL: 'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559' }) // Set the footer text and icon of the embed
                    .setColor(15418179); // Set the color of the embed to #D96E57

                if (serverInfoMessage) {
                    serverInfoMessage.edit({ embeds: [embed] });
                } else {
                    const row = db.prepare("SELECT messageId FROM serverInfoMessage WHERE channelId = ?").get(channelId);
                    if (row) {
                        const messageId = row.messageId;
                        serverInfoMessage = await channel.messages.fetch(messageId);
                        if (serverInfoMessage) {
                            serverInfoMessage.edit({ embeds: [embed] });
                        } else {
                            serverInfoMessage = await channel.send({ embeds: [embed] });
                            db.prepare("UPDATE serverInfoMessage SET messageId = ? WHERE channelId = ?").run(serverInfoMessage.id, channelId);
                        }
                    } else {
                        serverInfoMessage = await channel.send({ embeds: [embed] });
                        db.prepare("INSERT INTO serverInfoMessage (channelId, messageId) VALUES (?, ?)").run(channelId, serverInfoMessage.id);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        updateServerInfo();
        setInterval(updateServerInfo, 50000);
    }
};
