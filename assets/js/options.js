function restore_options() {
	chrome.storage.local.get(['optKeepAlive','optBlur'], function(items) {
		document.getElementById('cbKeepAlive').checked = items.optKeepAlive;		
		document.getElementById('cbBlur').checked = items.optBlur;		
	});
}

function save_options() {
	var optKeepAlive = document.getElementById('cbKeepAlive').checked;
	var optBlur = document.getElementById('cbBlur').checked;
	chrome.storage.local.set({
		optKeepAlive: optKeepAlive,
		optBlur: optBlur
	});
}

document.addEventListener('DOMContentLoaded', restore_options);

$('#cbKeepAlive').on('change',save_options);
$('#cbBlur').on('change',save_options);
