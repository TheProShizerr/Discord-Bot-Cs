const { ActivityType } = require('discord.js')
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.setMaxListeners(20)
		client.user.setActivity({ name: `Csowicze`, type: ActivityType.Playing })
	},
}
