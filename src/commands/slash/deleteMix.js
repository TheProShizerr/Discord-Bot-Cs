const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const { MixModel } = require('../../baza') // Importuj model MixModel

module.exports = {
	data: new SlashCommandBuilder()
		.setName('usun-mix')
		.setDescription('Usuwa użytkownika z bazy danych')
		.addStringOption(option => option.setName('nick').setDescription('Nick użytkownika').setRequired(true)),
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
		await MixModel.deleteOne({ nick }) // Użyj modelu MixModel do usunięcia użytkownika
		await interaction.reply(`Użytkownik ${nick} został usunięty z bazy danych.`)
	},
}
