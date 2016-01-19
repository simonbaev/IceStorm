document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.local.get(['facID','facName'],function(items){
		$('#name').text(items.facName);
	});
});