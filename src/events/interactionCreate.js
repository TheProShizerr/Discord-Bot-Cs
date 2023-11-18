const { InteractionType } = require('discord.js')

module.exports = {
	name: 'interactionCreate',
	execute: async interaction => {
		let client = interaction.client
		if (interaction.type == InteractionType.ApplicationCommand) {
			if (interaction.user.bot) return
			try {
				const command = client.slashcommands.get(interaction.commandName)
				command.execute(interaction)
			} catch (e) {
				console.error(e)
				interaction.reply({
					content: 'Wystąpił problem podczas uruchamiania polecenia! Proszę spróbuj ponownie.',
					ephemeral: true,
				})
			}
		}
	},
}
