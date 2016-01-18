document.addEventListener('DOMContentLoaded', function(){
	$('#name').text(chrome.extension.getBackgroundPage().facName);
});