const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Wykonuje kod JavaScript.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Kod do wykonania')
                .setRequired(true)),
    async execute(interaction) {
        // Sprawdź, czy użytkownik ma uprawnienia administratora na serwerze
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Nie masz uprawnień do użycia tej komendy!', ephemeral: true });
        }

        // Pobierz kod do wykonania z argumentów komendy
        const code = interaction.options.getString('code');
        let result;

        try {
            // Wykonaj kod JavaScript
            result = eval(code);
        } catch (error) {
            // Jeśli wystąpi błąd podczas wykonywania kodu, zwróć treść błędu
            result = error.message;
        }

        // Jeśli wynik nie jest ciągiem znaków, przekształć go na ciąg znaków
        if (typeof result !== 'string') {
            result = require('util').inspect(result);
        }

        // Wyślij wynik na kanał Discord
        interaction.reply({ content: result, split: true, code: 'js' });
    },
};
