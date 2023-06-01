const Database = require('better-sqlite3');
const db = new Database('./main.db');

// Ensure that the highlightedPlayers table exists
db.prepare("CREATE TABLE IF NOT EXISTS highlightedPlayers (name TEXT, type TEXT)").run();

// Add the 'code' column to the highlightedPlayers table if it doesn't exist
const hasCodeColumn = db.prepare("PRAGMA table_info(highlightedPlayers)").all().some(column => column.name === 'code');
if (!hasCodeColumn) {
    db.prepare("ALTER TABLE highlightedPlayers ADD COLUMN code TEXT").run();
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
    name: "dodaj",
    aliases: [],
    cooldown: 3000,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply("Nie posiadasz permisji aby dodać admina do tabelki");
        }

        const playerName = args.join(" ");
        if (!playerName) {
            return message.reply("Wpisz nick admina, działa to tylko na nick jeśli admin zmieni nick to już nie bedzie w tabelce");
        }

        try {
            const row = db.prepare("SELECT name FROM highlightedPlayers WHERE name = ? AND type = ?").get(playerName, 'Admin');
            if (row) {
                return message.reply(`Admin o nazwie **${playerName}** już istnieje w bazie danych`);
            }

            const code = generateCode();
            db.prepare("INSERT INTO highlightedPlayers(name, type, code) VALUES(?, ?, ?)").run(playerName, 'Admin', code);
            message.reply(`Pomyślnie dodałem **${playerName}** do bazy danych z unikatowym kodem **${code}**`);
        } catch (error) {
            console.error(error);
            return message.reply("Baza danych odrzucila twojego requesta, sprobuj pozniej bo sie moze przegrzalo");
        }
    }
};
