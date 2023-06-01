const Database = require('better-sqlite3');
const db = new Database('./main.db');

module.exports = {
    name: "usun",
    aliases: [],
    cooldown: 3000,
    run: async (client, message, args) => {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply("Nie posiadasz permisji aby dodać admina do tabelki");
        }

        const code = args.join(" ");
        if (!code) {
            return message.reply("Wpisz kod usera którego chcesz usunąć. Adminow mozesz zobaczyc pod !admin");
        }

        try {
            const row = db.prepare("SELECT name FROM highlightedPlayers WHERE code = ? AND type = ?").get(code, 'Admin');
            if (!row) {
                return message.reply(`Nie znaleziono admina z kodem **${code}** w bazie danych`);
            }

            db.prepare("DELETE FROM highlightedPlayers WHERE code = ? AND type = ?").run(code, 'Admin');
            message.reply(`Pomyślnie usunąłem **${row.name}** z bazy danych`);
        } catch (error) {
            console.error(error);
            return message.reply("Baza danych odrzucila twojego requesta, sprobuj pozniej bo sie moze przegrzalo");
        }
    }
};
