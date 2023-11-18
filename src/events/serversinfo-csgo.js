const Gamedig = require('gamedig')
const { EmbedBuilder } = require('@discordjs/builders')
const config = require('../config')
const { ServerInfoMessageModel } = require('../baza')

module.exports = {
	name: 'ready',
	once: true,
	execute: async client => {
		const channelId = '1175384608611782676'
		const channel = client.channels.cache.get(channelId)
		if (!channel) {
			console.error(`Nie znaleziono kanału o ID ${channelId}.`)
			return
		}

		let embedMessage
		const updateEmbed = async () => {
			const embed = new EmbedBuilder()
				.setTitle('Nasze serwery CS 1.6')
				.setColor(config.color)
				.setThumbnail(config.thumbnail)
				.setDescription('Aby połączyć się z wybranym serwerem wystarczy wpisać jego adres IP i port w konsoli gry')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setFooter(config.footer)

			let totalPlayers = 0
			let totalMaxPlayers = 0

			for (const server of config.ServersListCsGo) {
				try {
					const state = await Gamedig.query({
						type: 'csgo',
						host: server.ip,
						port: server.port,
					})

					totalPlayers += state.players.length
					totalMaxPlayers += state.maxplayers

					embed.addFields(
						{ name: server.name, value: `IP:${server.ip}:${server.port}`, inline: true },
						{ name: 'Gracze:', value: `${state.players.length}/${state.maxplayers}`, inline: true },
						{ name: 'Mapa:', value: state.map, inline: true }
					)
				} catch (error) {
					console.error(error)
					embed.addFields({
						name: server.name,
						value: `IP:${server.ip}:${server.port}|Błąd:Nie można pobrać informacji o serwerze`,
						inline: false,
					})
				}
			}

			const serverFillPercentage = Math.round((totalPlayers / totalMaxPlayers) * 100)
			const nextUpdateTimestamp = Math.floor(Date.now() / 1000) + 120

			embed.addFields(
				{ name: '\u200B', value: '\u200B' },
				{
					name: 'Łącznie graczy na serwerach:',
					value: `${totalPlayers}/${totalMaxPlayers} (${serverFillPercentage}%)`,
					inline: true,
				},
				{ name: 'Następna aktualizacja:', value: `<t:${nextUpdateTimestamp}:R>`, inline: true }
			)

			if (embedMessage) {
				embedMessage.edit({ embeds: [embed] })
			} else {
				const row = await ServerInfoMessageModel.findOne({ channelIdCsGo: channelId })
				if (row) {
					const messageId = row.messageIdCsGo
					embedMessage = await channel.messages.fetch(messageId)
					if (embedMessage) {
						embedMessage.edit({ embeds: [embed] })
					} else {
						embedMessage = await channel.send({ embeds: [embed] })
						row.messageIdCsGo = embedMessage.id
						await row.save()
					}
				} else {
					embedMessage = await channel.send({ embeds: [embed] })
					const newServerInfoMessageModel = new ServerInfoMessageModel({
						channelIdCsGo: channelId,
						messageIdCsGo: embedMessage.id,
					})
					await newServerInfoMessageModel.save()
				}
			}
		}

		updateEmbed()
		setInterval(updateEmbed, 120000) // aktualizuj co 2 minuty
	},
}
