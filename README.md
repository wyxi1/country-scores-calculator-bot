A simple Discord bot for tryouts for Sweden's team in Beat Saber World Cup 2022.

With some small modifications this can be used for arbitrary countries and map pools.

Code quality is a bit inconsistent.

# Dependencies/requirements

Runs on nodejs version v16.14.2 and npm version 8.7.0, have not tested others but it will probably be fine as long as its not too old.

# Setup

1. Create a bot application in discord https://discord.com/developers/applications there are guides for this.
2. `npm install`
3. Create a file called `auth.json` in the root directory, with the format:

```
{
	"token": "<bot login token>",
	"clientId": "<bot client ID>"
}
```

These IDs can be found in the discord application

4. Register commands by running `node deploy-commands.js`

# Bot permissions when inviting to server
Requires scopes `bot` and `applications.commands`

Bot permissions to check:

```
Read Messages/View Channels
Send Messages
Read Message History
```

Actually I don't know which of these are required at a minimimum this is my first bot, we really just need to be able to accept a command and send a message back.

# Running the bot

1. `node index.js`

# Commands

* `/bswc-2022-tryouts` - prints out current standings table
* `/bswc-2022-tryouts-refresh` - Refresh scores, 10 minute cooldown
* `/speed-and-tech` - Leaderboard for speed and tech, embeds output
* `/acc-and-midspeed` - Leaderboard for acc and midspeed, embeds output

# Local files cache

To be able to answer with the scores fast, we have to separate calling scoresaber API and saving the standings versus a command to display them, so there are 2 commands. The refresh command will save leaderboard scores to a `/scores` folder. It will also save a file called `lastrefresh.json` with the timestamp of last refresh to keep with the refresh cooldown.