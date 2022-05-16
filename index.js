// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./auth.json');
const { calculateMapSet, fetchMapSet } = require('./scores-fetch.js');
const mappool = require('./mappool');
const fse = require('fs-extra');
const AsciiTable = require('ascii-table')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

const PLAYERS_TO_DISPLAY = 10;
const REFRESH_COOLDOWN_MINS = 10;

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const user = interaction.member.user;

	if (commandName === 'ping') {
		await interaction.reply('pong');


	} else if (commandName === 'bswc-2022-tryouts') {
		
		console.log("Command scores by " + user.username + " (" + user.id + ")");
		var mapSets = mappool.mapPools;
		var msg = "";
		for(var mapSetName in mapSets) {
			
			var mapSet = mapSets[mapSetName];
			
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
		console.log("Success");
		await interaction.reply(msg)
	} else if (commandName === 'bswc-2022-tryouts-refresh') {
		console.log("Command refresh by " + user.username + " (" + user.id + ")");
		if(!checkLastRefresh()) {
			await interaction.reply("Scores were already refreshed within the last " + REFRESH_COOLDOWN_MINS + " minutes.");
			console.log("Refresh on cooldown");
			return;
		}
		updateRefresh();
		
		var mapSets = mappool.mapPools;
		await interaction.reply("Refreshing scores, done in ~20 seconds");
		for(var mapSetName in mapSets) {
			
			var mapSet = mapSets[mapSetName];
			await fetchMapSet(mapSet);
			console.log("Refreshed " + mapSetName);
		}
	} else if (commandName === 'speed-and-tech') {
		var mapSets = mappool.mapPools;
		var mapSet = mapSets['Speed and Tech'];
		var leaderboard = await calculateMapSet(mapSet);
		var embedmsg = new MessageEmbed().setTitle('Speed and Tech')

		var userNames= '';
		var avgAccs = '';
		var maps = '';

		for(var i = 0; i < leaderboard.length && i < PLAYERS_TO_DISPLAY ; i++) {
			var player = leaderboard[i];
			userNames += '`#'+ i + '`'+ '\u200b \u200b \u200b - \u200b \u200b \u200b' + '**' + player.name + '**' + '\u200b \u200b \u200b \u200b \u200b \u200b \n\n'
			avgAccs += '`' + formatAccPercent(player.acc).toString()+ '`' + '\n\n'
			maps += '`' + player.maps.toString() + '`' + '\n\n'
			
		}
		embedmsg.addFields({name: "Player", value: userNames, inline: true},
		{name: "Average acc \u200b \u200b \u200b\u200b \u200b \u200b", value: avgAccs, inline: true},
		{name: "Maps played", value: maps, inline: true})
		console.log('Success')
		await interaction.reply({ embeds: [embedmsg], ephemeral: false })
		.then(() => console.log('Reply sent.'))
		.catch(console.error);


	} else if (commandName === 'acc-and-midspeed')
	var mapSets = mappool.mapPools;

		var mapSet = mapSets['Acc and midspeed'];
		var leaderboard = await calculateMapSet(mapSet);
		var embedMsgAcc = new MessageEmbed().setTitle('Acc and midspeed')

		var userNames= '';
		var avgAccs = '';
		var maps = '';

		for(var i = 0; i < leaderboard.length && i < PLAYERS_TO_DISPLAY ; i++) {
			var player = leaderboard[i];
			userNames += '`#'+ i + '`'+ '\u200b \u200b \u200b - \u200b \u200b \u200b' + '**' + player.name + '**' + '\u200b \u200b \u200b \u200b \u200b \u200b \n\n'
			avgAccs += '`' + formatAccPercent(player.acc).toString()+ '`' + '\n\n'
			maps += '`' + player.maps.toString() + '`' + '\n\n'
			
		}
		embedMsgAcc.addFields({name: "Player", value: userNames, inline: true},
		{name: "Average acc \u200b \u200b \u200b\u200b \u200b \u200b", value: avgAccs, inline: true},
		{name: "Maps played", value: maps, inline: true})
		console.log('Success')

		await interaction.reply({ embeds: [embedMsgAcc], ephemeral: false })
		.then(() => console.log('Reply sent.'))
		.catch(console.error);

	
});

function formatAccPercent(acc) {
	acc *= 100;
	//https://stackoverflow.com/questions/6134039/format-number-to-always-show-2-decimal-places
	var percent = (Math.round(acc * 100) / 100).toFixed(2);
	return percent + "%";
}


function refreshFilePath() {
	let path = __dirname + "/scores/lastrefresh.json";
	return path;
}

//Return true if ok, false if not.
function checkLastRefresh() {
	let path = refreshFilePath();
	
	if (!fse.existsSync(path)) {
		return true;
	}
	
	var obj = fse.readJsonSync(path);
	var then = new Date(obj.time);
	var current = new Date();
	var diffMs = current - then;
	var diffMins = diffMs / 60000;
	
	return diffMins > REFRESH_COOLDOWN_MINS;
};

function updateRefresh() {
	let path = refreshFilePath();
	var obj = {time: new Date().toString()};
	fse.outputJsonSync(path, obj);
}

// Login to Discord with your client's token
client.login(token);
