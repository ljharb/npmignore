'use strict';

var test = require('tape');
var fs = require('fs');
var os = require('os');
var path = require('path');
var execFile = require('child_process').execFile;

var npmignoreAuto = require('../auto');

// fixture repos must not use, nor change, a git repository that runs these tests (eg, from a hook)
Object.keys(process.env).forEach(function (key) {
	if ((/^GIT_/).test(key)) {
		delete process.env[key];
	}
});

var commentPreamble = '\n\n# npmignore - content above this line is automatically generated and modifications may be omitted\n# see npmjs.com/npmignore for more details.\n';

var counter = 0;
function createTempDir() {
	counter += 1;
	var dir = path.join(fs.realpathSync(os.tmpdir()), 'npmignore-auto-test-' + process.pid + '-' + Date.now() + '-' + counter);
	fs.mkdirSync(dir);
	return dir;
}

function cleanup(dir) {
	var files = fs.readdirSync(dir);
	for (var i = 0; i < files.length; i++) {
		var filePath = path.join(dir, files[i]);
		if (fs.lstatSync(filePath).isDirectory()) {
			cleanup(filePath);
		} else {
			fs.unlinkSync(filePath);
		}
	}
	fs.rmdirSync(dir);
}

function write(dir, file, content) {
	fs.writeFileSync(path.join(dir, file), typeof content === 'string' ? content : JSON.stringify(content));
}

// creates a git repo whose global excludes file is `globalIgnore`, isolated from the user's own
function createRepo(t, globalIgnore, cb) {
	var root = createTempDir();
	t.teardown(function () {
		cleanup(root);
	});
	var repo = path.join(root, 'repo');
	fs.mkdirSync(repo);
	var excludesFile = path.join(root, 'global-gitignore');
	fs.writeFileSync(excludesFile, globalIgnore || '');

	execFile('git', ['init', '-q', '.'], { cwd: repo }, function (err) {
		t.error(err, 'git init succeeds');
		execFile('git', ['config', 'core.excludesFile', excludesFile], { cwd: repo }, function (err2) {
			t.error(err2, 'fixture repo excludesFile configured');
			cb(repo);
		});
	});
}

test('npmignoreAuto: argument validation', function (t) {
	t.equal(typeof npmignoreAuto, 'function', 'is a function');

	t.throws(function () { npmignoreAuto(); }, TypeError, 'throws without a callback');
	t.throws(function () { npmignoreAuto({}); }, TypeError, 'throws with a non-function callback');

	var noop = function () {};
	t.throws(function () { npmignoreAuto('foo', noop); }, TypeError, 'throws with non-object options');
	t.throws(function () { npmignoreAuto({ cwd: 1 }, noop); }, TypeError, 'throws with non-string `cwd`');
	t.throws(function () { npmignoreAuto({ gitignore: true }, noop); }, TypeError, 'throws with non-string `gitignore`');
	t.throws(function () { npmignoreAuto({ dest: {} }, noop); }, TypeError, 'throws with non-string `dest`');
	t.throws(function () { npmignoreAuto({ commentLines: 'a' }, noop); }, TypeError, 'throws with non-array `commentLines`');

	t.end();
});

test('npmignoreAuto: options are optional, and default to the current directory', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', '.npmignore\n');
		write(repo, 'package.json', {});

		var origCwd = process.cwd();
		process.chdir(repo);
		t.teardown(function () {
			process.chdir(origCwd);
		});

		npmignoreAuto(function (err, result) {
			t.error(err, 'no error');
			t.equal(result.cwd, repo, 'cwd defaults to `process.cwd()`');
			t.equal(result.gitignore, '.gitignore', 'reports the gitignore that was read');
			t.equal(result.dest, path.join(repo, '.npmignore'), 'dest defaults to `.npmignore`');

			npmignoreAuto(null, function (err2, result2) {
				t.error(err2, 'no error');
				t.equal(result2.cwd, repo, 'cwd defaults to `process.cwd()` with `null` options');
				t.end();
			});
		});
	});
});

test('npmignoreAuto: no gitignore found', function (t) {
	t.plan(3);
	var dir = createTempDir();
	t.teardown(function () {
		cleanup(dir);
	});

	var sync = true;
	npmignoreAuto({ cwd: dir, gitignore: '.npmignore-auto-test-nonexistent' }, function (err, result) {
		t.equal(sync, false, 'callback is called asynchronously');
		t.error(err, 'no error');
		t.deepEqual(result, {
			content: null,
			cwd: dir,
			dest: path.join(dir, '.npmignore'),
			destIgnored: null,
			gitignore: null,
			globallyIgnored: [],
			hasPublishConfig: null,
			ignore: null,
			publishConfigIgnore: null,
		}, 'reports that no gitignore was found');
	});
	sync = false;
});

test('npmignoreAuto: destination not ignored by git', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', { publishConfig: { ignore: ['foo'] } });
		write(repo, '.npmignore', 'existing\n');

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.gitignore, '.gitignore', 'gitignore is found');
			t.equal(result.destIgnored, false, 'reports that the destination is not ignored');
			t.equal(result.hasPublishConfig, null, '`package.json` is not consulted');
			t.equal(result.content, null, 'no content is produced');
			t.equal(fs.readFileSync(path.join(repo, '.npmignore'), 'utf8'), 'existing\n', 'existing destination is untouched');
			t.end();
		});
	});
});

test('npmignoreAuto: computes content without writing', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n.npmignore\n');
		write(repo, 'package.json', { publishConfig: { ignore: ['foo', '!bar'] } });

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.error(err, 'no error');
			t.deepEqual(result, {
				content: '# Rules from: ' + path.join(repo, '.gitignore') + '\nnode_modules/\n.npmignore\n' + commentPreamble + 'foo\n!bar\n',
				cwd: repo,
				dest: path.join(repo, '.npmignore'),
				destIgnored: true,
				gitignore: '.gitignore',
				globallyIgnored: [],
				hasPublishConfig: true,
				ignore: ['foo', '!bar'],
				publishConfigIgnore: ['foo', '!bar'],
			}, 'returns the expected content and metadata');
			t.notOk(fs.existsSync(path.join(repo, '.npmignore')), 'does not write the destination');
			t.end();
		});
	});
});

test('npmignoreAuto: existing destination is neither read nor removed', function (t) {
	createRepo(t, '.npmignore\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', { publishConfig: { ignore: ['foo'] } });
		write(repo, '.npmignore', 'existing\n');

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
			t.deepEqual(result.globallyIgnored, [], 'the destination itself is not reported as globally ignored');
			t.deepEqual(result.ignore, ['foo'], 'ignore list has only `publishConfig.ignore`');
			t.equal(result.content.indexOf('existing'), -1, 'existing destination content is not used');
			t.equal(fs.readFileSync(path.join(repo, '.npmignore'), 'utf8'), 'existing\n', 'existing destination is untouched');
			t.end();
		});
	});
});

test('npmignoreAuto: `publishConfig.ignore` must be an array', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', '.npmignore\n');
		write(repo, 'package.json', { publishConfig: { ignore: 'foo' } });

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.ok(err instanceof TypeError, 'yields a TypeError');
			t.equal(err && err.message, '`publishConfig.ignore` in `package.json` is not an array', 'has the expected message');
			t.equal(err && err.code, 'ERR_NPMIGNORE_INVALID_PUBLISHCONFIG_IGNORE', 'has the expected code');
			t.equal(result, undefined, 'no result');
			t.end();
		});
	});
});

test('npmignoreAuto: missing `package.json`', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', '.npmignore\n');

		npmignoreAuto({ cwd: repo }, function (err) {
			t.ok(err, 'yields an error');
			t.equal(err && err.code, 'ENOENT', 'error is from reading `package.json`');
			t.end();
		});
	});
});

test('npmignoreAuto: nothing to add', function (t) {
	t.test('no `publishConfig`', function (st) {
		createRepo(st, '', function (repo) {
			write(repo, '.gitignore', '.npmignore\n');
			write(repo, 'package.json', {});

			npmignoreAuto({ cwd: repo }, function (err, result) {
				st.error(err, 'no error');
				st.equal(result.hasPublishConfig, false, 'reports no `publishConfig`');
				st.equal(result.publishConfigIgnore, null, 'no `publishConfig.ignore`');
				st.equal(result.ignore, null, 'nothing to ignore');
				st.equal(result.content, null, 'no content');
				st.end();
			});
		});
	});

	t.test('`publishConfig` without `ignore`', function (st) {
		createRepo(st, '', function (repo) {
			write(repo, '.gitignore', '.npmignore\n');
			write(repo, 'package.json', { publishConfig: { tag: 'next' } });

			npmignoreAuto({ cwd: repo }, function (err, result) {
				st.error(err, 'no error');
				st.equal(result.hasPublishConfig, true, 'reports a `publishConfig`');
				st.equal(result.publishConfigIgnore, null, 'no `publishConfig.ignore`');
				st.equal(result.content, null, 'no content');
				st.end();
			});
		});
	});

	t.test('empty `publishConfig.ignore`', function (st) {
		createRepo(st, '', function (repo) {
			write(repo, '.gitignore', '.npmignore\n');
			write(repo, 'package.json', { publishConfig: { ignore: [] } });

			npmignoreAuto({ cwd: repo }, function (err, result) {
				st.error(err, 'no error');
				st.deepEqual(result.publishConfigIgnore, [], 'empty `publishConfig.ignore`');
				st.equal(
					result.content,
					'# Rules from: ' + path.join(repo, '.gitignore') + '\n.npmignore\n',
					'content is the gitignore'
				);
				st.end();
			});
		});
	});

	t.end();
});

test('npmignoreAuto: globally ignored files', function (t) {
	createRepo(t, '*.swp\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n.npmignore\n');
		write(repo, 'package.json', {});
		fs.mkdirSync(path.join(repo, 'd'));
		fs.mkdirSync(path.join(repo, 'd', 'e'));
		write(repo, 'a.swp', '');
		write(repo, 'd/e/b.swp', '');
		write(repo, 'd/c.swp', '');

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.hasPublishConfig, false, 'no `publishConfig`');
			t.deepEqual(result.globallyIgnored, ['d/', 'a.swp'], 'globally ignored files are minimized to top-level patterns');
			t.deepEqual(result.ignore, ['d/', 'a.swp'], 'ignore list is the globally ignored files');
			t.equal(
				result.content,
				'# Rules from: ' + path.join(repo, '.gitignore') + '\nnode_modules/\n.npmignore\n' + commentPreamble + 'd/\na.swp\n',
				'content includes globally ignored files'
			);
			t.end();
		});
	});
});

test('npmignoreAuto: finds a gitignore in a parent directory', function (t) {
	createRepo(t, '*.swp\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n.npmignore\n');
		fs.mkdirSync(path.join(repo, 'packages'));
		var sub = path.join(repo, 'packages', 'foo');
		fs.mkdirSync(sub);
		write(sub, 'package.json', { publishConfig: { ignore: ['qux'] } });
		write(sub, 'x.swp', '');

		npmignoreAuto({ cwd: sub }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.gitignore, path.join(repo, '.gitignore'), 'reports the absolute path of the gitignore that was found');
			t.equal(result.dest, path.join(sub, '.npmignore'), 'dest is relative to `cwd`');
			t.equal(result.destIgnored, true, 'dest is ignored by the parent gitignore');
			t.deepEqual(result.ignore, ['qux', 'x.swp'], 'ignore list combines `publishConfig.ignore` and globally ignored files');
			t.equal(
				result.content,
				'# Rules from: ' + path.join(repo, '.gitignore') + '\nnode_modules/\n.npmignore\n' + commentPreamble + 'qux\nx.swp\n',
				'content is built from the parent gitignore'
			);
			t.end();
		});
	});
});

test('npmignoreAuto: `gitignore`, `dest`, and `commentLines` options', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', 'out/\n');
		write(repo, 'one.gi', 'one\n');
		write(repo, 'two.gi', 'two\n');
		write(repo, 'package.json', { publishConfig: { ignore: ['foo'] } });

		npmignoreAuto({
			commentLines: ['custom'],
			cwd: repo,
			dest: 'out/npmignore',
			gitignore: 'one.gi,two.gi',
		}, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.gitignore, 'one.gi,two.gi', 'reports the gitignore files that were read');
			t.equal(result.dest, path.join(repo, 'out', 'npmignore'), 'dest is resolved');
			t.equal(result.destIgnored, true, 'dest is ignored');
			t.equal(
				result.content,
				[
					'# Rules from: ' + path.join(repo, 'one.gi'),
					'one',
					'',
					'# Rules from: ' + path.join(repo, 'two.gi'),
					'two',
					'',
					'',
					'# npmignore - custom',
					'foo',
					'',
				].join('\n'),
				'content uses the given gitignore files and comment lines'
			);
			t.notOk(fs.existsSync(path.join(repo, 'out')), 'nothing is written');
			t.end();
		});
	});
});

test('npmignoreAuto: the destination is excluded from globally ignored files when given through a symlink', function (t) {
	createRepo(t, '.npmignore\n*.swp\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', {});
		write(repo, '.npmignore', 'existing\n');
		write(repo, 'a.swp', '');
		var link = path.join(path.dirname(repo), 'link');
		fs.symlinkSync(repo, link);

		t.test('`cwd` is a symlink', function (st) {
			npmignoreAuto({ cwd: link, dest: path.join(repo, '.npmignore') }, function (err, result) {
				st.error(err, 'no error');
				st.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
				st.deepEqual(result.globallyIgnored, ['a.swp'], 'the destination is not reported as globally ignored');
				st.end();
			});
		});

		t.test('`dest` is through a symlink', function (st) {
			npmignoreAuto({ cwd: repo, dest: path.join(link, '.npmignore') }, function (err, result) {
				st.error(err, 'no error');
				st.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
				st.deepEqual(result.globallyIgnored, ['a.swp'], 'the destination is not reported as globally ignored');
				st.end();
			});
		});

		t.end();
	});
});

test('npmignoreAuto: a `package.json` of `null`', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', '.npmignore\n');
		write(repo, 'package.json', 'null');

		npmignoreAuto({ cwd: repo }, function (err, result) {
			t.ok(err instanceof TypeError, 'yields the TypeError from reading `publishConfig`');
			t.equal(err && err.code, undefined, 'the error is not marked as an invalid `publishConfig.ignore`');
			t.equal(result, undefined, 'no result');
			t.end();
		});
	});
});

test('npmignoreAuto: the destination is excluded from globally ignored files when given in a different case', function (t) {
	createRepo(t, '.npmignore\n*.swp\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', {});
		write(repo, '.npmignore', 'existing\n');
		write(repo, 'a.swp', '');

		if (!fs.existsSync(path.join(repo, '.NPMIGNORE'))) {
			t.comment('SKIP: the filesystem is case-sensitive');
			t.end();
			return;
		}

		npmignoreAuto({ cwd: repo, dest: '.NPMIGNORE' }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
			t.deepEqual(result.globallyIgnored, ['a.swp'], 'the destination is not reported as globally ignored');
			t.end();
		});
	});
});

test('npmignoreAuto: a hard link to the destination is still reported as globally ignored', function (t) {
	createRepo(t, '*.log\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', {});
		write(repo, 'out.log', 'existing\n');
		fs.linkSync(path.join(repo, 'out.log'), path.join(repo, 'other.log'));

		npmignoreAuto({ cwd: repo, dest: 'out.log' }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
			t.deepEqual(result.globallyIgnored, ['other.log'], 'only the destination itself is excluded');
			t.end();
		});
	});
});

test('npmignoreAuto: the destination is excluded from globally ignored files when given in another Unicode normalization', function (t) {
	createRepo(t, '*.log\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'package.json', {});
		var nfd = 'cafe\u0301.log';
		var nfc = 'caf\u00e9.log';
		write(repo, nfd, 'existing\n');
		write(repo, 'a.log', '');

		if (!fs.existsSync(path.join(repo, nfc))) {
			t.comment('SKIP: the filesystem distinguishes Unicode normalizations');
			t.end();
			return;
		}

		npmignoreAuto({ cwd: repo, dest: nfc }, function (err, result) {
			t.error(err, 'no error');
			t.equal(result.destIgnored, true, 'destination is ignored by the global gitignore');
			t.deepEqual(result.globallyIgnored, ['a.log'], 'the destination is not reported as globally ignored');
			t.end();
		});
	});
});
