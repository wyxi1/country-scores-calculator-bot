const fetch = require('node-fetch');
const fse = require('fs-extra');

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
};

exports.calculateMapSet = calculateMapSet;
exports.fetchMapSet = fetchMapSet;












