const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./auth.json');

const commands = [
	//new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	//new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('bswc-2022-tryouts').setDescription('Stats for BSWC 2022 Swedish tryouts'),
	new SlashCommandBuilder().setName('bswc-2022-tryouts-refresh').setDescription('Refresh stats for BSWC 2022 Swedish tryouts.'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

/* rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error); */
	
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();