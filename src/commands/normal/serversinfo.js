const Discord = require('discord.js');
const Gamedig = require('gamedig');
const { EmbedBuilder } = require('@discordjs/builders');

const servers = [
  {
    name: 'Only DD2 #1',
    ip: '54.38.131.56',
    port: '27015'
  },
  {
    name: 'Only DD2 Classic',
    ip: '51.83.164.138',
    port: '27015'
  },
  {
    name: 'CS:GO MOD',
    ip: '51.83.175.252',
    port: '27015'
  },
  {
    name: 'GUNGAME',
    ip: '193.33.176.87',
    port: '27022'
  },
  {
    name: 'ZM + EXP',
    ip: '51.83.166.59',
    port: '27015'
  },
  {
    name: 'JAILBREAK',
    ip: '51.83.147.22',
    port: '27015'
  }
 

];

module.exports = {
  name: 'serversinfo',
  description: 'Wyświetla informacje o serwerach CS 1.6',
  run: async (client, message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return;
  }
    let embedMessage;
    
    const updateEmbed = async () => {
      const embed = new EmbedBuilder()
        .setTitle('Serwery CS 1.6')
        .setColor(15418179)
        .setThumbnail('https://cdn.discordapp.com/avatars/1110268964581429368/4eb8f3d73d3991c2dbad8582bebcb4dc.png?size=4096')
        .setDescription('Aby połączyć się z wybranym serwerem wystarczy wpisać jego adres IP i port w konsoli gry')
        .addFields({ name: '\u200B', value: '\u200B' })
        .setFooter({ text: 'Csowicze', iconURL: 'https://images-ext-2.discordapp.net/external/yo1QzTIM8eFykJBory7ugjoSkh8w3r8RNhYMqUZFnn4/%3Fsize%3D4096/https/cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559' });

      let totalPlayers = 0;
      let totalMaxPlayers = 0;

      for (const server of servers) {
        try {
          const state = await Gamedig.query({
            type: 'cs16',
            host: server.ip,
            port: server.port
          });

          totalPlayers += state.players.length;
          totalMaxPlayers += state.maxplayers;

          embed.addFields(
            { name: server.name, value: `IP: ${server.ip}:${server.port}`, inline: true },
            { name: 'Gracze:', value: `${state.players.length}/${state.maxplayers}`, inline: true },
            { name: 'Mapa:', value: state.map, inline: true }
          );
          
        } catch (error) {
          console.error(error);
          embed.addFields(
            { name: server.name, value:`IP:${server.ip}:${server.port}|Błąd:Nie można pobrać informacji o serwerze`,inline:false}
          );
        }
      }

      const serverFillPercentage = Math.round((totalPlayers / totalMaxPlayers) * 100);
      const nextUpdateTimestamp = Math.floor(Date.now() / 1000) + 120;

      embed.addFields(
        { name:'\u200B',value:'\u200B'},
        {name:'Łącznie graczy na serwerach:',value:`${totalPlayers}/${totalMaxPlayers} (${serverFillPercentage}%)`,inline:true},
        {name:'Następna aktualizacja:',value:`<t:${nextUpdateTimestamp}:R>`,inline:true}
      );

      if (!embedMessage) {
        embedMessage = await message.channel.send({ embeds:[embed] });
      } else {
        await embedMessage.edit({ embeds:[embed] });
      }
    };

    updateEmbed();
    setInterval(updateEmbed, 120000); // aktualizuj co 2 minuty
  }
};




