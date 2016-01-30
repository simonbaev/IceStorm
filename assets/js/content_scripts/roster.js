function printWorkaround() {
	//-- Create printBody
	var printBody =
	$('<div>')
	.addClass('printBody')
	.append(
		$('<h1>')
		.text('Class Roster')
	)
	.append(
		$('<h2>')
		.addClass('title-left')
		.text($('table.datadisplaytable:eq(0) tr:eq(0) th:eq(0) a').text() + ' (CRN:' + $('table.datadisplaytable:eq(0) tr:eq(1) td:eq(0) a').text().trim() + ')')
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

	//-- Fill invisible div.printBody with table header and row data
	$('table.printTable')
	.empty()
	.append(
		$('<thead>')
		.append(
			$('<tr>')
			.append($('<th>').text('#').addClass('deheader'))
			.append($('<th>').text('Name').addClass('deheader'))
			.append($('<th>').text('GSW ID').addClass('deheader'))
			.append($('<th>').text('E-Mail').addClass('deheader'))
		)
	)
	.append(
		$('<tbody>')
	);
	$('table.datadisplaytable:eq(2) tr:gt(0)').each(function() {
		var tr = $(this);
		$('table.printTable tbody')
		.append(
			$('<tr>')
			.append($('<td>').text(tr.find('td:eq(0)').text()))
			.append($('<td>').text(tr.find('td:eq(1)').text()))
			.append($('<td>').text(tr.find('td:eq(2)').text()))
			.append(
				$('<td>')
				.text(tr.find('td span.fieldmediumtext a').last().attr('href').split(/[:]/)[1])
			)
		);
	});

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

chrome.storage.local.get('optPrintWork', function(items) {
	if($('div.printBody').length === 0 && items.optPrintWork) {
		printWorkaround();
	}
});
