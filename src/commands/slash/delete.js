const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db = {};

// Create or connect to the respective databases for each server
db['dd2-1'] = new Database('./dd2#1.db');
db['dd2-classic'] = new Database('./dd2classic.db');
db['csgo-mod'] = new Database('./csgomod.db');
db['gungame'] = new Database('./gungame.db');
db['zm-exp'] = new Database('./zm.db');
db['jailbreak'] = new Database('./jailbreak.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usun')
        .setDescription('Usuwa admina lub ownera z tabelki')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Wybierz serwer')
                .setRequired(true)
                .addChoices(
                    //jeśli edytujesz nazwe baz danych to zmien je tez tutaj aby komenda delete dzialala.
                    //Nazwa choices      nazwa bazy danych
                    { name: 'dd2-1', value: 'dd2-1' },
                    { name: 'dd2-classic', value: 'dd2-classic' },
                    { name: 'csgo-mod', value: 'csgo-mod' },
                    { name: 'gungame', value: 'gungame' },
                    { name: 'zm-exp', value: 'zm-exp' },
                    { name: 'jailbreak', value: 'jailbreak' }
                )
        )
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Kod admina lub ownera')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "Nie posiadasz permisji aby usunąć admina lub ownera z tabelki", ephemeral: true });
        }

        const server = interaction.options.getString('server');
        if (!server) {
            return interaction.reply({ content: "Wybierz serwer, z którego chcesz usunąć admina lub ownera.", ephemeral: true });
        }

        const code = interaction.options.getString('code');
        if (!code) {
            return interaction.reply({ content: "Wpisz kod użytkownika, którego chcesz usunąć.", ephemeral: true });
        }

        if (!db[server]) {
            return interaction.reply({ content: "Nie znaleziono bazy danych dla wybranego serwera.", ephemeral: true });
        }

        try {
            const row = db[server].prepare("SELECT name, type FROM highlightedPlayers WHERE code = ?").get(code);
            if (!row) {
                return interaction.reply({ content: `Nie znaleziono admina lub ownera z kodem **${code}** w bazie danych serwera ${server}`, ephemeral: true });
            }

            db[server].prepare("DELETE FROM highlightedPlayers WHERE code = ?").run(code);

            // Update the timestamp of the remaining admins
            const timestamp = Date.now();
            db[server].prepare("UPDATE highlightedPlayers SET timestamp = ? WHERE type = 'Admin'").run(timestamp);

            interaction.reply(`Pomyślnie usunąłem **${row.name}** jako **${row.type}** z bazy danych serwera ${server}`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Baza danych odrzuciła twój request. Spróbuj ponownie później.", ephemeral: true });
        }
    }
};
