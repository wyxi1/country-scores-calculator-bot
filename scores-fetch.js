const fetch = require('node-fetch');
const fse = require('fs-extra');

/* var ALL_PLAYERS = {};

var MAP_POOLS = {
	"overall": [
		{id:"348320"},
		{id:"348299"},
		{id:"329702"},
		{id:"348061"},
		{id:"342452"},
		{id:"348150"},
		{id:"348344"},
		{id:"343021"}
	],
	"acc": [
		{id:"300833"},
		{id:"329873"},
		{id:"315634"},
		{id:"346634"},
		{id:"190915"},
		{id:"139978"},
		{id:"121456"},
		{id:"311274"},
		{id:"318941"},
	]
};


var ACC_MAPS = ["300833","329873","315634","346634","190915","139978","121456","311274","318941"];
var SPEED_MAPS = ["348320","348299","329702","348061","342452","348150","348344","343021"];
 */

/* async function fetchLeaderboard(id) {
	
	var MAX_SWEDES = 10;
	var NUM_PAGES_TO_FETCH = 20;
	var topPlays = [];
	
	var earlyStop = false;

	var analyzeHtml = function(html) {
		
		var jsdom = require("jsdom");
		const { JSDOM } = jsdom;
		const { window } = new JSDOM(html);
		const { document } = (new JSDOM(html)).window;
		global.document = document;

		var $ = jQuery = require('jquery')(window);
		
		var rows = $('table.ranking.global tbody tr');
		if(rows.length == 0) {
			earlyStop = true;
			return;
		}
		
		$.each(rows,function(i,e) {
			var $e = $(e)
			var countryImg = $e.find(".player img");
			var countryURL = countryImg.attr("src");
			
			if(countryURL.endsWith("se.png")) {
				if(topPlays.length >= MAX_SWEDES) {
					return;
				}
				
				//Swedish player
				var playerID = $e.find(".player a").attr("href").substring(3); //Strip the /u/
				var playerName = $e.find(".player .songTop").text().trim();
				var score = parseInt($e.find(".score").text().trim().replace(/\,/g,""));
				//var percentage = $e.find(".percentage").html().trim();
				
				if(!ALL_PLAYERS[playerID]) {
					ALL_PLAYERS[playerID] = playerName;
				}
				
				topPlays.push({
					id: playerID,
					name: playerName,
					score: score,
					//percentage: percentage
				});
			}
			
		});
	};
	
	var baseurl = "https://scoresaber.com/leaderboard/";
	
	//Fetch 10 pages
	
	for(var i = 1; i <= NUM_PAGES_TO_FETCH; i++) {
		var url = 'https://scoresaber.com/leaderboard/' + id + "?page=" + i;
		console.log("Fetching " + url);
		await fetch(url)
			.then(res => res.text())
			.then(text => analyzeHtml(text));
			
		//Let's not spam scoresaber, wait a second.
		await new Promise(r => setTimeout(r, 3000));
		
		if(topPlays.length >= MAX_SWEDES) {
			break;
		}
		
		if(earlyStop) {
			break;
		}
	};

	
	return topPlays;
	
}; */

async function fetchMapSet(set) {
	for(var i = 0; i < set.length; i++) {
		var scoresaberMapId = set[i].id;
		var topPlays = await fetchLeaderboard(scoresaberMapId);
		var path = getLeaderboardPath(scoresaberMapId);
		await fse.outputFile(path, JSON.stringify(topPlays));
		
	}
}

function getCachedLeaderboard(id) {
	const path = getLeaderboardPath(id); 
	const data = JSON.parse(fse.readFileSync(path, "utf-8"));
	return data;
}

function getLeaderboardPath(id) {
	var path = __dirname + "/scores/" + id + ".json";
	return path;
}

async function fetchLeaderboard(id) {
	//Example API var url = "https://scoresaber.com/api/leaderboard/by-id/403551/scores?page=1&countries=SE";
	var page = 1;
	
	
	var makeurl = function(lId, lPage) {
		return "https://scoresaber.com/api/leaderboard/by-id/"+lId+"/scores?page="+lPage+"&countries=SE";
	};
	
	var done = false;
	var maxPages = 3;
	var curMaxPages = maxPages;
	var allResults = []
	
	while(!done) {
		var url = makeurl(id, page);
		var currentResult;
		await fetch(url)
			.then(res => res.text())
			.then(text => currentResult = JSON.parse(text));
			
		if(!currentResult.metadata) {
			await new Promise(r => setTimeout(r, 200));
			break;
		}
			
		if(page == 1) {
			var meta = currentResult.metadata;
			curMaxPages = Math.floor(meta.total/meta.itemsPerPage)+1;
		}
		allResults = allResults.concat(currentResult.scores);
		
		page++;
		if(page > maxPages || page > curMaxPages) {
			done = true;
		} 
		await new Promise(r => setTimeout(r, 250));
		
	}
	
	var topPlays = [];
	for(var i = 0; i < allResults.length; i++) {
		var play = allResults[i];
		topPlays.push({
			id: play.leaderboardPlayerInfo.id,
			name: play.leaderboardPlayerInfo.name,
			score: play.modifiedScore
		});
	}
	
	return topPlays;
}

var calcMaxScore = function(notes) {
	return (notes * 920) - 7245;
};

var calculateMapSet = async function(set) {
	
	var players = {};
	
	for(var i = 0; i < set.length; i++) {
		var scoresaberMapId = set[i].id;
		var scoresaberMapNotes = set[i].notes;
		var maxScore = calcMaxScore(scoresaberMapNotes);
		//var topPlays = await fetchLeaderboard(scoresaberMapId);
		var topPlays = getCachedLeaderboard(scoresaberMapId);
		for(var j = 0; j < topPlays.length; j++) {
			play = topPlays[j];
			if(!players[play.id]) {
				players[play.id] = {name: play.name, maps:{}};
			}
			
			players[play.id].maps[scoresaberMapId] = {
				score: play.score,
				acc: play.score / maxScore
			};
			
			/* players[play.id][scoresaberMapId].score += play.score;
			players[play.id].acc += play.score / maxScore;
			players[play.id].maps += 1; */
		}
	}
	
	Object.keys(players).forEach(function(playerId) {
		var mapsPlayed = 0;
		var totalAcc = 0;
		var numMaps = set.length;
		for(var i = 0; i < set.length; i++) {
			var mapId = set[i].id;
			
			if(mapId in players[playerId].maps) {
				mapsPlayed++;
				totalAcc += players[playerId].maps[mapId].acc;
			} 
			//else totalAcc += 0 and mapsPlayed += 0, so basically nothing.
		}
		
		players[playerId].mapsPlayed = mapsPlayed;
		players[playerId].averageAcc = totalAcc / numMaps;
	});
	
	var sortedPlayers = [];
	for (var id in players) {
		sortedPlayers.push({
			id: id,name:players[id].name,
			acc: players[id].averageAcc,
			maps: players[id].mapsPlayed
		});
	}
	
	function compare( a, b ) {
		if ( a.acc < b.acc ){
			return 1;
		}
		if ( a.acc > b.acc ){
			return -1;
		}
		return 0;
	}
	
	sortedPlayers.sort(compare);
	
	return sortedPlayers;
	
	/* sortedPlayers.sort(compare);
	console.log(`Place \t| Player \t\t\t\t| Score \t| Scores counted`);
	console.log(`--------------------------------------------------------------------------------`);
	for(var i = 0; i < sortedPlayers.length; i++) {
		var player = sortedPlayers[i];
		console.log(`${i+1} \t| ${player.name} \t\t\t\t| ${player.score} \t| ${player.maps}`);
	} */
};

/* var runBoth = async function() {
	console.log("Calculating speed maps");
	await calculateMapSet(SPEED_MAPS);
	console.log("Calculating acc maps");
	await calculateMapSet(ACC_MAPS);
} */

exports.calculateMapSet = calculateMapSet;
exports.fetchMapSet = fetchMapSet;












