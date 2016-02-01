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

function addClassesByCRN(container, options, i) {
	//-- Termination condition
	if(i <= 0) {
		return;
	}
	var index = options.length - i;
	var opt = options.eq(index);
	var desc = opt.text().split(/,/)[0];
	var courseNumbers = desc.split(/:/)[0].trim().split(/\s+/g);
	var courseTitle = desc.split(/:/)[1].trim();
	var crn = opt.val();
	container
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
					.html('<strong>' + courseNumbers.slice(0,2).join(' ') + '<small>&nbsp;(' + courseNumbers[2] + ')</small></strong>:&nbsp' + courseTitle)
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
							.append($('<th>').text('#').addClass('td_#'))
							.append($('<th>').text('Name').addClass('td_name'))
							.append($('<th>').text('GSW ID').addClass('td_id'))
							.append($('<th>').text('E-Mail').addClass('td_email'))
						)
					)	
					.append($('<tbody>'))
				)
			)
		)
	);
	$.ajax({
		type: 'POST',
		async: true,
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacStoreCRN',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&calling_proc_name=P_FACCRNSEL&crn=' + crn,							
		error: function(e) {
			console.log(e);
		},
		success: function() {
			$.ajax({
				type: 'GET',
				async: true,
				url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfcwl.P_FacClaListSum',
				error: function(e) {
					console.log(e);
				},
				success: function(data) {
					var html = $($.parseHTML(data));
					html.find('table.datadisplaytable:eq(2) tr:gt(0)').each(function() {
						var tr = $(this);
						var email = tr.find('td span.fieldmediumtext a').last().attr('href').split(/[:]/)[1];
						var name = tr.find('td:eq(1)').text();
						var lname = name.split(/,/)[0].trim();
						var fname = name.split(/,/)[1].trim().split(/\s/,1)[0].trim();
						$('#tc_' + (index+1) + ' table.table tbody')
						.append(
							$('<tr>')
							.append($('<td>').text(tr.find('td:eq(0)').text()))
							.append($('<td>').text(name))
							.append($('<td>').text(tr.find('td:eq(2)').text()))
							.append(
								$('<td>')
								.append(
									$('<a>')
									.attr(
										'href', 
										'mailto:' + fname + '%20' + lname + '%20' +
										'%3c' + email + '%3e' + '?subject=' + courseNumbers.slice(0,2).join('%20') + ':%20'
									)
									.text(email)
								)
							)
						);
					});
					addClassesByCRN(container, options, i-1);
				}
			});
		}
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
					var CRNs = html.find('select[name=crn] option');
					addClassesByCRN($('#accordion').empty(), CRNs, CRNs.length);
				}
			});
		}
	});
}

$(document).ready(function(){
	//-- Identify Name and ID of the logged used
	$.get('https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacSelTerm', function(data){
		var page = $($.parseHTML(data));				
		var headers = page.find('div.staticheaders').html().split(/<br>/g);
		var facID = headers[0].trim().split(/\s+/g,1)[0];
		var facName = headers[0].trim().split(/\s+/g).slice(1).join(' ');
		$('#facName').text(facName);
	});	
	//-- Set term from local storage
	chrome.storage.local.get(['termSelect','termYear','termString'],function(items){
		$('#termSelect option[value="' + items.termSelect + '"]').prop('selected', true);
		$('#termYear').val(items.termYear);		
		updateTerm(items.termString);
	});

	$('#termSelect').change(termChangeHandler);
	$('#termYear').change(termChangeHandler);

});

