const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const config = require('../../config')
const mongoose = require('mongoose')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('usun')
		.setDescription('Usuwa admina lub ownera z tabelki')
		.addStringOption(option => option.setName('code').setDescription('Kod admina lub ownera').setRequired(true)),
	async execute(interaction) {
		let hasPermission = false

		if (interaction.member) {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
				hasPermission = true
			}
		}

		if (!hasPermission) {
			return interaction.reply({
				content: 'Niestety ale nie masz dostępu do tej komendy..',
				ephemeral: true,
			})
		}

		const code = interaction.options.getString('code')
		if (!code) {
			return interaction.reply({ content: 'Wpisz kod użytkownika, którego chcesz usunąć.', ephemeral: true })
		}

		let found = false
		let deletedUser = null

		for (const serverKey in config.servers) {
			if (config.servers[serverKey].endsWith('.db')) {
				continue // Pomija serwery, które nie korzystają z MongoDB
			}

			const Model = mongoose.model(config.servers[serverKey])
			const user = await Model.findOne({ highlightedPlayerCode: code })
			if (user) {
				await Model.deleteOne({ highlightedPlayerCode: code })
				found = true
				deletedUser = { name: user.highlightedPlayerName, type: user.highlightedPlayerType, server: serverKey }
				break
			}
		}

		if (found) {
			interaction.reply(
				`Pomyślnie usunąłem **${deletedUser.name}** jako **${deletedUser.type}** z bazy danych serwera ${deletedUser.server}`
			)
		} else {
			interaction.reply({
				content: `Nie znaleziono admina lub ownera z kodem **${code}** w żadnej bazie danych serwera.`,
				ephemeral: true,
			})
		}
	},
}
