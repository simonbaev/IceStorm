/*jshint esnext: true */
function ajaxErrorHandler(e) {
	console.log(e);
}

function gradeChangeHandler(ev) {
	var target = $(ev.target);
	var td = target.parents('td');
	var isAtt = (ev.target.nodeName === 'INPUT');
	var type = isAtt ? 'mid' : target.attr('data-gType');
	var value = isAtt ? ev.target.checked : target.find('option:selected').text();
	var crn = target.parents('div.collapse').data('crn');
	var id = target.parents('tr').find('td.td_id').text();
	var No = target.parents('tr').find('td.td_N').text();
	var page = target.parents('tr').data('pageIdx');
	var map = $(window).data('gMap');
	if(!(crn in map)) {
		map[crn] = {};
	}
	if(!(type in map[crn])) {
		map[crn][type] = {};		
	}
	if(!(page in map[crn][type])) {
		map[crn][type][page] = {};
	}
	if(!(No in map[crn][type][page])) {
		map[crn][type][page][No] = {};
	}
	if(type === 'mid') {
		map[crn][type][page][No][isAtt ? 'att' : 'grade'] = value;		
	}
	else {
		map[crn][type][page][No].grade = value;
		if(value === 'F') {
			var cbOK = function() {
				return function() {
					map[crn][type][page][No].last = $('input.datepicker').val();
				};
			};
			var cbCancel = function() {
				return function() {
					var pGrade = target.parents('td').removeClass('bg-info').attr('data-grade');
					target.find('option[value=' + pGrade + ']').prop('selected',true);
				};
			};
			bootbox.dialog({
				message: function(){
					var container = 
					$('<div>')
					.append(
						$('<input>')
						.addClass('datepicker form-control')
						.attr({
							'placeholder' : 'Specify last date of attendance',
							'data-provide': 'datepicker',
							'data-date-autoclose': 'true',
							'data-date-format': 'mm/dd/yyyy',
							'data-date-todayHighlight': 'true',
							'data-date-weekStart': 1
						})
						.on('changeDate',function(){
							$(this).parents('.modal-content').find('button[data-bb-handler=OK]').removeAttr('disabled');
						})
					);
					return container.get(0);
				},
				title: "Request for additional data",				
				closeButton: true,
				onEscape: true,
				size: 'small',
				animate: false,
				buttons: {
					Cancel: {
						label: 'Cancel',
						callback: cbCancel()
					},
					OK: {
						diabled: true,
						label: 'OK',
						callback: cbOK()
					}
				}
			});
			$('.modal-content').find('button[data-bb-handler=OK]').attr('disabled','');
		}
	}
	td.addClass('bg-info');
	$(window).data('gMap',map);
	target.parents('div.collapse').find('div.btn-group button').removeAttr('disabled');
}

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
					.html('<span><strong>' + courseNumbers.slice(0,2).join(' ') + '<small>&nbsp;(' + courseNumbers[2] + ')</small></strong>:&nbsp' + courseTitle + '</span><small><span class="pull-right"></span></small>')
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
											$(this).prop('checked',state).trigger('change');
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
				//-- Modififcation: submit/clear
				.append(
					$('<div>')
					.addClass('btn-group pull-right')
					.append(
						$('<button>')
						.attr({
							'type':'button',
							'data-toggle':'dropdown',
							'aria-haspopup':'true',
							'aria-expanded':'false',
							'disabled':''
							
						})
						.addClass('btn btn-primary dropdown-toggle')
						.html('Modifications <span class="caret"></span>')
					)
					.append(
						$('<ul>')
						.addClass('dropdown-menu')
						.append(
							$('<li>')
							.append(
								$('<a>')
								.attr('href','#')
								.text('Submit')
								.click(function(){
									var map = $(window).data('gMap');
									var crn = $(this).parents('.collapse').data('crn');
									var changes = map[crn];
									var container = $(this).parents('.collapse');
									var URLs = {
										mid: {
											L1: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrd',
											L2: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrdPost'
										},
										fin: {
											L1: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacFinGrd',
											L2: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacCommitFinGrd'
										}
									};
									var pageProcessor = function(level, data, URL, pages, type, i) {										
										if(i < 1) {
											updateGrades(level-1);
											return;
										}
										var pageArray = Object.keys(pages);
										var pageIndex = pageArray.length - i;
										var pageKey = pageArray[pageIndex];
										var html = $($.parseHTML(data));
										var formData = html.find('form[name=grades]').serialize().replace(/target_rec=\d+&/,'target_rec=' + pageKey + '&');
										var processL2Response = function(URL, pages, pageKey, i) {
											return function(L2data) {
												var formData = $($.parseHTML(L2data)).find('form[name=grades]').serialize();
												var postL2 = function(URL, pages, i) {
													return function(data) {
														console.log('OK');
														pageProcessor(level, data, URL, pages, type, i-1);	
													};
												};
												//-- Extract components of 'formData' and update them with respect to 'page'
												if(type === 'mid') {
													//-- Attendence
													var hrs_tab = formData.match(/hrs_tab=\d+/g).map(function(old, index){
														if(this[index+parseInt(pageKey)] && (typeof this[index+parseInt(pageKey)].att == "boolean")) {
															return 'hrs_tab=' + (this[index+parseInt(pageKey)].att ? 1 : 0);
														}
														return old;
													}, pages[pageKey]);
													formData = formData.split(/hrs_tab=(?:\d+)*/).map(
														function(old, index){
															return (index < this.length) ? (old + this[index]) : 	old;
														},
														hrs_tab
													).join('');
													//-- Midterm grade
													var mgrde_tab = formData.match(/mgrde_tab=[A-Z]/g).map(function(old, index){
														if(this[index+parseInt(pageKey)] && (typeof this[index+parseInt(pageKey)].grade == "string")) {
															return 'mgrde_tab=' + this[index+parseInt(pageKey)].grade;
														}
														return old;
													}, pages[pageKey]);
													formData = formData.split(/mgrde_tab=(?:[A-Z]+)*/).map(
														function(old, index){
															return (index < this.length) ? (old + this[index]) : 	old;
														},
														mgrde_tab
													).join('');
												}
												else if(type === 'fin') {
													//-- Final grade
													var grde_tab = formData.match(/grde_tab=[A-Z]/g).map(function(old, index){
														if(this[index+parseInt(pageKey)] && (typeof this[index+parseInt(pageKey)].grade == "string")) {
															return 'grde_tab=' + this[index+parseInt(pageKey)].grade;
														}
														return old;
													}, pages[pageKey]);
													formData = formData.split(/grde_tab=(?:[A-Z]+)*/).map(
														function(old, index){
															return (index < this.length) ? (old + this[index]) : 	old;
														},
														grde_tab
													).join('');	
													//-- Last day in case of final grade of 'F'
													var attend_tab = formData.match(/attend_tab=(\d\d%2F\d\d%2F\d\d\d\d)*/g).map(function(old, index){
														if(this[index+parseInt(pageKey)] && (typeof this[index+parseInt(pageKey)].last == "string")) {
															return 'attend_tab=' + encodeURIComponent(this[index+parseInt(pageKey)].last);
														}
														return old;
													}, pages[pageKey]);
													
													formData = formData.split(/attend_tab=(?:\d\d%2F\d\d%2F\d\d\d\d)*/).map(
														function(old, index){
															return (index < this.length) ? (old + this[index]) : 	old;
														},
														attend_tab
													).join('');
												}
												//-- POST updated data
												$.ajax({
													type: 'POST',
													async: true,
													url: URL,
													data: formData,
													error: ajaxErrorHandler,
													success: postL2(URL, pages, i)
												});												
											};
										};
										if(pageArray.length === 1 && pageKey === '1') {
											(processL2Response(URL, pages, pageKey, i))(data);
										}
										else {
											$.ajax({
												type: 'POST',
												async: true,
												url: URL,
												data: formData,
												error: ajaxErrorHandler,
												success: processL2Response(URL, pages, pageKey, i)
											});
										}
									};								
									var updateGrades = function(i) {
										if(i < 1) {
											container.find('div.btn-group ul li:eq(1) a').trigger('click');
											return false;
										}
										var types = Object.keys(URLs);
										var index = types.length - i;
										var type = types[index];
										if(type in changes) {
											$.ajax({
												type: 'GET',
												async: true,
												url: URLs[type].L1,
												error: ajaxErrorHandler,
												success: processL1Response(i, URLs[type].L2, changes[type], type) 
											});													
										}
										else {
											updateGrades(i-1);
										}
									};
									var processL1Response = function(level, URL, pages, type) {
										return function(L1data) {
											pageProcessor(level, L1data, URL, pages, type, Object.keys(pages).length);
										};
									};
									var setCRN = function()  {
										return function() {
											console.log(map[crn]);
											updateGrades(Object.keys(URLs).length);
										};
									};
										
									if(!(crn in map)) {
										return false;
									}
									if(!Object.keys(map[crn]).length) {
										return false;	
									}
									$.ajax({
										type: 'POST',
										async: true,
										url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacStoreCRN',
										contentType: 'application/x-www-form-urlencoded',
										data: 'name1=bmenu.P_FacMainMnu&calling_proc_name=P_FACCRNSEL&crn=' + crn,							
										error: ajaxErrorHandler,
										success: setCRN()
									});									
								})
							)
						)
						.append(
							$('<li>')
							.append(
								$('<a>')
								.attr('href','#')
								.text('Clear')
								.click(function(){
									var map = $(window).data('gMap');
									var container = $(this).parents('.collapse');
									var crn = container.data('crn');
									if(!(crn in map)) {
										return false;
									}
									//-- remove submitted changesfrom the map
									delete map[crn];
									$(window).data('gMap',map);
									//-- re-disable "Modifications" button
									$(this).parents('div.btn-group').find('button').attr('disabled','');
									//-- restore data from original RAIN tables
									$(this).parents('div.btn-group').find('button').attr('disabled','');
									$(this).parents('.collapse').find('table.table tbody td.bg-info').removeClass('bg-info');
									getGrades(container);
								})
							)
						)
					)
				)
				//-- E-Mail to class
				.append(
					$('<a>')
					.addClass('btn btn-success pull-right')
					.attr({
						'role':'button',
						'href': '#'
					})
					.click(function(){
						var addressList = "";
						var termString = $('#termSelect option:selected').text() + ' ' + $('#termYear').val();
						$(this).parent().find('table.table tbody tr').each(function(){
							addressList += $(this).find('td.td_email a').attr('data-email') + ';';
						});
						chrome.tabs.create({
							url: 'mailto:?bcc=' + addressList + '&subject=' + courseNumbers.slice(0,2).join(' ') + ':%20'
						});
					})
					.text('E-Mail to class')
				)
				//-- Export to CSV
				.append(
					$('<a>')
					.addClass('btn btn-info pull-right')
					.attr({
						'role':'button',
						'href': '#'
					})
					.click(function(){
						var term = $('#termSelect option:selected').text() + ' ' + $('#termYear').val();
						var crn = $(this).parents('.collapse').data('crn');
						var course = $(this).parents('.collapse').data('course');
						var fileName = (course + ' (CRN:' + crn + ') ' + '[' + term + '].csv').replace(/ /g,'_');
						var th = $(this).siblings('table.table').find('thead tr:eq(0) th');
						var tr = $(this).siblings('table.table').find('tbody tr');
						var csvData = '';
						th.each(function(thIndex){
							csvData += '"' + $(this).text() + ((thIndex < (th.length-1)) ? '",' : '"\n'); 
						});	
						tr.each(function(trIndex){
							var td = $(this).find('td');
							attStatus = td.find('input').prop('disabled');
							attValue = td.eq(3).find('input').prop('checked') ? 1 : 0;
							csvData += td.eq(0).text() + ',';
							csvData += '"' + td.eq(1).text().trim() + '",';
							csvData += td.eq(2).text() + ',';
							csvData += (attStatus ? 'N/A' : attValue) + ',';
							csvData += td.eq(4).attr('data-grade') + ',';
							csvData += td.eq(5).attr('data-grade') + ',';
							csvData += td.eq(6).text() + '\n';
						});
						$(this)
						.attr({
							'href': 'data:application/csv;charset=UTF-8,' + encodeURIComponent(csvData),
							'download': fileName
						});
					})
					.text('Export to CSV')
				)
				//-- Print
				.append(
					$('<a>')
					.addClass('btn btn-warning pull-right')
					.attr({
						'role':'button',
						'href': '#'
					})
					.click(function(){
						//-- retrieve some data
						var term = $('#termSelect option:selected').text() + ' ' + $('#termYear').val();
						var crn = $(this).parents('.collapse').data('crn');
						var course = $(this).parents('.collapse').data('course');
						var title = $(this).parents('.collapse').data('title');
						var table = $(this).siblings('table.table');
						//-- fill in print area
						$('div.printContainer .row .pull-left').text(course + ': ' + title + ' (CRN:' + crn + ')');
						$('div.printContainer .row .pull-right').text(term);
						var container = 
						$('div.printContainer .page-content')
						.empty()
						.append(
							table
							.clone()
							.removeClass('table-bordered')
							.attr('id','printTable')
							.find('thead tr th:eq(3)').empty().text('Att.')
							.end()
							.find('tbody tr').each(function(trIndex){
								var tr = $(this);
								tr.find('td').each(function(tdIndex){
									switch (tdIndex) {
										case 3: 
											var att = $(this).find('input').prop('checked');
											if($(this).find('input').prop('disabled')) {
												$(this).empty().text('N/A');
											}
											else {
												$(this).empty().append($(att ? '<span>&#10004;</span>' : '<span>&#10008;</span>'));
											}
											break;
										case 4:
										case 5:
											var grade = $(this).attr('data-grade');
											$(this).empty().text(grade);
											break;
										case 6:
											var email = $(this).find('a').attr('data-email');
											$(this).empty().text(email);
									}
								});
							})
							.end()
						);
						//-- toggle print area
						$('div.printContainer > div').toggleClass('printExclusion');
						//-- engage print dialog
						window.print();
						//-- toggle print area
						$('div.printContainer > div').toggleClass('printExclusion');
					})
					.text('Print')
				)				
			)
			.data('crn',crnValue)
			.data('title',courseTitle)
			.data('course',courseNumbers.slice(0,2).join(' '))
			.on('show.bs.collapse',function(){
				var container = $(this);
				var crnValue = container.data('crn');
				if(!container.find('table.table tbody tr').length) {
					getClassList(container);
				}
			})			
		)		
	);
	//-- Jump to next class
	addClassesByCRN(container, CRNs, i-1);	
}

function getClassList(container){
	var crnValue = container.data('crn');
	var courseName = container.data('course');
	container.parent().find('.panel-heading .panel-title a span:eq(1)').text('class roster...');
	$.ajax({
		type: 'POST',
		async: true,
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacStoreCRN',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&calling_proc_name=P_FACCRNSEL&crn=' + crnValue,							
		error: ajaxErrorHandler,
		success: function() {
			$.ajax({
				type: 'GET',
				async: true,
				url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfcwl.P_FacClaListSum',
				error: ajaxErrorHandler,
				success: function(data) {
					var html = $($.parseHTML(data));
					var rows = html.find('table.datadisplaytable:eq(2) tr:gt(0)');
					if(!rows.length) {
						container
						.find('table.table tbody')
						.append(
							$('<tr>')
							.append(
								$('<td>')
								.attr('colspan',7)
								.addClass('noData')
								.text('No records found')
							)
						);
						container.parent().find('.panel-heading .panel-title a span:eq(1)').text('').addClass('glyphicon glyphicon-ok');	
					}
					else {
						rows.each(function() {
							var tr = $(this);
							var email = tr.find('td span.fieldmediumtext a').last().attr('href').split(/[:]/)[1];
							var name = tr.find('td:eq(1)').text();
							var id = tr.find('td:eq(2)').text();
							var lname = name.split(/,/)[0].trim();
							var fname = name.split(/,/)[1].trim().split(/\s/,1)[0].trim();
							var wd = /WD/.test(tr.find('td:eq(3)').text());
							container.find('table.table tbody')
							.append(
								$('<tr>')
								.addClass(wd ? 'bg-danger' : '')
								.attr({
									'title': wd ? tr.find('td:eq(3)').text().trim() : '',
									'data-id': id
								})
								.append($('<td>').text(tr.find('td:eq(0)').text()).addClass('td_N'))
								.append($('<td>').text(name).addClass('td_name'))
								.append($('<td>').text(id).addClass('td_id'))
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
											.change(gradeChangeHandler)
										)
										.click(function(){
											$(this).find('input[type="checkbox"]').each(function(){ 
												if(!this.disabled) {
													this.checked = !this.checked; 
													$(this).trigger('change');
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
										.append($('<option>').val('P').text('P'))									
										.append($('<option>').val('S').text('S'))									
										.append($('<option>').val('U').text('U'))
										.append($('<option>').val('W').text('W'))
										.attr('data-gtype','mid')
										.change(gradeChangeHandler)
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
										.append($('<option>').val('P').text('P'))									
										.append($('<option>').val('S').text('S'))									
										.append($('<option>').val('U').text('U'))
										.append($('<option>').val('W').text('W'))
										.attr('data-gtype','fin')
										.change(gradeChangeHandler)
									)
								)
								.append(
									$('<td>')
									.addClass('td_email')
									.append(
										$('<a>')
										.attr({
											'href': 	'mailto:' + fname + '%20' + lname + '%20' + '%3c' + email + '%3e' + '?subject=' + courseName + ':%20',
											'data-email': email,
											'target': '_blank'
										})
										.text(email)
									)
								)
							);
						});						
						getGrades(container);
					}
				}
			});
		}
	});
}

function getGrades(container) {
	var statusHolder = container.parent().find('.panel-heading .panel-title a span:eq(1)');	
	var crn = container.data('crn');
	var URLs = {
		mid: {
			L1: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrd',
			L2: 'https://gsw.gabest.usg.edu/pls/B420/bwlkfmgd.P_FacMidGrdPost'
		},
		fin: {
			L1: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacFinGrd',
			L2: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacCommitFinGrd'
		}
	};
	var processL2Response = function(level, URL, type, pageAnchors, i) {
		return function(L2data) {
			var html = $($.parseHTML(L2data));	
			var index = pageAnchors.length - i;
			var page = (index < 0) ? 1 : parseInt(pageAnchors.eq(index).attr('href').match(/.*[(](\d+)[)]/)[1]);
			var rows = html.find('table.dataentrytable tr:gt(0)');
			rows.each(function(trIndex) {
				var tr = $(this);
				var id = tr.find('td:eq(2)').text().trim();
				var grade;
				switch (type) {
					case 'mid':
						if(id.length !== 9) {
							return true;
						}
						var att = tr.find('td:eq(7) input').val();
						grade = tr.find('td:eq(5) select option:selected').text().trim();
						container
						.find('table.table tbody tr[data-id="' + id + '"]')
							.data('pageIdx', page)
							.find('td.td_mid')
								.attr('data-grade',grade)
								.find('select option[value="' + grade + '"]')
									.prop('selected', true)
								.end()
							.end()
							.find('td.td_att input[type="checkbox"]')
								.prop('checked', (att > 0))
							.end()
						.end();
						break;		
					case 'fin':
						var tooOld = (tr.find('td:eq(5) select').length === 0);
						grade = 
							tooOld ?
							tr.find('td:eq(5)').text().trim() :
							tr.find('td:eq(5) select option:selected').text().trim();
						container
						.find('table.table tbody tr[data-id="' + id + '"] td.td_fin')
							.attr('data-grade',grade)
							.find('select option[value="' + grade + '"]')
								.prop('selected', true)
								.parent()
								.attr(tooOld ? 'disabled' : '','')
							.end()
						.end();
						break;
				}				
			});	
			pageProcessor(level, L2data, URL, type, pageAnchors, i-1);
		};
	};
	var pageProcessor = function(level, data, URL, type, pageAnchors, i) {										
		if(i < 1) {
			gradeProcessor(level-1);
			return;
		}
		if(i === pageAnchors.length) {
			(processL2Response(level, URL, type, pageAnchors, i))(data);
		}
		else {
			var html = $($.parseHTML(data));	
			var index = pageAnchors.length - i;
			var page = parseInt(pageAnchors.eq(index).attr('href').match(/.*[(](\d+)[)]/)[1]);
			var formData = html.find('form[name=grades]').serialize().replace(/target_rec=\d+&/,'target_rec=' + page + '&');
			$.ajax({
				type: 'POST',
				async: true,
				url: URL,
				data: formData,
				error: ajaxErrorHandler,
				success: processL2Response(level, URL, type, pageAnchors, i)
			});
		}	
	};
	var processL1Response = function(level, URL, type) {
		return function(L1data) {
			var html = $($.parseHTML(L1data));
			if(html.find('span.errortext').length) {
				if(type === 'mid') {
					container
					.find('table.table')
					.find('.td_mid')
						.addClass('warning')
						.attr({
							'title': 'Temporally unavailable',
							'data-grade': 'N/A'
						})
						.find('select')
							.attr('disabled','')
						.end()
					.end()
					.find('.td_att')
						.addClass('warning')
						.attr({
							'title': 'Temporally unavailable',
						})
						.find('input')
							.attr('disabled','')
						.end()
					.end();
				}
				else if(type === 'fin') {
					container
					.find('table.table')
					.find('.td_fin')
						.addClass('warning')
						.attr({
							'title': 'Temporally unavailable',
							'data-grade': 'N/A'
						})
						.find('select')
							.attr('disabled','')
						.end()
					.end();	
				}
				processGrades(level-1);
			}
			else {
				var pageAnchors = 
				(type === 'fin') ?
				html.find('span.fieldlabeltext').nextAll('a'):
				html.find('table.dataentrytable tr td input[name="MENU_NAME"]').nextAll('a');
				if(pageAnchors.length === 0) {
					(processL2Response(level, URL, type, pageAnchors, 1))(L1data);
				}
				else {
					pageProcessor(level, L1data, URL, type, pageAnchors, pageAnchors.length);
				}
			}	
		};
	};
	var gradeProcessor = function(level) {
		if(level < 1) {
			statusHolder.text('').addClass('glyphicon glyphicon-ok');
			return;
		}
		var types = Object.keys(URLs);
		var index = types.length - level;
		var type = types[index];
		switch (type) {
			case 'mid':
				statusHolder.text('midterm grades and attendance');
				break;
			case 'fin':
				statusHolder.text('final grades');
				break;
		}
		$.ajax({
			type: 'GET',
			async: true,
			url: URLs[type].L1,
			error: ajaxErrorHandler,
			success: processL1Response(level, URLs[type].L2, type) 
		});													
	};
	var setCRN = function()  {
		return function() {
			gradeProcessor(Object.keys(URLs).length);
		};
	};
	$.ajax({
		type: 'POST',
		async: true,
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacStoreCRN',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&calling_proc_name=P_FACCRNSEL&crn=' + crn,							
		error: ajaxErrorHandler,
		success: setCRN()
	});
}

function updateTerm(termString) {
	$.post({
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkostm.P_FacStoreTerm',
		contentType: 'application/x-www-form-urlencoded',
		data: 'name1=bmenu.P_FacMainMnu&term=' + termString,
		error: ajaxErrorHandler,
		success: function() {
			$.get({
				url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkocrn.P_FacCrnSel',
				error: ajaxErrorHandler,
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
	
	$(window).data('gMap',{});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message.type === 'confirmReLogin') {
		if($(window).data('noMorePrompts') !== true) {
			bootbox.confirm({
				animate: false,
				message: message.text,
				callback: function(result) {
					if (result) {
						sendResponse(false);
						chrome.tabs.getCurrent(function(tab) {
						   chrome.tabs.remove(tab.id, function() { });
						});					
					} 
					else {
						$(window).data('noMorePrompts',true);
						$('#facName').html($('#facName').html() + '&nbsp;<small class="text-danger">(session disconnected)</small>');
						sendResponse(true);
					}
				}
			});
		}
		return true;
	}
});

