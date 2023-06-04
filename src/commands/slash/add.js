const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db = new Database('./main.db');

// Ensure that the highlightedPlayers table exists
db.prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT, type TEXT)").run();

// Add the 'code' column to the highlightedPlayers table if it doesn't exist
const hasCodeColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'code');
if (!hasCodeColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN code TEXT").run();
}

// Add the 'timestamp' column to the highlightedPlayers table if it doesn't exist
const hasTimestampColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'timestamp');
if (!hasTimestampColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN timestamp INTEGER").run();
}

// Generate a unique 6-character code consisting of 3 letters and 3 digits
const generateCode = () => {
    let code;
    do {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter1 = letters[Math.floor(Math.random() * letters.length)];
        const letter2 = letters[Math.floor(Math.random() * letters.length)];
        const letter3 = letters[Math.floor(Math.random() * letters.length)];
        const digit1 = Math.floor(Math.random() * 10);
        const digit2 = Math.floor(Math.random() * 10);
        const digit3 = Math.floor(Math.random() * 10);
        code = `${letter1}${letter2}${letter3}${digit1}${digit2}${digit3}`;
    } while (db.prepare("SELECT code FROM highlightedPlayers WHERE code = ?").get(code));
    return code;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dodaj')
        .setDescription('Dodaj admina lub ownera do tabelki')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Wpisz tutaj dokladny nick admina lub ownera z serwera')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Wybierz typ użytkownika')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin', value: 'Admin' },
                    { name: 'Owner', value: 'Owner' })),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "Nie posiadasz permisji aby dodać admina lub ownera do tabelki", ephemeral: true });
        }

        const playerName = interaction.options.getString('nickname');
        if (!playerName) {
            return interaction.reply({ content: "Wpisz nick admina lub ownera, działa to tylko na nick jeśli admin lub owner zmieni nick to już nie bedzie w tabelce", ephemeral: true });
        }

        const playerType = interaction.options.getString('type');

        try {
            const row = db.prepare("SELECT name FROM highlightedPlayers WHERE name = ? AND type = ?").get(playerName, playerType);
            if (row) {
                return interaction.reply({ content: `${playerType} o nazwie **${playerName}** już istnieje w bazie danych`, ephemeral: true });
            }

            const code = generateCode();
            const timestamp = Date.now();
            db.prepare("INSERT INTO highlightedPlayers(name, type, code, timestamp) VALUES(?, ?, ?, ?)").run(playerName, playerType, code, timestamp);
            interaction.reply(`Pomyślnie dodałem **${playerName}** jako **${playerType}** do bazy danych z unikatowym kodem **${code}**`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Baza danych odrzucila twojego requesta, sprobuj pozniej bo sie moze przegrzalo", ephemeral: true });
        }
    }
};
