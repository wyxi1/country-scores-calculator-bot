var MAP_POOLS = {
	"overall": [
		{id:"348320", notes:2144},
		{id:"348299", notes:767},
		{id:"329702", notes:1440},
		{id:"348061", notes:1742},
		{id:"342452", notes:1358},
		{id:"348150", notes:1111},
		{id:"348344", notes:4563},
		{id:"343021", notes:2854}
	],
	"acc": [
		{id:"300833", notes: 940},
		{id:"329873", notes: 1118},
		{id:"315634", notes: 884},
		{id:"346634", notes: 972},
		{id:"190915", notes: 498},
		{id:"139978", notes: 383},
		{id:"121456", notes: 496},
		{id:"311274", notes: 494},
		{id:"318941", notes: 1031},
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
