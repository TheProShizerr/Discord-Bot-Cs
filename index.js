const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
	],
	shards: 'auto',
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.User,
		Partials.ThreadMember,
	],
})

client.setMaxListeners(20)

const config = require('./src/config.js')
const { readdirSync, lstatSync } = require('fs')
const path = require('path')
const moment = require('moment')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const db = require('./src/baza.js')

let token = config.token

client.commands = new Collection()
client.slashcommands = new Collection()
client.commandaliases = new Collection()

const rest = new REST({ version: '10' }).setToken(token)

const log = x => {
	console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${x}`)
}

//command-handler
const commands = []
readdirSync('./src/commands/normal').forEach(async file => {
	const command = await require(`./src/commands/normal/${file}`)
	if (command) {
		client.commands.set(command.name, command)
		commands.push(command.name, command)
		if (command.aliases && Array.isArray(command.aliases)) {
			command.aliases.forEach(alias => {
				client.commandaliases.set(alias, command.name)
			})
		}
	}
})

console.log('Bot stworzony przez TheProShizer#0001')
console.log('Masz propozycje co do bota? napisz od mnie na discordzie!')
console.log('Nie pomagam jesli ktos edytuje kod na wlasna reke')

//slash-command-handler
const slashcommands = []
readdirSync('./src/commands/slash').forEach(async file => {
	const command = await require(`./src/commands/slash/${file}`)
	slashcommands.push(command.data.toJSON())
	client.slashcommands.set(command.data.name, command)
})

client.on('ready', async () => {
	try {
		await rest.put(Routes.applicationCommands(client.user.id), { body: slashcommands })
	} catch (error) {
		console.error(error)
	}
	log(`${client.user.username} Jest online i chyba działa :)`)
})

//event-handler
const loadEvents = (dir = './src/events') => {
	readdirSync(dir).forEach(file => {
		const filePath = path.join(__dirname, dir, file)
		const stat = lstatSync(filePath)
		if (stat.isDirectory()) {
			// If file is a directory, recursive call to scan nested folders
			loadEvents(path.join(dir, file))
		} else if (file.endsWith('.js')) {
			const event = require(filePath)
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args))
			} else {
				client.on(event.name, (...args) => event.execute(...args))
			}
		}
	})
}

loadEvents()

//nodejs-listeners
process.on('unhandledRejection', e => {
	console.log(e)
})
process.on('uncaughtException', e => {
	console.log(e)
})
process.on('uncaughtExceptionMonitor', e => {
	console.log(e)
})
//

client.login(token)
