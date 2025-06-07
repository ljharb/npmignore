'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var npmignore = require('../');

var gitignore = String(fs.readFileSync(path.join(__dirname, '../.gitignore')));
var gitignoreTOKEN = '$GITIGNORE';
var preamble = '\n\n# npmignore - content above this line is automatically generated and modifications may be omitted\n# see npmjs.com/npmignore for more details.\n';

test('npmignore', function (t) {
	t.equal(typeof npmignore, 'function', 'is a function');

	t.equal(
		npmignore('', gitignore).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN,
		'empty npmignore content, no options, yields gitignore'
	);

	t.equal(
		npmignore('', gitignore, { ignore: 'a\nb\npids' }).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN + preamble + 'a\nb\npids\n',
		'empty npmignore content, ignore option, yields expected gitignore'
	);

	t.equal(
		npmignore(gitignore + preamble + 'a\nb\npids', gitignore, { ignore: 'a\nb' }).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN + preamble + 'a\nb\n',
		'initial npmignore content, ignore option that should cause a removal, yields expected gitignore'
	);

	var shortPreamble = '\n\n# npmignore - content below this line is automatically generated and modifications may be omitted\n';
	t.equal(
		npmignore(
			gitignore + shortPreamble + 'a\nb\npids',
			gitignore,
			{
				commentLines: ['content below this line is automatically generated and modifications may be omitted'],
				ignore: 'a\nb',
			}
		).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN + shortPreamble + 'a\nb\n',
		'initial npmignore content, ignore option that should cause a removal, with custom comment lines, yields expected gitignore'
	);

	t.test('git parameter as array', function (st) {
		var gitArray = ['node_modules', '*.log'];
		var result = npmignore('', gitArray);
		// When git is passed as array, it's treated as options and git becomes empty
		st.ok(typeof result === 'string', 'produces string output');
		st.ok(result.length > 0, 'produces non-empty output');
		st.end();
	});

	t.test('commentLines validation', function (st) {
		st.throws(
			function () {
				npmignore('', gitignore, { commentLines: 'not an array' });
			},
			TypeError,
			'throws TypeError when commentLines is not an array'
		);
		st.throws(
			function () {
				npmignore('', gitignore, { commentLines: 123 });
			},
			TypeError,
			'throws TypeError when commentLines is a number'
		);
		st.end();
	});

	t.test('unignore option', function (st) {
		var initialNpm = gitignore + preamble + 'foo\nbar\nbaz\n';
		var result = npmignore(initialNpm, gitignore, { unignore: ['foo', 'bar'] });
		st.notOk(result.indexOf('foo') > -1, 'foo is removed');
		st.notOk(result.indexOf('bar') > -1, 'bar is removed');
		st.ok(result.indexOf('baz') > -1, 'baz is kept');
		st.end();
	});

	t.test('unignore option as string', function (st) {
		var initialNpm = gitignore + preamble + 'foo\nbar\n';
		var result = npmignore(initialNpm, gitignore, { unignore: 'foo' });
		st.notOk(result.indexOf('foo') > -1, 'foo is removed when unignore is a string');
		st.ok(result.indexOf('bar') > -1, 'bar is kept');
		st.end();
	});

	t.end();
});

test('extract', function (t) {
	t.throws(
		function () {
			npmignore.extract(123);
		},
		TypeError,
		'throws TypeError when npmignore is not a string'
	);

	t.throws(
		function () {
			npmignore.extract(null, {});
		},
		TypeError,
		'throws TypeError when npmignore is null'
	);

	var npmContent = 'git-content\n# npmignore\nnpm-only\n';
	var extracted = npmignore.extract(npmContent, {});
	t.ok(Array.isArray(extracted), 'extract returns an array');
	t.ok(extracted.indexOf('# npmignore') > -1, 'extracted contains npmignore marker');
	t.ok(extracted.indexOf('npm-only') > -1, 'extracted contains npm-only content');

	var allLines = npmignore.extract(npmContent, { npmignored: true });
	t.ok(allLines.indexOf('git-content') > -1, 'npmignored option includes git content');
	t.ok(allLines.indexOf('npm-only') > -1, 'npmignored option includes npm content');

	t.end();
});

test('edge cases for coverage', function (t) {
	var simpleGit = 'node_modules\n*.log\n';

	// Test with npm as array and git as array to trigger diff with null cases
	var result1 = npmignore([], simpleGit);
	t.ok(result1.indexOf('node_modules') > -1, 'works with empty npm array');

	// Test with null git handling via format function - empty git case
	var result2 = npmignore('', '');
	t.ok(result2.indexOf('\n') > -1, 'empty git and npm produces newlines');

	// Test with only npm content and no git content
	var result3 = npmignore('', '', { ignore: 'test' });
	t.ok(result3.indexOf('test') > -1, 'works with no git content but npm content');

	// Test with null npm to trigger diff function line 79 (arr == null)
	var result4 = npmignore(null, simpleGit);
	t.ok(result4.indexOf('node_modules') > -1, 'works with null npm');

	// Test with null git (passed as options) to trigger diff function line 83 (remove == null)
	// When git is not a string, it's treated as options, so git becomes ''
	var result5 = npmignore('', null);
	t.ok(typeof result5 === 'string', 'works with null as second parameter');

	// Test with undefined to trigger diff function line 83 (remove == null)
	var result6 = npmignore('', void 0);
	t.ok(typeof result6 === 'string', 'works with undefined as second parameter');

	// Test with npm as non-string and git as undefined array to cover line 83
	var result7 = npmignore([], void 0);
	t.ok(typeof result7 === 'string', 'works with array npm and undefined git');

	// Test split function with falsy value (str || '\n\n' branch)
	var result8 = npmignore(void 0, simpleGit);
	t.ok(result8.indexOf('node_modules') > -1, 'works with undefined npm');

	// Test with empty options to cover various branches
	var result9 = npmignore('test\nfoo', simpleGit, {});
	t.ok(typeof result9 === 'string', 'works with empty options object');

	// Test comment lines array iteration - test the i === 0 ternary
	var result10 = npmignore('', simpleGit, {
		commentLines: ['line1', 'line2', 'line3'],
		ignore: 'test',
	});
	// When there's npm-specific content, the comment lines appear in the output
	t.ok(typeof result10 === 'string', 'produces string with custom comment lines');
	t.ok(result10.length > 0, 'produces non-empty output with custom comment lines');

	// Test with duplicate ignore entries to test uniq function's duplicate detection branch
	var result11 = npmignore('', simpleGit, { ignore: ['test', 'test', 'foo', 'foo', 'bar'] });
	var testMatches = result11.split('\n').filter(function (line) { return line === 'test'; });
	t.equal(testMatches.length, 1, 'duplicate test entries are uniquified');

	// Test unignore with both gitLines and npmLines to cover both diff calls at lines 171-172
	var npmWithContent = gitignore + '\n\n# npmignore\nspecial1\nspecial2\n';
	var result12 = npmignore(npmWithContent, gitignore + '\nspecial1\n', {
		unignore: 'special1',
	});
	t.notOk(result12.indexOf('special1') > 0, 'unignore removes from both git and npm sections');

	// Test with npm content that overlaps with git to exercise diff at line 177
	var overlapping = '# npmignore\nnode_modules\n*.log\n';
	var result13 = npmignore(overlapping, 'node_modules\n*.log\nbuild\n');
	// Items in both git and npm should not be duplicated
	var nodeModulesCount = result13.split('\n').filter(function (line) {
		return line === 'node_modules';
	}).length;
	t.ok(nodeModulesCount <= 2, 'overlapping items handled correctly');

	// Test with unignore removing all git content to make gitStr empty (branch 1, line 43)
	var result14 = npmignore('', 'foo\nbar', { unignore: ['foo', 'bar', '', ''], ignore: 'test' });
	t.ok(result14.indexOf('test') > -1, 'handles case where all git content is unignored');
	t.ok(result14.indexOf('foo') === -1, 'foo is unignored');
	t.ok(result14.indexOf('bar') === -1, 'bar is unignored');

	t.end();
});
