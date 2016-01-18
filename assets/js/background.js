facName = '+++';

function checkForValidUrl(tabId, changeInfo, tab) {
	var a = document.createElement('a');
	a.href = tab.url;
	if (a.hostname === 'gsw.gabest.usg.edu') {
		//-- Show pageAction icon	
		if(!/(P_Logout|P_WWWLogin)$/.test(a.pathname)) {		
			chrome.pageAction.show(tabId);
		}
		//-- Retrieve user data after login
		if(/P_GenMenu/.test(a.pathname) && !facName) {		
			console.log('--');
			$.get('https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacSelTerm', function(data){
				var page = $($.parseHTML(data));				
				var headers = page.find('div.staticheaders').html().split(/<br>/g);
				facID = headers[0].trim().split(/\s+/g,1);
				facName = headers[0].trim().split(/\s+/g).slice(1).join(' ');
			});
		}
	}
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
