'use strict';

var test = require('tape');

var toPatterns = require('../lib/patterns');

function asIs(name) {
	return name;
}

test('toPatterns', function (t) {
	t.deepEqual(toPatterns([], [], asIs), [], 'no files yield no patterns');

	t.deepEqual(
		toPatterns(['a', '.env'], ['a', '.env', 'index.js'], asIs),
		['/a', '/.env'],
		'top-level files yield anchored patterns'
	);

	t.deepEqual(
		toPatterns(['dir/a', 'dir/sub/b', 'other/c'], ['dir/a', 'dir/sub/b', 'other/c', 'other/d'], asIs),
		['/dir/', '/other/c'],
		'a directory collapses to one pattern only when every file in it is globally ignored'
	);

	t.deepEqual(
		toPatterns(['a*b', 'x/[y]'], ['a*b', 'axb', 'x/[y]', 'x/z'], asIs),
		['/a[*]b', '/x/[[]y]'],
		'glob characters are escaped, so a pattern matches no other file'
	);

	t.deepEqual(
		toPatterns(['Dir/a'], ['Dir/a', 'dir/b'], asIs),
		['/Dir/a'],
		'a directory does not collapse when one that differs only in case has a file that is not globally ignored'
	);

	t.deepEqual(
		toPatterns(['dir/a', 'b'], ['dir/a', 'b', 'c'], function (name) { return name.toUpperCase(); }),
		['/DIR/', '/B'],
		'patterns are written with the names that `spell` gives'
	);

	t.end();
});
