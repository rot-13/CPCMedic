
var CurrentPlayer = Parse.Object.extend('CurrentPlayer');
var UserUtils = require('cloud/user_utils.js');

function makeSlackNotification(msg) {
	return Parse.Config.get().then(function(config) {
		var slackToken = config.escape('slack_token');
		return Parse.Cloud.httpRequest({ url: 'https://slack.com/api/chat.postMessage?token=' + slackToken +
			'&channel=tlv-engineering&text=' + encodeURIComponent(msg) +
			'&username=TFBot&link_names=1&icon_url=http%3A%2F%2Fi.imgur.com%2FWBPiOlw.png%3F1&pretty=1'});
	})


}

// parsed[:type] = type
// parsed[:timestamp] = timestamp
// parsed[:nick] = result[3]
// parsed[:player_id] = result[4]
// parsed[:original_team] = result[5]
// parsed[:target_team] = result[6]

function handleMoveTeam(eventData) {
	return UserUtils.findBySteamId(eventData.player_id).then(function (user) {
		if (user) {
			var query = new Parse.Query(CurrentPlayer);
			query.equalTo("user", user);
			return query.first().then(function(currentPlayer) {
				currentPlayer.set('team', eventData.target_team.toLowerCase());
				return currentPlayer.save();
			});
		}
	});
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
	}).then(function() {
		return makeSlackNotification(eventData.nick + ' has joined the game!');
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
	var handler = null;
	switch (eventObj.get('name')) {
		case 'moved_team':   handler = handleMoveTeam; break;
		case 'entered_game': handler = handleEnteredGame; break;
		case 'left_game':    handler = handleLeftGame; break;
	}
	return handler(eventObj.get('eventData')).then(function() {
    }, function(err){
		throw "Got an error " + error.code + " : " + error.message;
    });
});

module.exports.handleEnteredGame = handleEnteredGame;
module.exports.handleLeftGame = handleLeftGame;
module.exports.handleMoveTeam = handleMoveTeam;
