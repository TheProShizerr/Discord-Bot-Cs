const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')
const config = require('../../config')
const MixModel = require('../../baza').MixModel

module.exports = {
	data: new SlashCommandBuilder().setName('mix').setDescription('Wyświetla listę użytkowników dodanych do bazy danych'),
	async execute(interaction) {
		const users = await MixModel.find().sort({ nick: 1 }).exec()
		const embed = new EmbedBuilder()
			.setTitle('Lista użytkowników zapisanych do MIXa')
			.setColor(config.color)
			.setThumbnail(config.thumbnail)
			.setFooter(config.footer)

		if (users.length > 0) {
			embed.setDescription(users.map((user, index) => `${index + 1}. ${user.nick}`).join('\n'))
		} else {
			embed.setDescription('Brak użytkowników w bazie danych.')
		}
		interaction.reply({ embeds: [embed] })
	},
}
