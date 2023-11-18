const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Wykonuje kod JavaScript.')
		.addStringOption(option => option.setName('code').setDescription('Kod do wykonania').setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			return interaction.reply({ content: 'Nie masz uprawnień do użycia tej komendy!', ephemeral: true })
		}

		const code = interaction.options.getString('code')
		let result

		try {
			result = eval(code)
		} catch (error) {
			result = error.message
		}

		if (typeof result !== 'string') {
			result = require('util').inspect(result)
		}

		interaction.reply({ content: result, split: true, code: 'js' })
	},
}
