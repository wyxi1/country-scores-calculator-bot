var MAP_POOLS = {
	"Speed and Tech": [
		{id:"388758", notes:681}, //Tylenol
		{id:"384302", notes:1228}, //yotsuya
		{id:"431891", notes:1212}, //shanti
		{id:"363046", notes:1724}, //DiXaster
		{id:"368846", notes:3345}, //Celtchar 
		{id:"446399", notes:2920} //Construxion
	],
	"Acc and midspeed": [
		{id:"372534", notes: 961}, //Trapped in the past
		{id:"369399", notes: 544}, // DUAL BREAKER
		{id:"376259", notes: 1359}, //Minazoko //TODO NOTES
		{id:"396795", notes: 934}, //Cinco
		{id:"406936", notes: 1301}, //If you can't hang
		{id:"417776", notes: 1029}, //Kotone - punishment
		{id:"419538", notes: 634}  //Chakra
	]
};

var poolNames = function() {
	return MAP_POOLS.keys();
};

var pool = function(key) {
	return MAP_POOLS[key];
};

exports.listPools = poolNames;
exports.mapPools = MAP_POOLS;
exports.pool = pool;
