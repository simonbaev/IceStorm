function pageHandler(pageIdx) {
	$('table.printTable tbody')
		.append(
			$('<a>')
			.attr({
				'href': '',
				'name': '#' + pageIdx
			})
		);
	//-- Retrieve and display multi-page content
	var form = $('form[name=grades]');
	var term_in = form.find('input[name=term_in]').val().trim();
	var ptrm_in = form.find('input[name=ptrm_in]').val().trim();
	var crn_in = form.find('input[name=crn_in]').val().trim();
	var class_size = form.find('input[name=class_size]').val().trim();
	var formData = 'term_in=' + term_in + '&ptrm_in=' + ptrm_in + '&crn_in=' + crn_in + '&class_size=' + class_size + '&target_rec=' + pageIdx + '&grade_upd_ind=N&rowid_tab=&grde_tab=&attend_tab=&hrs_tab=&message_tab=&STUDENT_COUNT=1&MENU_NAME=bmenu.P_FacMainMnu';
	$.ajax({
		method: 'POST',
		url: 'https://gsw.gabest.usg.edu/pls/B420/bwlkffgd.P_FacCommitFinGrd',
		contentType: 'application/x-www-form-urlencoded',
		data: formData,
		error: function(e) {
			console.log(e);
		},
		success: function(data) {
			var html = $($.parseHTML(data));
			var pageIndex = html.find('table.dataentrytable tr:eq(1) td:eq(0)').text().trim();
			html.find('table.dataentrytable tr:gt(0)').each(function(index) {
				var tr = $(this);
				var number = tr.find('td:eq(0)').text().trim();
				var name = tr.find('td:eq(1)').text().trim();
				var id = tr.find('td:eq(2)').text().trim();
				var grade = tr.find('td:eq(5)').text().trim();
				var email = tr.find('td:eq(10) a').attr('href').split(/:/)[1];
				$('table.printTable tbody a[name="#' + pageIndex + '"]')
				.before(
					$('<tr>')
					.append($('<td>').text(number))
					.append($('<td>').text(name))
					.append($('<td>').text(id))
					.append($('<td>').html('<b>' + grade + '</b>'))
					.append(
						$('<td>')
						.append(
							$('<a>')
							.attr('href', 'mailto:' + email)
							.text(email)
						)
					)
				);
			});
		}
	});
}
if($('div.printBody').length === 0)	{

	//-- Create printBody
	var printBody =
		$('<div>')
		.addClass('printBody')
		.append(
			$('<h1>')
			.text('Final Grades')
		)
		.append(
			$('<h2>')
			.addClass('title-left')
			.text($('table.datadisplaytable tr:eq(0) th:eq(0) a').text() + ' (CRN:' + $('form[name=grades]').find('input[name=crn_in]').val().trim() + ')')
		)
		.append(
			$('<h2>')
			.addClass('title-right')
			.text($('div.staticheaders').html().split(/<br>/g)[1].trim())
		)
		.append($('<hr>'))
		.append(
			$('<table>')
			.addClass('printTable')
		);
	//-- Add printBody into the dome
	$('div.pagetitlediv').after(printBody);

	//-- Fill invisible div.printBody with table header
	$('table.printTable')
	.empty()
	.append(
		$('<thead>')
		.append(
			$('<tr>')
			.append($('<th>').text('#').addClass('deheader'))
			.append($('<th>').text('Name').addClass('deheader'))
			.append($('<th>').text('GSW ID').addClass('deheader'))
			.append($('<th>').text('Grade').addClass('deheader'))
			.append($('<th>').text('E-Mail').addClass('deheader'))
		)
	)
	.append(
		$('<tbody>')
	);

	//-- Locate and process 'page' anchors, e.g. 1-25, 26-37, ...
	var pageAnchors = $('span.fieldlabeltext').nextAll('a');
	if (pageAnchors.length > 0) {
		pageAnchors.each(function(index) {
			var pageIdx = $(this).attr('href').match(/.*[(](\d+)[)]/)[1];
			pageHandler(pageIdx);
		});
	} 
	else {
		pageHandler(1);
	}

	//-- Add 'print' link
	$('span.pageheaderlinks').prepend(
		$('<a>')
		.addClass('submenulinktext2')
		.attr('href', '#')
		.html('<b>PRINT</b>')
		.click(function() {
			window.print();
			return false;
		})
	);
}
