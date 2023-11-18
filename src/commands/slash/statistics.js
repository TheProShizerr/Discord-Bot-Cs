const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction } = require('discord.js')
const mongoose = require('mongoose')
const { EmbedBuilder } = require('@discordjs/builders')
const config = require('../../config')
const models = require('../../baza')

const servers = Object.entries(config.servers).map(([name, modelName]) => ({ name, model: models[modelName] }))

module.exports = {
	data: new SlashCommandBuilder()
		.setName('statystyki')
		.setDescription('Wyświetla ranking serwerów na podstawie średniej liczby graczy.'),
	async execute(interaction = new CommandInteraction()) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const averages = await Promise.all(
			servers.map(async server => {
				// Usuwanie starych danych
				await server.model.deleteMany({ playerCountTimestamp: { $lt: today } })

				const rows = await server.model
					.find({ playerCountTimestamp: { $gte: today, $lt: tomorrow } })
					.select('playerCount -_id')
					.lean()

				if (rows.length === 0) {
					return { name: server.name, average: 0 }
				}

				const average = rows.reduce((a, b) => a + b.playerCount, 0) / rows.length
				return { name: server.name, average }
			})
		)

		averages.sort((a, b) => b.average - a.average)

		const embed = new EmbedBuilder()
			.setTitle('Średnia ilość osób na serwerach')
			.setColor(config.color)
			.setDescription(
				`Dane są tylko za dzień ${today.toLocaleDateString()}. Serwery posortowane od największej do najmniejszej ilości osób.`
			)
			.setThumbnail(config.thumbnail)
			.setFooter(config.footer)

		for (const server of averages) {
			embed.addFields({ name: server.name, value: `${server.average.toFixed(2)} osób` })
		}

		await interaction.reply({ embeds: [embed] })
	},
}
