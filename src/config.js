module.exports = {
	prefix: '!', //jeśli planujesz dodawać komenedy pod prefix to tutaj możesz go sobie ustawic, komendy w bocie są na SLASH
	owner: '', //ID WLASCICIELA bota
	token: '', //token bota discord

	footer: {
		text: 'Csowicze', //Text w footerze, wyswietla sie w kazdej tabelce/emebdzie
		iconURL:
			'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559',
	}, //Ikona footera
	//Ikona thumbnail, jest to taka ikona ktora jest wyswietalana w prawym gornym rogu embeda
	thumbnail:
		'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559',
	color: 15418179, //kolor embeda, kolor podaj w systemie dziesiatkowym, jesli masz hex to skonwertuj go (https://www.rapidtables.org/pl/convert/number/hex-to-decimal.html)

	//Dodawanie serwerów, jaką nazwe serwera podamy taka nazwa będzie w choices. KLUCZ => ffa, WARTOŚĆ => FFaModel. Jeśli zmieniamy nazwe modelu bądź tworzymy NOWY musimy tutaj tez zmienic aby caly system dzialal prawidlowo. Nazwe modelu bierzemy z pliku baza.js.
	servers: {
		ffa: 'FFaModel',
		'dd2-classic': 'dd2Model',
		paintball: 'PbModel',
		'zm-exp': 'ZombieModInfo',
		cod: 'codModModel',
		jailbreak: 'JailbreakModel',
		mirage: 'mirageModel',
		// 'NazwaSerwera (pobiera ta nazwe choices)': 'Nazwa Utworzonego Modelu w pliku baza.js'
	},

	//Dodawanie serwerów CS 1.6 do tabelki GŁÓWNEJ która sumuje wszystkich graczy
	//Discord ma limit osadzeń w emebdzie do 25, jesli wywali blad to zmien display z true na false, serwer nie bedzie widoczny w tabelce ale ilosc slotow oraz ilosc graczy (suma) bedzie wliczala sie do Łącznie graczy na serwerach:
	ServersListCs16: [
		{
			name: 'Only DD2 Classic',
			ip: '51.83.164.138',
			port: '27015',
			display: true,
		},
		{
			name: 'ZM + EXP',
			ip: '51.83.166.59',
			port: '27015',
			display: true,
		},
		{
			name: 'FFA + 4FUN ',
			ip: '195.3.221.215',
			port: '27016',
			display: true,
		},
		{
			name: 'COD MOD 301 ',
			ip: '54.38.141.253',
			port: '27015',
			display: true,
		},
		{
			name: 'JAILBREAK',
			ip: '51.83.147.22',
			port: '27015',
			display: true,
		},
		{
			name: 'Paintball',
			ip: '80.72.33.230',
			port: '27295',
			display: true,
		},
	],

	//Taka sama sytuacja jak z serwerami cs 1.6, póki co nie ma tutaj opcji ukrycia serwera
	ServersListCsGo: [
		{
			name: 'ONLY MIRAGE',
			ip: '51.83.169.117',
			port: '27015',
		},
	],
}

// Teraz aby ustawić szczegłowe statystyki dla kazdego serwera z OSOBNA wejdz do folderu src następnie rozwin folder events i znajduja sie tam dwa foldery cs1.6-serwery, csgo-serwery i to nas interesuje, reszta nie
// Jeśli chcemy zedytowac serwera to nazwe pliku możemy zmienić na swoj serwer
// Przechodząc do konfiguracji, w miejscu channelId zmieniamy ID kanalu na taki gdzie ma byc wysylana tabelka, po ewentualnym restarcie bota tabelka bedzie sie edytowac, IDWiadomosci jest zapisywane do bazy.
// W linijce 21 (const serverInfo = await Gamedig.query({) zmieniamy IP serwera na swój
// W miejscu ignoredPlayers podejamy dokładny nick bota/gracza który ma być ignorowany, wtedy ten user kolo nicku nie ma czasu oraz liczby kili i jego nick jest stale pogrubiony

// Gdy już to zrobiliśmy przechodzimy do pliku baza.js i konfigurujemy tam swoją baze.

// Jeśli chcesz utworzyć nowy plik z nowym serwerem musisz:
// 1. Utworzyć nowy model w baza.js i go wywołać
// 2. Stwórz nowy plik (skopiuj kod z innego) i zaimportuj model z baza.js do pliku
// 3. Pozmieniaj w kodzie nazwe ze starego modelu na nowy, czyli: Ctrl + F wpisujemy stara nazwe modelu gdy znajdziemy Ctrl + d (Linijka 27, 33, 35, 43, 48, 55, 125, 143, 157) i zmieniamy nazwe ze starego na nowy. Na koniec wystarczy zmienić id kanału oraz IP serwera. Jeśli chcemy aby serwer był w głównej tabelce to go dodajemy do configu. Tyle :)

// Jeśli jest za dużo serwerów i chcesz usunąć plik
// 1. Usuń plik z serwerem
// 2. Usuń niepotrzebną kolekcje (model) z pliku baza.js
// 3. Tyle :)

// Nazwy serwerów w choices pod / nie zmieniaja sie
// 1. Zresetuj bota
// 2. Uzyj komendy (wywolaj ja) wtedy komenda powinna sie przeladowac

// Jeśli masz jakiś problem napisz do mnie na discordzie theproshizer

// Jeśli wywala ci błąd w konsoli to oznacza, że któryś serwer nie działa, nie jest to błąd wynikający z kodu
// Error: UDP - Timed out after 2000ms
//     at Timeout.<anonymous> (C:\Users\marci\Desktop\csowicze-dc\node_modules\gamedig\lib\Promises.js:7:25)
//     at listOnTimeout (node:internal/timers:569:17)
//     at process.processTimers (node:internal/timers:512:7)
