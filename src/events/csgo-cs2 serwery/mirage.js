const Gamedig = require('gamedig')
const { EmbedBuilder } = require('@discordjs/builders')
const config = require('../../config')

const { mirageModel } = require('../../baza')

const channelId = '1175469239486910554'
const maxEmbedDescriptionLength = 2000

let serverInfoMessage = null
let lastMap = null

const updateServerInfo = async client => {
	const channel = client.channels.cache.get(channelId)
	if (!channel) {
		console.error(`Nie znaleziono kanału o ID ${channelId}.`)
		return
	}

	try {
		const serverInfo = await Gamedig.query({
			type: 'csgo',
			host: '51.83.169.117',
			port: '27015',
		})

		const newPlayerCount = new mirageModel({
			playerCountTimestamp: Date.now(),
			playerCount: serverInfo.players.length,
		})
		await newPlayerCount.save()

		let lastMapDoc = await mirageModel.findOne({ lastMapName: { $exists: true } })
		if (!lastMapDoc) {
			lastMapDoc = new mirageModel({ lastMapName: serverInfo.map })
			await lastMapDoc.save()
		}

		if (lastMapDoc.lastMapName !== serverInfo.map) {
			lastMapDoc.lastMapName = serverInfo.map
			await lastMapDoc.save()

			let mapDoc = await mirageModel.findOne({ mapName: serverInfo.map })
			if (mapDoc) {
				mapDoc.mapCount++
				await mapDoc.save()
			} else {
				mapDoc = new mirageModel({ mapName: serverInfo.map, mapCount: 1 })
				await mapDoc.save()
			}
		}

		const ignoredPlayers = ['']

		const rows = await mirageModel.find({ highlightedPlayerName: { $exists: true } })
		const highlightedPlayerNames = rows
			.filter(row => row.highlightedPlayerType === 'Admin')
			.map(row => row.highlightedPlayerName.toLowerCase())
		const ownerPlayerNames = rows
			.filter(row => row.highlightedPlayerType === 'Owner')
			.map(row => row.highlightedPlayerName.toLowerCase())

		let totalPlayerTime = 0
		let isTimeRemoved = false

		const playerNames = serverInfo.players
			.sort((a, b) => {
				if (ignoredPlayers.includes(a.name)) return 1
				if (ignoredPlayers.includes(b.name)) return -1
				if (a.raw && b.raw) {
					return b.raw.score - a.raw.score
				}
				return 0
			})
			.map((player, index) => {
				let name = player.name
				if (ignoredPlayers.includes(player.name)) {
					name = `[1m${player.name}[0m` // Dodano kolor czerwony dla ignorowanych graczy
				} else if (highlightedPlayerNames.includes(player.name.toLowerCase())) {
					name = `[0;35mAdmin ${player.name}[0m`
				} else if (ownerPlayerNames.includes(player.name.toLowerCase())) {
					name = `[0;32mOwner ${player.name}[0m`
				}
				if (!ignoredPlayers.includes(player.name)) {
					if (player.raw && player.raw.time) {
						let playerTime = ''
						if (player.raw.time > 0) {
							playerTime = ` - ${Math.round(player.raw.time / 60)}min`
						}
						if (player.raw.score && player.raw.score > 0) {
							playerTime = playerTime ? ` (${player.raw.score})${playerTime}` : ` (${player.raw.score})`
						}
						let tempEmbedDescription = '```ansi\n' + name + playerTime
						if (tempEmbedDescription.length > maxEmbedDescriptionLength) {
							isTimeRemoved = true
							playerTime = ''
						}
						name += playerTime
						totalPlayerTime += player.raw.time
					}
				}
				return `${index + 1}. ${name}`
			})

		if (isTimeRemoved) {
			playerNames = playerNames.map(playerName => playerName.replace(/ - \d+min/, ''))
		}

		const totalServerTime = Math.round(totalPlayerTime / 60)

		const halfLength = Math.ceil(playerNames.length / 2)
		const playerNamesLeftColumn = playerNames.slice(0, halfLength).join('\n') || 'Na serwerze aktualnie nikt nie gra'
		const playerNamesRightColumn = playerNames.slice(halfLength).join('\n')

		let embedDescription = '```ansi\n' + playerNamesLeftColumn + '\n' + playerNamesRightColumn
		if (embedDescription.length > maxEmbedDescriptionLength) {
			const removedTimeMessage = 'Przekroczono limit, usunięto czas koło nicków.'
			embedDescription = embedDescription.replace(/ - \d+min/g, '')
			embedDescription += `\n${removedTimeMessage}`
		}

		embedDescription += '```'

		const nextUpdateTimestamp = Math.floor((Date.now() + 50000) / 1000)
		const serverFillPercentage = Math.round((serverInfo.players.length / serverInfo.maxplayers) * 100)
		const mapDoc = await mirageModel.findOne({ mapName: serverInfo.map })
		const mapCount = mapDoc ? mapDoc.mapCount : 1

		const embed = new EmbedBuilder()
			.setTitle(serverInfo.name)
			.setThumbnail(config.thumbnail)
			.addFields(
				{ name: 'Nazwa mapy', value: `${serverInfo.map} - ${mapCount} razy grano` },
				{
					name: 'Liczba graczy',
					value: `${serverInfo.players.length}/${serverInfo.maxplayers} (${serverFillPercentage}%) ~ ${totalServerTime}min`,
				},
				{ name: 'Nicki graczy', value: embedDescription, inline: true },
				{ name: 'Następna aktualizacja', value: `<t:${nextUpdateTimestamp}:R>` }
			)
			.setFooter(config.footer)
			.setColor(config.color)

		const row = await mirageModel.findOne({ channelId: { $exists: true } })
		if (row) {
			const messageId = row.messageId
			serverInfoMessage = await channel.messages.fetch(messageId)
		}

		if (serverInfoMessage) {
			try {
				serverInfoMessage.edit({ embeds: [embed] })
			} catch (error) {
				console.error('Nie można zaktualizować wiadomości, przekroczono limit znaków.')
			}
		} else {
			serverInfoMessage = await channel.send({ embeds: [embed] })
			const newServerInfoMessage = new mirageModel({
				channelId: channelId,
				messageId: serverInfoMessage.id,
			})
			await newServerInfoMessage.save()
		}
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	name: 'ready',
	once: true,
	execute: async client => {
		updateServerInfo(client)
		setInterval(() => updateServerInfo(client), 50000)
	},
}
