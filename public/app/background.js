// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow:true},
       function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, 
              {"message": "clicked_browser_action"}
          );
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var client_id = "ca4a29d332694630a30e62ae07b2d227";
	var redirectUri = chrome.identity.getRedirectURL() + "spotify";
	console.log(redirectUri);
	chrome.identity.launchWebAuthFlow({
	  "url": "https:	//accounts.spotify.com/authorize?client_id="+client_id+
			 "&redirect_uri="+ encodeURIComponent(redirectUri) +	
			 "&response_type=token", 
	  'interactive': true,  
	},
	(redirect_url) => {	
		console.log(redirect_url);
		var url_string = redirect_url.replace("#","?");
		console.log(url_string);
		var url = new URL(url_string);
		var c = url.searchParams.get("access_token");
		console.log(c);
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {action: "access_token", token: c}, function(response) {});
			});
	});
});		

