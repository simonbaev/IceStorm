var justAuthenticated = true;

function tabsUpdated(tabId, changeInfo, tab) {
	if(changeInfo.status === "complete") {
		var a = document.createElement('a');
		a.href = tab.url;
		if (a.hostname === 'gsw.gabest.usg.edu') {
			//-- Show pageAction icon	
			if(!/(P_Logout|P_WWWLogin)$/.test(a.pathname)) {		
				chrome.pageAction.show(tabId);
			}
			//-- Something to do right after login
			if(/WELCOME/.test(a.search)) {
				chrome.tabs.update(tabId,{url: a.protocol + a.hostname + a.pathname + '?name=bmenu.P_FacMainMnu'});
				chrome.alarms.create('watchdog', {periodInMinutes: 5});
			}
		}
	}
}

function pageActionClicked(tab) {
	$.ajax({
		method: 'GET',
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwgkogad.P_SelectEmalView',
		success: function(data){
			if($($.parseHTML(data)).find('form[name="loginform"]').length) {
				alert('Same RAIN account was used to start another session, please re-login');
				chrome.tabs.update(
					tab.id,
					{
						url: 'https://gsw.gabest.usg.edu/pls/B420/twbkwbis.P_WWWLogin'
					}
				);
			}
			else {	
				chrome.tabs.create(
					{
						url: 'ui.html',
						index: tab.index + 1
					}
				);	
			}
		}
	});
}

function extensionInstalled(details) {
	if(details.reason === "install") {
		chrome.storage.local.clear(function(){
			//-- Identify and store current Term
			var cDate = new Date();
			var cMonth = cDate.getMonth();
			var termSelect = (cMonth < 4) ? "02" : ((cMonth < 7) ? "05" : "08");
			var termYear = "" + cDate.getFullYear();
			var termString =  termYear + termSelect;
			chrome.storage.local.set({
				termSelect: termSelect,
				termYear: termYear,
				termString: termString,
				optPrintWork: false,
				optKeepAlive: true
			});	
		});
	}
}

function alarmBeeps(alarm) {
	if(alarm.name === "watchdog") {
		chrome.storage.local.get('optKeepAlive',function(items){
			if(items.optKeepAlive){
				$.ajax({
					method: 'GET',
					url: 'https://gsw.gabest.usg.edu/pls/B420/bwgkogad.P_SelectEmalView',
					success: function(data){
						if($($.parseHTML(data)).find('form[name="loginform"]').length) {
							//-- we can see login form so we have to close UI and inform the user
							chrome.runtime.sendMessage('Same RAIN account was used to start another session, please re-login');
						}
					}
				});
			}
		});
	}
}

chrome.tabs.onUpdated.addListener(tabsUpdated);

chrome.pageAction.onClicked.addListener(pageActionClicked);

chrome.runtime.onInstalled.addListener(extensionInstalled);

chrome.alarms.onAlarm.addListener(alarmBeeps);
