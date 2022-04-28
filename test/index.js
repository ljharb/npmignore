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
		npmignore('', gitignore, { ignore: 'a\nb\ntmp' }).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN + preamble + 'a\nb\ntmp',
		'empty npmignore content, ignore option, yields expected gitignore'
	);

	t.equal(
		npmignore(gitignore + preamble + 'a\nb\ntmp', gitignore, { ignore: 'a\nb' }).replace(gitignore, function () { return gitignoreTOKEN; }),
		gitignoreTOKEN + preamble + 'a\nb',
		'initial npmignore content, ignore option that should cause a removal, yields expected gitignore'
	);

	t.end();
});
