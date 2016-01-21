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
			if(/P_GenMenu/.test(a.pathname)) {
				//-- Identify Name and ID of the logged used
				$.get('https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacSelTerm', function(data){
					var page = $($.parseHTML(data));				
					var headers = page.find('div.staticheaders').html().split(/<br>/g);
					facID = headers[0].trim().split(/\s+/g,1)[0];
					facName = headers[0].trim().split(/\s+/g).slice(1).join(' ');
					chrome.storage.local.set({facID: facID, facName: facName});
				});
			}
		}
	}
}

function pageActionClicked(tab) {
	chrome.tabs.create({
		url: 'ui.html'
	}, 
	function(tab){

	});	
}

chrome.tabs.onUpdated.addListener(tabsUpdated);

chrome.pageAction.onClicked.addListener(pageActionClicked);


