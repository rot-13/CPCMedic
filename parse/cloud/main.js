var handlers = require('cloud/event_handlers.js');

require('cloud/app.js');

var Event = Parse.Object.extend('Event');

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    Parse.Cloud.useMasterKey();

    eventSave.handleEnteredGame({
        nick: 'giladgo',
        player_id: '123456'
    }).then(function() {
        return eventSave.handleLeftGame({
            nick: 'giladgo',
            player_id: '123456'
        });
    }).then(function() {
        response.success("Great");
    }, function(err){
        response.error(JSON.stringify(err));
    });

});


Parse.Cloud.job("handleEvents", function(request, response) {
	Parse.Cloud.useMasterKey();

    var unhandledEventsQuery = new Parse.Query(Event);
    unhandledEventsQuery.each(function(eventObj) {

        var handler = null;
    	switch (eventObj.get('name')) {
    		case 'moved_team':   handler = handlers.handleMoveTeam; break;
    		case 'entered_game': handler = handlers.handleEnteredGame; break;
    		case 'left_game':    handler = handlers.handleLeftGame; break;
    		default: handler = function() { return Parse.Promise.as(null); }; break;
    	}
        
    	return handler(eventObj.get('eventData')).then(function() {
            eventObj.set('handled', true);
            return eventObj.save();
        });

    }).then(function() {}, function(err){
        throw "Got an error " + error.code + " : " + error.message;
    });;


});
