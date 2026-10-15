'use strict';

var test = require('tape');
var tmp = require('tmp');
var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;

var computeGloballyIgnoredFiles = require('../lib/globally-ignored');

// fixture repos must not use, nor change, a git repository that runs these tests (eg, from a hook)
Object.keys(process.env).forEach(function (key) {
	if ((/^GIT_/).test(key)) {
		delete process.env[key];
	}
});

function isNever() {
	return false;
}

function createTempDir(t) {
	var dir = fs.realpathSync(tmp.dirSync({ prefix: 'npmignore-globally-ignored-test-' }).name);
	t.teardown(function cleanup() {
		(function rm(d) {
			fs.readdirSync(d).forEach(function (name) {
				var p = path.join(d, name);
				if (fs.lstatSync(p).isDirectory()) {
					rm(p);
				} else {
					fs.unlinkSync(p);
				}
			});
			fs.rmdirSync(d);
		}(dir));
	});
	return dir;
}

function write(dir, file, content) {
	var filePath = path.join(dir, file);
	if (!fs.existsSync(path.dirname(filePath))) {
		fs.mkdirSync(path.dirname(filePath));
	}
	fs.writeFileSync(filePath, content);
}

// creates a git repo whose global excludes file is `globalIgnore`, isolated from the user's own
function createRepo(t, globalIgnore, cb) {
	var root = createTempDir(t);
	var repo = path.join(root, 'repo');
	fs.mkdirSync(repo);
	var excludesFile = path.join(root, 'global-gitignore');
	fs.writeFileSync(excludesFile, globalIgnore);

	execFile('git', ['init', '-q', '.'], { cwd: repo }, function (err) {
		t.error(err, 'git init succeeds');
		execFile('git', ['config', 'core.excludesFile', excludesFile], { cwd: repo }, function (err2) {
			t.error(err2, 'fixture repo excludesFile configured');
			cb(repo);
		});
	});
}

test('computeGloballyIgnoredFiles: files ignored only globally', function (t) {
	createRepo(t, '.env\nsecret/\n', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, '.env', 'SECRET=1');
		write(repo, 'secret/a.txt', 'a');
		write(repo, 'node_modules/x.js', 'x');
		write(repo, 'index.js', 'module.exports = 1;');

		computeGloballyIgnoredFiles({
			cwd: repo,
			gitignoreFiles: [path.join(repo, '.gitignore')],
			isExcluded: isNever,
		}, function (err, globallyIgnored) {
			t.error(err, 'no error');
			t.deepEqual(globallyIgnored, ['/.env', '/secret/'], 'yields patterns for globally, but not locally, ignored files');
			t.end();
		});
	});
});

test('computeGloballyIgnoredFiles: nothing globally ignored', function (t) {
	createRepo(t, '', function (repo) {
		write(repo, '.gitignore', 'node_modules/\n');
		write(repo, 'node_modules/x.js', 'x');

		computeGloballyIgnoredFiles({
			cwd: repo,
			gitignoreFiles: [path.join(repo, '.gitignore')],
			isExcluded: isNever,
		}, function (err, globallyIgnored) {
			t.error(err, 'no error');
			t.deepEqual(globallyIgnored, [], 'yields no patterns');
			t.end();
		});
	});
});

test('computeGloballyIgnoredFiles: not in a git repository', function (t) {
	var dir = createTempDir(t);

	computeGloballyIgnoredFiles({
		cwd: dir,
		gitignoreFiles: [],
		isExcluded: isNever,
	}, function (err, globallyIgnored) {
		t.ok(err, 'yields the error from `git`');
		t.deepEqual(globallyIgnored, [], 'yields no patterns');
		t.end();
	});
});
