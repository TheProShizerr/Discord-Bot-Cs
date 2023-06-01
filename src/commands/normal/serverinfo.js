const Gamedig = require('gamedig');
const Database = require('better-sqlite3');
const db = new Database('./main.db');
const { EmbedBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');


db.prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT)").run();


const hasTypeColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'type');
if (!hasTypeColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN type TEXT").run();
}

module.exports = {
    name: "serverinfo",
    aliases: ["csinfo"],
    cooldown: 50000, // 50 seconds
    run: async (client, message, args) => {
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
                return message.reply("An error occurred while trying to retrieve server information.");
            }

            try {
                const rows = db.prepare("SELECT name, type FROM highlightedPlayers").all();
                const highlightedPlayerNames = rows.filter(row => row.type === 'Admin').map(row => row.name);
                const playerNames = serverInfo.players.map((player, index) => {
                    const name = highlightedPlayerNames.includes(player.name) ? `**Admin ${player.name}**` : player.name;
                    return `${index + 1}. ${name}`;
                });

                
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
                    .setColor(15418179); 

                if (serverInfoMessage) {
                    serverInfoMessage.edit({ embeds: [embed] });
                } else {
                    serverInfoMessage = await message.channel.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error(error);
                return message.reply("An error occurred while trying to retrieve highlighted players from the database.");
            }
        }

        updateServerInfo();
        setInterval(updateServerInfo, 50000);
    }
}
