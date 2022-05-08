// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./auth.json');
const { calculateMapSet, fetchMapSet } = require('./scores-fetch.js');
const mappool = require('./mappool');
const fse = require('fs-extra');
const fs = require('fs');
const AsciiTable = require('ascii-table')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

const PLAYERS_TO_DISPLAY = 10;


client.on('interactionCreate', async interaction => {
	console.log("Got interaction");
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'bswc-2022-tryouts') {
		var mapSets = mappool.mapPools;
		console.log(mapSets);
		var msg = "";
		for(var mapSetName in mapSets) {
			
			var mapSet = mapSets[mapSetName];
			console.log(mapSet);
			var leaderboard = await calculateMapSet(mapSet);
			msg += "\n```\n";
			var table = new AsciiTable(mapSetName);
			table.setHeading("","Player","Average acc", "Maps played");
			
			for(var i = 0; i < leaderboard.length && i < PLAYERS_TO_DISPLAY ; i++) {
				var player = leaderboard[i];
				table.addRow(i+1, player.name, formatAccPercent(player.acc), player.maps);
			}
			msg += table.toString();
			msg += "```";
		}
		console.log(msg);
		await interaction.reply(msg);
	} else if (commandName === 'bswc-2022-tryouts-refresh') {
		var mapSets = mappool.mapPools;
		await interaction.reply("Refreshing scores");
		for(var mapSetName in mapSets) {
			
			var mapSet = mapSets[mapSetName];
			await fetchMapSet(mapSet);
		}
	} 
});

function formatAccPercent(acc) {
	acc *= 100;
	//https://stackoverflow.com/questions/6134039/format-number-to-always-show-2-decimal-places
	var percent = (Math.round(acc * 100) / 100).toFixed(2);
	return percent + "%";
}

// Login to Discord with your client's token
client.login(token);