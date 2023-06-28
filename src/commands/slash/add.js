const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db = {};

// Create or connect to the respective databases for each server
//jeśli edytujesz nazwe baz danych to zmien je tez tutaj aby komenda add dzialala.
//Nazwa choices               nazwa bazy danych
db['Serwer-1'] = new Database('./dd2#1.db');
db['Serwer-2'] = new Database('./dd2classic.db');
db['Serwer-3'] = new Database('./csgomod.db');
db['Serwer-4'] = new Database('./gungame.db');
db['Serwer-5'] = new Database('./zm.db');
db['Serwer-6'] = new Database('./jailbreak.db');

// Ensure that the highlightedPlayers table exists in each database
Object.keys(db).forEach(server => {
    db[server].prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT, type TEXT, code TEXT, timestamp INTEGER)").run();
});

// Add the 'code' column to the highlightedPlayers table if it doesn't exist in each database
Object.keys(db).forEach(server => {
    const hasCodeColumn = db[server].prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'code');
    if (!hasCodeColumn) {
        db[server].prepare("ALTER TABLE highlightedPlayers ADD COLUMN code TEXT").run();
    }
});

// Add the 'timestamp' column to the highlightedPlayers table if it doesn't exist in each database
Object.keys(db).forEach(server => {
    const hasTimestampColumn = db[server].prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'timestamp');
    if (!hasTimestampColumn) {
        db[server].prepare("ALTER TABLE highlightedPlayers ADD COLUMN timestamp INTEGER").run();
    }
});

// Generate a unique 6-character code consisting of 3 letters and 3 digits
const generateCode = (database) => {
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
    } while (database.prepare("SELECT code FROM highlightedPlayers WHERE code = ?").get(code));
    return code;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dodaj')
        .setDescription('Dodaj admina lub ownera do tabelki')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Wpisz tutaj dokładny nick admina lub ownera z serwera')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Wybierz typ użytkownika')
            .setRequired(true)
            .addChoices(
                { name: 'Admin', value: 'Admin' },
                { name: 'Owner', value: 'Owner' }))
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Wybierz serwer')
                .setRequired(true)
                .addChoices(
                    //jeśli edytujesz nazwe baz danych to zmien je tez tutaj aby komenda add dzialala.
                    //Nazwa choices                nazwa bazy danych
                    { name: 'dd2-1', value: 'dd2-1' },
                    { name: 'dd2-classic', value: 'dd2-classic' },
                    { name: 'csgo-mod', value: 'csgo-mod' },
                    { name: 'gungame', value: 'gungame' },
                    { name: 'zm-exp', value: 'zm-exp' },
                    { name: 'jailbreak', value: 'jailbreak' })
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "Nie posiadasz permisji aby dodać admina lub ownera do tabelki", ephemeral: true });
        }

        const playerName = interaction.options.getString('nickname');
        if (!playerName) {
            return interaction.reply({ content: "Wpisz nick admina lub ownera, działa to tylko na nick jeśli admin lub owner zmieni nick to już nie będzie w tabelce", ephemeral: true });
        }

        const playerType = interaction.options.getString('type');
        const server = interaction.options.getString('server');

        try {
            const row = db[server].prepare("SELECT name FROM highlightedPlayers WHERE name = ? AND type = ?").get(playerName, playerType);
            if (row) {
                return interaction.reply({ content: `${playerType} o nazwie **${playerName}** już istnieje w bazie danych serwera ${server}`, ephemeral: true });
            }

            const code = generateCode(db[server]);
            const timestamp = Date.now();
            db[server].prepare("INSERT INTO highlightedPlayers(name, type, code, timestamp) VALUES(?, ?, ?, ?)").run(playerName, playerType, code, timestamp);
            interaction.reply(`Pomyślnie dodałem **${playerName}** jako **${playerType}** do bazy danych serwera ${server} z unikatowym kodem **${code}**`);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Baza danych odrzuciła twój request. Spróbuj ponownie później.", ephemeral: true });
        }
    }
};
