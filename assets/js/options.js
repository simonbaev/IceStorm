function restore_options() {
	chrome.storage.local.get(['optKeepAlive'], function(items) {
		document.getElementById('cbKeepAlive').checked = items.optKeepAlive;		
	});
}

function save_options() {
	var optKeepAlive = document.getElementById('cbKeepAlive').checked;
	chrome.storage.local.set({
		optKeepAlive: optKeepAlive
	});
}

document.addEventListener('DOMContentLoaded', restore_options);

$('#cbKeepAlive').on('change',save_options);
