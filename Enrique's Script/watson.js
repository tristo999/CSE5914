var readline = require('readline-sync');

const AssistantV2 = require('watson-developer-cloud/assistant/v2');
var service = new AssistantV2({
  iam_apikey: 'N6aVgbwc2HSjsEoLtjoGBVqheR_30Jxdn_jQw6nz-UCW',
  version: '2019-02-02'
});
var assistantId = 'dbdb7d30-0fb5-4b86-8290-22a90b7b467b';
var sessionId;

// Create session.
service.createSession({
  assistant_id: assistantId
}, function(err, result) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  sessionId = result.session_id;
  sendMessage(); // start conversation with empty message
});

// Send message to assistant.
function sendMessage(messageText) {
  service.message({
    assistant_id: assistantId,
    session_id: sessionId,
    input: {
      message_type: 'text',
      text: messageText,
      'options': {
      'return_context': true
    }
    }
  }, processResponse);
}

// Process the response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }

  var currentIntent;

   
   	
  // If an intent was detected, log it out to the console.
  
  if (response.output.intents.length > 0) {
  	currentIntent = response.output.intents[0].intent;
    //console.log('Detected intent: #' + currentIntent);
  }
 
  // Display the output from assistant, if any. Assumes a single text response.
  if (response.output.generic.length != 0) {
    var i
      for (i = 0; i < response.output.generic.length; i++)
      {
      	console.log(response.output.generic[i].text);
      }
  }

  if (currentIntent == 'General_Ending') {
      service.deleteSession({
        assistant_id: assistantId,
        session_id: sessionId
      }, function(err, result) {
        if (err) {
          console.error(err); // something went wrong
        }
      });
      return;
  }
  if (response.output.actions)
   {
   		//console.log(response.output.actions[0].name);
   		//console.log(response.entities[0]);
   		//console.log(JSON.stringify(response, null, 2));
   		
   		//action name
   		//console.log(response.output.entities[0].value);
   		if (response.output.actions[0].name == "make_playlist") {
	   		var j;
	   		var artist_name = "Undefined";
	   		for (j = 0; j < response.output.entities.length; j ++)
	   		{
	   			if (response.output.entities[j].entiy == "artist")
	   			{
	   				artist_name = response.output.entities[j].value
	   			}
	   		}
	   		console.log("spotify.com"/*spotify function here*/);
	   	}
  }
  // Prompt for the next round of input.
  var newMessageFromUser = readline.question(">> ");

    //   if (newMessageFromUser === 'quit') {
    //   service.deleteSession({
    //     assistant_id: assistantId,
    //     session_id: sessionId
    //   }, function(err, result) {
    //     if (err) {
    //       console.error(err); // something went wrong
    //     }
    //   });
    //   return;
    // }
  sendMessage(newMessageFromUser);
}
