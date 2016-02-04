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

function getGrade(td) {
	if(td.find('input[name="grde_tab"]').length === 1)
		return td.find('input[name="grde_tab"]').val();
	if(td.find('select[name="mgrde_tab"]').length === 1)
		return td.find('select[name="mgrde_tab"]').val();	
}

function addClassesByCRN(container, CRNs, i) {
	//-- Termination condition
	if(i <= 0) {
		return;
	}
	var index = CRNs.length - i;
	var CRN = CRNs.eq(index);
	var desc = CRN.text().split(/,/)[0];
	var courseNumbers = desc.split(/:/)[0].trim().split(/\s+/g);
	var courseTitle = desc.split(/:/)[1].trim();
	var crnValue = CRN.val();
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
						'id': 'ta_' + (index+1),
						'data-toggle': 'collapse',
						'href': '#tc_' + (index+1),
						'aria-expanded': false,
						'aria-control': 'tc_' + (index+1)
					})
					.html('<strong>' + courseNumbers.slice(0,2).join(' ') + '<small>&nbsp;(' + courseNumbers[2] + ')</small></strong>:&nbsp' + courseTitle)
				)
			)
			.click(function() {
				$(this).next('div.collapse').collapse('toggle');
			})
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
					.addClass('table table-bordered table-condensed')
					.append(
						$('<thead>')
						.append(
							$('<tr>')
							.append($('<th>').text('#').addClass('td_N'))
							.append($('<th>').text('Name').addClass('td_name'))
							.append($('<th>').text('GSW ID').addClass('td_id'))
							.append(
								$('<th>')
								.addClass('td_att')
								.append(
									$('<div>')
									.addClass('checkbox')
									.append(
										$('<label><input type="checkbox"><b>Att.</b></label>')
									)
									.find('input')
									.change(function(){
										var state = this.checked;
										$(this).parents('table.table').find('tbody tr td.td_att input').each(function(){
											this.checked = state;
										});
									})									
									.end()
								)
							)
							.append($('<th>').text('Midterm').addClass('td_mid'))
							.append($('<th>').text('Final').addClass('td_fin'))
							.append($('<th>').text('E-Mail').addClass('td_email'))
							
						)
					)	
					.append($('<tbody>'))
				)
			)
		)
		.hide()
	);
	//-- Set CRN and in case of success retrieve class roster
	$.ajax({
		type: 'POST',
		async: true,
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacStoreCRN',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&calling_proc_name=P_FACCRNSEL&crn=' + crnValue,							
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
					var rows = html.find('table.datadisplaytable:eq(2) tr:gt(0)');
					if(!rows.length) {
						$('#th_' + (index+1)).parent().remove();
						addClassesByCRN(container, CRNs, i-1);
						return;
					}
					$('#th_' + (index+1)).parent().show();
					rows.each(function() {
						var tr = $(this);
						var email = tr.find('td span.fieldmediumtext a').last().attr('href').split(/[:]/)[1];
						var name = tr.find('td:eq(1)').text();
						var lname = name.split(/,/)[0].trim();
						var fname = name.split(/,/)[1].trim().split(/\s/,1)[0].trim();
						var wd = /WD/.test(tr.find('td:eq(3)').text());
						$('#tc_' + (index+1) + ' table.table tbody')
						.append(
							$('<tr>')
							.addClass(wd ? 'bg-danger' : '')
							.attr({
								'title': wd ? tr.find('td:eq(3)').text().trim() : ''
							})
							.append($('<td>').text(tr.find('td:eq(0)').text()).addClass('td_N'))
							.append($('<td>').text(name).addClass('td_name'))
							.append($('<td>').text(tr.find('td:eq(2)').text()).addClass('td_id'))
							.append(
								$('<td>')
								.addClass('td_att')
								.append(
									$('<div>')
									.append(
										$('<input>')
										.attr({
											'type':'checkbox'
										})
										.click(function(){
											this.checked = !this.checked;
										})
									)
									.click(function(){
										$(this).find('input[type="checkbox"]').each(function(){ 
											if(!this.disabled) {
												this.checked = !this.checked; 
											}
										});
									})
								)							
							)						
							.append(
								$('<td>')
								.addClass('td_mid')
								.append(
									$('<select>')
									.addClass('form-control')
									.append($('<option>').val(null).text('None').attr('selected',''))									
									.append($('<option>').val('A').text('A'))									
									.append($('<option>').val('B').text('B'))									
									.append($('<option>').val('C').text('C'))									
									.append($('<option>').val('D').text('D'))									
									.append($('<option>').val('F').text('F'))									
									.append($('<option>').val('I').text('I'))									
									.append($('<option>').val('I').text('P'))									
								)
							)
							.append(
								$('<td>')
								.addClass('td_fin')
								.append(
									$('<select>')
									.addClass('form-control')
									.append($('<option>').val(null).text('None').attr('selected',''))
									.append($('<option>').val('A').text('A'))									
									.append($('<option>').val('B').text('B'))									
									.append($('<option>').val('C').text('C'))									
									.append($('<option>').val('D').text('D'))									
									.append($('<option>').val('F').text('F'))									
									.append($('<option>').val('I').text('I'))									
									.append($('<option>').val('I').text('P'))									
								)
							)
							.append(
								$('<td>')
								.addClass('td_email')
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
					//-- Retrieve Final grades from RAIN
					$.ajax({
						type: 'GET',
						async: true,
						url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacFinGrd',
						error: function(e) {
							console.log(e);
						},
						success: function(P_FacFinGrd) {
							var html = $($.parseHTML(P_FacFinGrd));
							if(html.find('span.errortext').length) {
								//-- Something wrong on the Finals grades page, so we disable 'Final' column
								$('#tc_' + (index+1) + ' table.table .td_fin select').attr('disabled','');
								$('#tc_' + (index+1) + ' table.table .td_fin').addClass('warning').attr('title','Temporally unavailable');
							}
							// else {
							// 	var pageAnchors = html.find('span.fieldlabeltext').nextAll('a');
								// getFinalGrades(
								// 	$('#tc_' + (index+1) + ' table.table'), 
								// 	html.find('form[name=grades]'),
								// 	pageAnchors, 
								// 	pageAnchors.length,
								// 	function(){
										//-- Retrieve Midterm grades and Attendance from RAIN
										$.ajax({
											type: 'GET',
											async: true,
											url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrd',
											error: function(e) {
												console.log(e);
											},
											success: function(P_FacMidGrd) {
												var html = $($.parseHTML(P_FacMidGrd));
												if(html.find('span.errortext').length) {
													//-- Something wrong on the Midterm grades page, so we disable 'Midterm' and 'Attendence' columns
													$('#tc_' + (index+1) + ' table.table .td_mid select').attr('disabled','');
													$('#tc_' + (index+1) + ' table.table .td_att input').attr('disabled','');
													$('#tc_' + (index+1) + ' table.table .td_mid').addClass('warning').attr('title','Temporally unavailable');
													$('#tc_' + (index+1) + ' table.table .td_att').addClass('warning').attr('title','Temporally unavailable');
												}									
												addClassesByCRN(container, CRNs, i-1);
											}
										});										
								// 	}
								// );																
							// }
						}
					});
				}
			});
		}
	});
}

function getFinalGrades(container, form, anchors, i, success) {
	console.log('i: ' + i);
	if(i<0 || (anchors.length && !i)) {
		return;
	}
	var pageIdx = 1;
	if(anchors.length) {
		pageIdx = anchors.eq(anchors.length - i).attr('href').match(/.*[(](\d+)[)]/)[1];
	}
	console.log('pi: ' + pageIdx);
	var term_in = form.find('input[name=term_in]').val().trim();
	var ptrm_in = form.find('input[name=ptrm_in]').val().trim();
	var crn_in = form.find('input[name=crn_in]').val().trim();
	var class_size = form.find('input[name=class_size]').val().trim();
	var formData = 'term_in=' + term_in + '&ptrm_in=' + ptrm_in + '&crn_in=' + crn_in + '&class_size=' + class_size + '&target_rec=' + pageIdx + '&grade_upd_ind=N&rowid_tab=&grde_tab=&attend_tab=&hrs_tab=&message_tab=&STUDENT_COUNT=1&MENU_NAME=bmenu.P_FacMainMnu';
	$.ajax({
		method: 'POST',
		// url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrdPost',
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacCommitFinGrd',
		contentType: 'application/x-www-form-urlencoded',
		data: formData,
		error: function(e) {
			console.log(e);
		},
		success: function(data) {
			$($.parseHTML(data)).find('table.dataentrytable tr:gt(0)').each(function(index) {
				var tr = $(this);
				var id = tr.find('td:eq(2)').text().trim();
				var grade = tr.find('td:eq(5)').text().trim();
				//console.log(tr);
			});
			getFinalGrades(container, form, anchors, i-1, success);
			success();		
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
					if(CRNs.length) {
						addClassesByCRN($('#accordion').empty(), CRNs, CRNs.length);
					}
					else {
						$('#accordion').empty();
					}
				}
			});
		}
	});
}

function termPrevNext(ev) {
	var term = document.getElementById('termSelect');
	var year = document.getElementById('termYear');
	var i = term.selectedIndex;
	switch(ev.currentTarget.id) {
		case 'nextTerm': 
			if(++i >= term.options.length) {
				year.value++;
			}
			break;
		case 'prevTerm': 
			if(--i < 0) {
				year.value--;
			}
			break;
	}
	term.options[(i + term.options.length) % term.options.length].selected = true;
	var termString =  '' + year.value + term.value;
	updateTerm(termString);
	chrome.storage.local.set({
		termString: termString,
		termSelect: term.value,
		termYear: year.value 
	});
}

$(document).ready(function(){
	//-- Identify Name and ID of the logged used
	$.get('https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacSelTerm', function(data){
		var page = $($.parseHTML(data));				
		var headers = page.find('div.staticheaders').html().split(/<br>/g);
		var facID = headers[0].trim().split(/\s+/g,1)[0];
		var facName = headers[0].trim().split(/\s+/g).slice(1).join(' ');
		$('#facName').text('Welcome, ' + facName);
	});	
	//-- Set term from local storage
	chrome.storage.local.get(['termSelect','termYear','termString'],function(items){
		$('#termSelect option[value="' + items.termSelect + '"]').prop('selected', true);
		$('#termYear').val(items.termYear);		
		updateTerm(items.termString);		
	});

	$('#termSelect').change(termChangeHandler);
	$('#termYear').change(termChangeHandler);
	$('#prevTerm').click(termPrevNext);
	$('#nextTerm').click(termPrevNext);
});

