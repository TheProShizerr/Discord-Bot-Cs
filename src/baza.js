const mongoose = require('mongoose')

mongoose
	.connect('TWÓJ LINK DO POŁĄCZENIA Z MONGODB')
	.then(() => {
		console.log('Połączono z MongoDB!')
	})
	.catch(err => {
		console.error('Błąd podczas łączenia z MongoDB:', err)
	})

const ZombieModInfoSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const PaintballInfoSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const JailBreakSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const FFaSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const dd2ClassicSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const codModSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

//KOLEKCJE DLA SERWERÓW CSGO/cs2

const mirageSchema = new mongoose.Schema({
	highlightedPlayerName: String,
	highlightedPlayerType: String,
	highlightedPlayerCode: String,
	highlightedPlayerTimestamp: Number,
	channelId: String,
	messageId: String,
	playerCountTimestamp: Number,
	playerCount: Number,
	mapName: String,
	mapCount: Number,
	lastMapName: String,
})

const MixModelSchema = new mongoose.Schema({
	nick: String,
})

const serverInfoMessageSchema = new mongoose.Schema({
	channelId: String,
	messageId: String,
	channelIdCsGo: String,
	messageIdCsGo: String,
})

// Po utworzeniu kolekcji wywołujemy ja
module.exports = {
	ZombieModInfo: mongoose.model('ZombieModInfo', ZombieModInfoSchema),
	MixModel: mongoose.model('MixModel', MixModelSchema),
	PbModel: mongoose.model('PbModel', PaintballInfoSchema),
	JailbreakModel: mongoose.model('JailbreakModel', JailBreakSchema),
	FFaModel: mongoose.model('FFaModel', FFaSchema),
	dd2Model: mongoose.model('dd2Model', dd2ClassicSchema),
	codModModel: mongoose.model('codModModel', codModSchema),
	ServerInfoMessageModel: mongoose.model('ServerInfoMessageModel', serverInfoMessageSchema),
	mirageModel: mongoose.model('mirageModel', mirageSchema),
}
