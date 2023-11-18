const { SlashCommandBuilder } = require('@discordjs/builders')
const { PermissionsBitField } = require('discord.js')
const config = require('../../config')

const generateCode = async (database, server) => {
	let code
	do {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		const letter1 = letters[Math.floor(Math.random() * letters.length)]
		const letter2 = letters[Math.floor(Math.random() * letters.length)]
		const letter3 = letters[Math.floor(Math.random() * letters.length)]
		const digit1 = Math.floor(Math.random() * 10)
		const digit2 = Math.floor(Math.random() * 10)
		const digit3 = Math.floor(Math.random() * 10)
		code = `${letter1}${letter2}${letter3}${digit1}${digit2}${digit3}`
	} while (await database.findOne({ highlightedPlayerCode: code, server: server }))
	return code
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dodaj')
		.setDescription('Dodaj admina lub ownera do tabelki')
		.addStringOption(option =>
			option
				.setName('nickname')
				.setDescription('Wpisz tutaj dokładny nick admina lub ownera z serwera')
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('Wybierz typ użytkownika')
				.setRequired(true)
				.addChoices({ name: 'Admin', value: 'Admin' }, { name: 'Owner', value: 'Owner' })
		)
		.addStringOption(option =>
			option
				.setName('server')
				.setDescription('Wybierz serwer')
				.setRequired(true)
				.addChoices(...Object.keys(config.servers).map(server => ({ name: server, value: server })))
		),
	async execute(interaction) {
		const chosenServer = interaction.options.getString('server')
		let hasPermission = false

		if (interaction.member) {
			if (interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
				hasPermission = true
			}
		}

		const modelName = config.servers[chosenServer]
		const model = require('../../baza')[modelName]
		const row = await model.findOne({ server: chosenServer, userId: interaction.user.id })
		if (row) {
			hasPermission = true
		}

		if (!hasPermission) {
			return interaction.reply({
				content: 'Niestety ale nie masz dostępu do tej komendy..',
				ephemeral: true,
			})
		}

		if (!hasPermission) {
			return interaction.reply({
				content: 'Nie masz dostępu do tej opcji',
				ephemeral: true,
			})
		}

		const playerName = interaction.options.getString('nickname')
		if (!playerName) {
			return interaction.reply({
				content: 'Wpisz nick admina lub ownera...',
				ephemeral: true,
			})
		}

		const playerType = interaction.options.getString('type')

		try {
			const row = await model.findOne({
				highlightedPlayerName: playerName,
				highlightedPlayerType: playerType,
				server: chosenServer,
			})
			if (row) {
				return interaction.reply({
					content: `${playerType} o nazwie **${playerName}** już istnieje w bazie danych serwera ${chosenServer}`,
					ephemeral: true,
				})
			}

			const code = await generateCode(model, chosenServer)
			const timestamp = Date.now()
			const newHighlightedPlayer = new model({
				highlightedPlayerName: playerName,
				highlightedPlayerType: playerType,
				highlightedPlayerCode: code,
				highlightedPlayerTimestamp: timestamp,
				server: chosenServer,
			})
			await newHighlightedPlayer.save()
			interaction.reply(
				`Pomyślnie dodałem **${playerName}** jako **${playerType}** do bazy danych serwera ${chosenServer} z unikatowym kodem **${code}**`
			)
		} catch (error) {
			console.error(error)
			return interaction.reply({
				content: 'Baza danych odrzuciła twój request. Spróbuj ponownie później.',
				ephemeral: true,
			})
		}
	},
}
