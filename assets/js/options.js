function restore_options() {
	chrome.storage.local.get(['optPrintWork','optKeepAlive'], function(items) {
		document.getElementById('cbPrint').checked = items.optPrintWork;
		document.getElementById('cbKeepAlive').checked = items.optKeepAlive;		
	});
}

function save_options() {
	var optPrintWork = document.getElementById('cbPrint').checked;
	var optKeepAlive = document.getElementById('cbKeepAlive').checked;
	chrome.storage.local.set({
		optPrintWork: optPrintWork,
		optKeepAlive: optKeepAlive
	});
}

document.addEventListener('DOMContentLoaded', restore_options);

$('#cbPrint').on('change',save_options);
$('#cbKeepAlive').on('change',save_options);
