$(document).ready(function(){
	chrome.storage.local.get(['facID','facName'],function(items){
		alert(items.facName);
	});
});
