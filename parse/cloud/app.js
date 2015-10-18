// These two lines are required to initialize Express.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'jade');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.

app.get('/', function(req, res) {
	res.redirect(301, '/players');
});


var CurrentPlayer = Parse.Object.extend('CurrentPlayer');

function serializeParseArr(arr) {
	return arr.map(function(p) { return p.toJSON(); });
}

app.get('/players', function(req, res) {
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query(CurrentPlayer);
	query.find().then(function(currentPlayers){
		var redPlayers = [];
		var bluPlayers = [];
		var spectators = [];
		
		currentPlayers.forEach(function(player) {
			if (player.get('team') == 'red') {
				redPlayers.push(player.toJSON());
			} else if (player.get('team') == 'blue') {
				bluPlayers.push(player.toJSON());
			} else if (player.get('team') == 'spectator') {
				spectators.push(player.toJSON());
			}
		});

		res.render('players', {
			redPlayers: redPlayers,
			bluPlayers: bluPlayers,
			spectators: spectators
		});

	});

});

// This line is required to make Express respond to http requests.
app.listen();
