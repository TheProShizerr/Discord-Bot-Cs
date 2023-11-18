const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const { MixModel } = require('../../baza') // Importuj model MixModel

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dodaj-mix')
		.setDescription('Dodaje użytkowników do bazy danych')
		.addStringOption(option =>
			option.setName('nick').setDescription('Nicki użytkowników oddzielone przecinkami').setRequired(true)
		),
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

		const nick = interaction.options.getString('nick')
		const nicks = nick.split(',').map(nick => nick.trim())
		for (const nick of nicks) {
			const user = new MixModel({ nick })
			await user.save()
		}
		await interaction.reply(`Użytkownicy ${nicks.join(', ')} zostali dodani do bazy danych.`)
	},
}
