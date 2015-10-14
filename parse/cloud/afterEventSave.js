
var CurrentPlayer = Parse.Object.extend('CurrentPlayer');
var UserUtils = require('cloud/user_utils.js');

// parsed[:type] = type
// parsed[:timestamp] = timestamp
// parsed[:nick] = result[3]
// parsed[:player_id] = result[4]
// parsed[:original_team] = result[5]
// parsed[:target_team] = result[6]

function handleMoveTeam(eventData) {

}

// parsed[:type] = type
// parsed[:timestamp] = timestamp
// parsed[:nick] = result[3]
// parsed[:player_id] = result[4]
function handleEnteredGame(eventData) {
	Parse.Cloud.useMasterKey();
	return UserUtils.findBySteamId(eventData.player_id).then(function (user) {
		var newPlayer = new CurrentPlayer();
		if (user) {
			newPlayer.set('user', user);
			if (user.get('steamName') !== eventData.nick || user.get('username') !== eventData.nick) {
				user.set('steamName', eventData.nick);
				user.set('username', eventData.nick);
				return user.save().then(function() { return newPlayer; });
			} else {
				return newPlayer;
			}
		} else {
			user = new Parse.User();
			user.set('steamName', eventData.nick);
			user.set('steamId', eventData.player_id);
			user.set('password', 'foo');
			user.set('username', eventData.nick);
			return user.save().then(function() {
				newPlayer.set('user', user);
				return newPlayer;
			});
		}
	}).then(function(newPlayer) {
		newPlayer.set('name', eventData.nick);
		return newPlayer.save();
	});
}

function handleLeftGame(eventData) {
	Parse.Cloud.useMasterKey();
	return UserUtils.findBySteamId(eventData.player_id).then(function (user) {
		if (user) {
			var query = new Parse.Query(CurrentPlayer);
			query.equalTo("user", user);
			return query.first().then(function(currentPlayer) {
				return currentPlayer.destroy();
			});
		}
	});
}


Parse.Cloud.afterSave("Event", function(request) {
	Parse.Cloud.useMasterKey();
	var eventObj = request.object;
	switch (eventObj.get('name')) {
		case 'moved_team':   handleMoveTeam(eventObj.get('eventData')); break;
		case 'entered_game': handleEnteredGame(eventObj.get('eventData')); break;
		case 'left_game':    handleLeftGame(eventObj.get('eventData')); break;
	}
});

module.exports.handleEnteredGame = handleEnteredGame;
module.exports.handleLeftGame = handleLeftGame;
