'use strict';

var test = require('tape');

var toPatterns = require('../lib/patterns');

test('toPatterns', function (t) {
	t.deepEqual(toPatterns([], []), [], 'no files yield no patterns');

	t.deepEqual(
		toPatterns(['a', '.env'], ['a', '.env', 'index.js']),
		['/a', '/.env'],
		'top-level files yield anchored patterns'
	);

	t.deepEqual(
		toPatterns(['dir/a', 'dir/sub/b', 'other/c'], ['dir/a', 'dir/sub/b', 'other/c', 'other/d']),
		['/dir/', '/other/c'],
		'a directory collapses to one pattern only when every file in it is globally ignored'
	);

	t.deepEqual(
		toPatterns(['a*b', 'x/[y]'], ['a*b', 'axb', 'x/[y]', 'x/z']),
		['/a[*]b', '/x/[[]y]'],
		'glob characters are escaped, so a pattern matches no other file'
	);

	t.deepEqual(
		toPatterns(['Dir/a'], ['Dir/a', 'dir/b']),
		['/Dir/a'],
		'a directory does not collapse when one that differs only in case has a file that is not globally ignored'
	);

	t.end();
});
