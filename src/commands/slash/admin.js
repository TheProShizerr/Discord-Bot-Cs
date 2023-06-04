const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db = new Database('./main.db');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Wyświetla listę adminów serwera DD2'),
    async execute(interaction) {
        try {
            const rows = db.prepare("SELECT name FROM highlightedPlayers WHERE type = 'Admin'").all();
            const half = Math.ceil(rows.length / 2);
            const leftColumn = rows.slice(0, half);
            const rightColumn = rows.slice(half);

            // Get the maximum timestamp from the highlightedPlayers table
            const maxTimestampRow = db.prepare("SELECT MAX(timestamp) as maxTimestamp FROM highlightedPlayers WHERE type = 'Admin'").get();
            const maxTimestamp = maxTimestampRow.maxTimestamp;

            // Get the owner rows from the highlightedPlayers table
            const ownerRows = db.prepare("SELECT name FROM highlightedPlayers WHERE type = 'Owner'").all();

            const embed = new EmbedBuilder()
                .setTitle('Lista administracji serwera DD2')
                .setThumbnail('https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559');

            // Add fields to the embed only if their value is not an empty string
            const fields = [];
            if (ownerRows.length > 0) {
                fields.push({ name: 'Właściciele', value: ownerRows.map(row => row.name).join(", ") });
            }
            if (leftColumn.length > 0) {
                fields.push({ name: '\u200B', value: leftColumn.map((row, index) => `${index + 1}. ${row.name}`).join("\n"), inline: true });
            }
            if (rightColumn.length > 0) {
                fields.push({ name: '\u200B', value: rightColumn.map((row, index) => `${index + half + 1}. ${row.name}`).join("\n"), inline: true });
            }
            if (maxTimestamp) {
                fields.push({ name: 'Ostatnia modyfikacja adminów', value: `<t:${Math.floor(maxTimestamp / 1000)}:R>` });
            } else {
                fields.push({ name: 'Ostatnia modyfikacja adminów', value: 'Admini nie zostali jeszcze modyfikowani' });
            }
            embed.addFields(fields);

            embed.setFooter({ text: 'Csowicze', iconURL: 'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559' }) // Set the footer text and icon of the embed
                .setColor(15418179); // Set the color of the embed to #D96E57

            if (rows.length === 0 && ownerRows.length === 0) {
                embed.setDescription('Nie ma żadnych adminów ani właściciela w bazie danych');
            }

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while trying to retrieve highlighted players from the database.", ephemeral: true });
        }
    }
};
