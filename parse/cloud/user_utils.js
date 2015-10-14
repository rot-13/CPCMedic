function findBySteamId(steamId) {
	var query = new Parse.Query(Parse.User);
	query.equalTo("steamId", steamId);
	return query.first();
}


module.exports.findBySteamId = findBySteamId;
