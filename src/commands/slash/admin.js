const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('@discordjs/builders')
const config = require('../../config')
const mongoose = require('mongoose')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Wyświetla listę adminów serwera')
		.addStringOption(option =>
			option
				.setName('server')
				.setDescription('Wybierz serwer')
				.setRequired(true)
				.addChoices(...Object.keys(config.servers).map(server => ({ name: server, value: server })))
		),
	async execute(interaction) {
		const server = interaction.options.getString('server')
		if (!server) {
			return interaction.reply({ content: 'Wybierz serwer, którego adminów chcesz zobaczyć.', ephemeral: true })
		}

		const Model = mongoose.model(config.servers[server])
		if (!Model) {
			return interaction.reply({ content: 'Nie znaleziono bazy danych dla wybranego serwera.', ephemeral: true })
		}

		try {
			const admins = await Model.find({ highlightedPlayerType: 'Admin' })
			const owners = await Model.find({ highlightedPlayerType: 'Owner' })

			const embed = new EmbedBuilder().setTitle(`Lista administracji serwera ${server}`).setThumbnail(config.thumbnail)

			const fields = []
			if (owners.length > 0) {
				fields.push({ name: 'Właściciele', value: owners.map(row => row.highlightedPlayerName).join(', ') })
			}
			if (admins.length > 0) {
				fields.push({
					name: 'Admini',
					value: admins
						.map((row, index) => `${index + 1}. ${row.highlightedPlayerName} (${row.highlightedPlayerCode})`)
						.join('\n'),
				})
			}
			embed.addFields(fields)

			embed.setFooter(config.footer).setColor(config.color)

			if (admins.length === 0 && owners.length === 0) {
				embed.setDescription('Nie ma żadnych adminów ani właściciela w bazie danych')
			}

			interaction.reply({ embeds: [embed] })
		} catch (error) {
			console.error(error)
			return interaction.reply({
				content: 'Wystąpił błąd podczas próby pobrania danych z bazy danych.',
				ephemeral: true,
			})
		}
	},
}
