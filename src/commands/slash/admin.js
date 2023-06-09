const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const { EmbedBuilder } = require('@discordjs/builders');

const serverDatabases = {
    //jeśli edytujesz nazwe baz danych to zmien je tez tutaj aby komenda add dzialala.
     //Nazwa choices      nazwa bazy danych
    'dd2-1': new Database('./dd2#1.db'),
    'dd2-classic': new Database('./dd2classic.db'),
    'csgo-mod': new Database('./csgomod.db'),
    'gungame': new Database('./gungame.db'),
    'zm-exp': new Database('./zm.db'),
    'jailbreak': new Database('./jailbreak.db')
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Wyświetla listę adminów serwera')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Wybierz serwer')
                .setRequired(true)
                .addChoices(
                    //jeśli edytujesz nazwe baz danych to zmien je tez tutaj aby komenda admin dzialala.
                    //Nazwa choices   nazwa bazy danych
                    { name: 'DD2#1', value: 'dd2-1' },
                    { name: 'DD2 Classic', value: 'dd2-classic' },
                    { name: 'CS:GO Mod', value: 'csgo-mod' },
                    { name: 'Gun Game', value: 'gungame' },
                    { name: 'Zombie Mode', value: 'zm-exp' },
                    { name: 'Jailbreak', value: 'jailbreak' }
                )
        ),
    async execute(interaction) {
        const server = interaction.options.getString('server');
        if (!server) {
            return interaction.reply({ content: "Wybierz serwer, którego adminów chcesz zobaczyć.", ephemeral: true });
        }

        const db = serverDatabases[server];
        if (!db) {
            return interaction.reply({ content: "Nie znaleziono bazy danych dla wybranego serwera.", ephemeral: true });
        }

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
                .setTitle(`Lista administracji serwera ${server}`)
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
            return interaction.reply({ content: "Wystąpił błąd podczas próby pobrania danych z bazy danych.", ephemeral: true });
        }
    }
};
