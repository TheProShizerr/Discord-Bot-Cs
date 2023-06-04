const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db = new Database('./main.db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usun')
        .setDescription('Usuwa admina lub ownera z tabelki')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Kod admina lub ownera')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "Nie posiadasz permisji aby usunąć admina lub ownera z tabelki", ephemeral: true });
        }

        const code = interaction.options.getString('code');
        if (!code) {
            return interaction.reply({ content: "Wpisz kod usera którego chcesz usunąć. Adminow mozesz zobaczyc pod !admin", ephemeral: true });
        }

        try {
            const row = db.prepare("SELECT name, type FROM highlightedPlayers WHERE code = ?").get(code);
            if (!row) {
                return interaction.reply({ content: `Nie znaleziono admina lub ownera z kodem **${code}** w bazie danych`, ephemeral: true });
            }

            db.prepare("DELETE FROM highlightedPlayers WHERE code = ?").run(code);

            // Update the timestamp of the remaining admins
            const timestamp = Date.now();
            db.prepare("UPDATE highlightedPlayers SET timestamp = ? WHERE type = 'Admin'").run(timestamp);

            interaction.reply(`Pomyślnie usunąłem **${row.name}** jako **${row.type}** z bazy danych`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Baza danych odrzucila twojego requesta, sprobuj pozniej bo sie moze przegrzalo", ephemeral: true });
        }
    }
};
