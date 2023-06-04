const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pogoda')
        .setDescription('Wyświetla informacje o pogodzie dla danej miejscowości')
        .addStringOption(option =>
            option.setName('lokalizacja')
                .setDescription('Wpisz nazwę miejscowości')
                .setRequired(true)),
    async execute(interaction) {
        // Ustaw swoje dane uwierzytelniające dla API pogodowego
        const weatherApiKey = '673374da9cd916dc79c2cfa51cdddec2';

        // Utwórz instancję axios z nagłówkiem autoryzacji
        const weatherApi = axios.create({
            baseURL: 'https://api.openweathermap.org/data/2.5/',
            params: { appid: weatherApiKey }
        });

        // Pobierz nazwę miejscowości z argumentów komendy
        const location = interaction.options.getString('lokalizacja');

        if (!location) {
            return interaction.reply({ content: 'Proszę podać nazwę miejscowości.', ephemeral: true });
        }

        try {
            // Pobierz informacje o pogodzie dla danej miejscowości
            const response = await weatherApi.get('weather', { params: { q: location } });
            const currentWeather = response.data.main;
            const locationInfo = response.data;

            // Oblicz temperaturę w stopniach Celsjusza
            const tempCelsius = currentWeather.temp - 273.15;
            const feelsLikeCelsius = currentWeather.feels_like - 273.15;

            // Oblicz czas lokalny
            const localTime = new Date(Date.now() + (locationInfo.timezone + new Date().getTimezoneOffset() * 60) * 1000).toLocaleTimeString();

            // Pobierz ikonę pogody
            const weatherIcon = locationInfo.weather[0].icon;
            const weatherIconUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`;

            // Mapowanie warunków pogodowych z angielskiego na polski
            const weatherConditions = {
                'Clear': 'Bezchmurnie',
                'Clouds': 'Pochmurno',
                'Rain': 'Deszcz',
                'Snow': 'Śnieg',
                // ...
            };
            const weatherConditionInPolish = weatherConditions[locationInfo.weather[0].main];

            // Oblicz nazwę strefy czasowej IANA
            const date = new Date();
            const timeZoneOffsetInHours = date.getTimezoneOffset() / 60;
            const timeZoneName = `Etc/GMT${timeZoneOffsetInHours >= 0 ? '+' : ''}${timeZoneOffsetInHours}`;

            // Utwórz osadzoną wiadomość (embed) z informacjami o pogodzie
            const embed = new EmbedBuilder()
                .setTitle(`Pogoda dla ${locationInfo.name}`)
                .setThumbnail(weatherIconUrl)
                .addFields(
                    { name: 'Strefa czasowa', value: `> ${timeZoneName}`, inline: true },
                    { name: 'Temperatura', value: `> ${tempCelsius.toFixed(1)}°C`, inline: true },
                    { name: 'Odczuwalna', value: `> ${feelsLikeCelsius.toFixed(1)}°C`, inline: true },
                    { name: 'Warunki', value: `> ${weatherConditionInPolish}`, inline: true },
                    { name: 'Wiatr', value: `> ${locationInfo.wind.speed} m/s`, inline: true },
                    { name: 'Widoczność', value: `> ${locationInfo.visibility} m`, inline: true },
                    { name: 'Czas lokalny', value: `> ${localTime}`, inline: true }
                )
                .setFooter({ text: 'Csowicze', iconURL: 'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559' }) // Set the footer text and icon of the embed
                .setColor(15418179); // Set the color of the embed to #D96E57

            // Wyślij osadzoną wiadomość na kanał Discord
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Wystąpił błąd podczas pobierania informacji o pogodzie. Spróbuj ponownie później.', ephemeral: true });
        }
    }
};
