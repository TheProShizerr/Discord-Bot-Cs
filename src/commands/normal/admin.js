const Database = require('better-sqlite3');
const db = new Database('./main.db');

module.exports = {
    name: "admin",
    aliases: [],
    cooldown: 3000,
    run: async (client, message, args) => {
        try {
            const rows = db.prepare("SELECT name, code FROM highlightedPlayers WHERE type = 'Admin'").all();
            const response = `**Lista adminów**
${rows.map((row, index) => `${index + 1}. ${row.name} (${row.code})`).join("\n")}`;

            message.channel.send(response);
        } catch (error) {
            console.error(error);
            return message.reply("An error occurred while trying to retrieve highlighted players from the database.");
        }
    }
};
