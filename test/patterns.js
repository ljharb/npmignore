'use strict';

var test = require('tape');

var minimizeGlobPatterns = require('../lib/patterns');

test('minimizeGlobPatterns', function (t) {
	t.deepEqual(minimizeGlobPatterns([]), [], 'no files yield no patterns');

	t.deepEqual(minimizeGlobPatterns(['a', '.env']), ['a', '.env'], 'top-level files are kept as-is');

	t.deepEqual(
		minimizeGlobPatterns(['dir/a', 'dir/sub/b', 'other/c']),
		['dir/', 'other/'],
		'files in directories collapse to their top-level directory, once each'
	);

	t.deepEqual(
		minimizeGlobPatterns(['top', 'dir/a', 'later']),
		['dir/', 'top', 'later'],
		'directories come before top-level files'
	);

	t.end();
});
