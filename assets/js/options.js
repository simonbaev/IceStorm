function restore_options() {
	chrome.storage.local.get(
		{
			workaround_print: true,
		},
		function(items) {
			document.getElementById('cbPrint').checked = items.workaround_print;
		}
	);
}

function save_options() {
	var workaround_print = document.getElementById('cbPrint').checked;
	chrome.storage.local.set(
		{
			workaround_print: workaround_print
		}, 
		function() {		
		}
	);
}

document.addEventListener('DOMContentLoaded', restore_options);

$('#cbPrint').on('change',save_options);
