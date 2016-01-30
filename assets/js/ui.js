function termChangeHandler(ev) {
	var termYear = $('#termYear').val().trim();
	var termSelect = $('#termSelect').val();
	var termString =  termYear + termSelect;
	updateTerm(termString);
	chrome.storage.local.set({
		termString: termString,
		termSelect: termSelect,
		termYear: termYear 
	});
}

function updateTerm(termString) {
	$.post({
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacStoreTerm',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&term=' + termString,
		error: function(e) {
			console.log(e);
		},
		success: function() {
			$.get({
				url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacCrnSel',
				error: function(e) {
					console.log(e);
				},
				success: function(data) {
					var html = $($.parseHTML(data));
					var panel = $('#accordion').empty();
					html.find('select[name=crn] option').each(function(index){
						var opt = $(this);
						var desc = opt.text().split(/,/)[0];
						var courseNumbers = desc.split(/:/)[0].trim().split(/\s+/g);
						var courseTitle = desc.split(/:/)[1].trim();
						var crn = opt.val();
						panel
						.append(
							$('<div>')
							.addClass('panel panel-default')
							.append(
								$('<div>')
								.addClass('panel-heading')
								.attr({
									role: 'tab',
									id: 'th_' + (index+1)
								})
								.append(
									$('<h4>')
									.addClass('panel-title')
									.append(
										$('<a>')
										.attr({
											'role': 'button',
											'data-toggle': 'collapse',
											'href': '#tc_' + (index+1),
											'aria-expanded': false,
											'aria-control': 'tc_' + (index+1)
										})
										.html('<h4>' + courseNumbers.slice(0,2).join(' ') + '<small>&nbsp;(' + courseNumbers[2] + ')</small></h4>' + courseTitle)
									)
								)
							)
							.append(
								$('<div>')
								.addClass('panel-collapse collapse')
								.attr({
									'id': 'tc_' + (index+1),
									'role': 'tabpanel',
									'aria-labelledby': 'th_' + (index+1)
								})
								.append(
									$('<div>')
									.addClass('panel-body')
									.append(
										$('<table>')
										.addClass('table table-bordered table-hover table-condensed')
										.append(
											$('<thead>')
											.append(
												$('<tr>')
												.append($('<th>').text('#'))
												.append($('<th>').text('Name'))
												.append($('<th>').text('GSW ID'))
												.append($('<th>').text('E-Mail'))
											)
										)	
										.append(
											$('<tbody>')
											.append(
												$('<tr>')
												.append($('<td>').text('1'))
												.append($('<td>').text('John Doe'))
												.append($('<td>').text('913123456'))
												.append(
													$('<td>')
													.append(
														$('<a>')
														.attr('href', 'mailto:' + 'jdoe23@radar.gsw.edu')
														.text('jdoe23@radar.gsw.edu')
													)
												)
											)
											.append(
												$('<tr>')
												.append($('<td>').text('2'))
												.append($('<td>').text('Peter Pan'))
												.append($('<td>').text('913000000'))
												.append(
													$('<td>')
													.append(
														$('<a>')
														.attr('href', 'mailto:' + 'ppan3@radar.gsw.edu')
														.text('ppan3@radar.gsw.edu')
													)
												)
											)
										)
									)
								)
							)	
						);
					});
				}
			});
		}
	});
}

$(document).ready(function(){
	chrome.storage.local.get(['facID','facName','termSelect','termYear','termString'],function(items){
		$('#facName').text(items.facName);
		$('#termSelect option[value="' + items.termSelect + '"]').prop('selected', true);
		$('#termYear').val(items.termYear);		
		updateTerm(items.termString);
	});

	$('#termSelect').change(termChangeHandler);
	$('#termYear').change(termChangeHandler);

});

