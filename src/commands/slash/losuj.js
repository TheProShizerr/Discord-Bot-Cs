const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const { EmbedBuilder } = require('discord.js') // Dodane importowanie EmbedBuilder
const { MixModel } = require('../../baza')
const config = require('../../config')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('losuj')
		.setDescription('Tworzy "historyjkę" w postaci osadzenia')
		.addStringOption(option =>
			option.setName('mapa').setDescription('Wybierz mapę').setRequired(true).addChoices(
				// Ustaw tutaj swoje mapy, takie jakie chcesz :D
				{ name: 'de_kabul32', value: 'de_kabul32' },
				{ name: 'de_inferno', value: 'de_inferno' },
				{ name: 'de_mirage', value: 'de_mirage' }
			)
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

		const mapa = interaction.options.getString('mapa')
		let ct = []
		let tt = []
		const embed = new EmbedBuilder()
			.setTitle('Konkurs mix FFA')
			.setDescription(`Witajcie na konkursie mix FFA dla mapy ${mapa}! :)\n\nSystem by TheProShizer`)
			.setColor(config.color)
			.setThumbnail(config.thumbnail)
			.setFooter(config.footer)
		await interaction.reply({ embeds: [embed] })
		const message = await interaction.fetchReply()
		setTimeout(async () => {
			embed.setDescription('Trwa losowanie kapitanów drużyn...')
			message.edit({ embeds: [embed] })
			setTimeout(async () => {
				const users = await MixModel.aggregate([{ $sample: { size: 2 } }]) // Użyj modelu MixModel do losowania kapitanów
				users.forEach((user, index) => {
					if (index % 2 === 0) {
						ct.push(`**${user.nick}** (Kapitan)`)
					} else {
						tt.push(`**${user.nick}** (Kapitan)`)
					}
				})
				if (ct.length > 0 || tt.length > 0) {
					let captainNames = `Nicki wylosowanych kapitanów to ${ct[0]} i ${tt[0]}`
					embed.setDescription(captainNames)
					message.edit({ embeds: [embed] })
				}
			}, 5000)
			setTimeout(async () => {
				let sideInfo = `Wylosowana strona dla drużyny ${ct[0]} to CT i dla drużyny ${tt[0]} to TT`
				embed.setDescription(sideInfo)
				message.edit({ embeds: [embed] })
			}, 10000)
			setTimeout(async () => {
				const users = await MixModel.find()
				users.forEach((user, index) => {
					if (index % 2 === 0 && !ct.includes(`**${user.nick}**`)) {
						ct.push(user.nick)
					} else if (!tt.includes(`**${user.nick}**`)) {
						tt.push(user.nick)
					}
				})
				if (ct.length > 1 || tt.length > 1) {
					let teamInfo = 'Trwa losowanie drużyn'
					embed.setDescription(teamInfo)
					message.edit({ embeds: [embed] })
				}
			}, 15000)
			setTimeout(async () => {
				if (ct.length > 1 || tt.length > 1) {
					let teamInfo = `Poniżej przedstawiam rozlosowane drużyny dla CT oraz TT dla mapy ${mapa}`
					embed.fields = []
					if (ct.length > 1) {
						let ctCount = ct.length
						let ctName = `(${ctCount} os) - Counter-terrorist (CT)`
						embed.addFields({ name: ctName, value: ct.join('\n'), inline: false })
					}
					if (tt.length > 1) {
						let ttCount = tt.length
						let ttName = `(${ttCount} os) - Terrorist (TT)`
						embed.addFields({ name: ttName, value: tt.join('\n'), inline: false })
					}
					embed.setDescription(teamInfo)
					message.edit({ embeds: [embed] })
				}
			}, 20000)
		}, 5000)
	},
}
