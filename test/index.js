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

	t.end();
});
