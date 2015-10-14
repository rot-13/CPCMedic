var eventSave = require('cloud/afterEventSave.js');


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    Parse.Cloud.useMasterKey();

    eventSave.handleMoveTeam({
        nick: 'giladgo2',
        player_id: '123456',
        target_team: 'Red'
    }).then(function() {
        response.success("Great");
    }, function(err){
        response.error(JSON.stringify(err));
    });

});
