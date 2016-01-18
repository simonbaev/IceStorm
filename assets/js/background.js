/*
chrome.runtime.onInstalled.addListener(function() {
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With a new rule ...
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {
						hostEquals: 'gsw.gabest.usg.edu'
					},
				})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});
*/
function checkForValidUrl(tabId, changeInfo, tab) {
	var a = document.createElement('a');
	a.href = tab.url;
	if (a.hostname === 'gsw.gabest.usg.edu' && 
		a.pathname.indexOf('twbkwbis.P_WWWLogin') < 0 &&
		a.pathname.indexOf('twbkwbis.P_Logout') < 0) {
		console.log(a.pathname.indexOf('twbkwbis.P_Logout'));
		chrome.pageAction.show(tabId);
	}
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
