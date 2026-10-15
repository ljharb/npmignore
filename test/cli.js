'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;

var binPath = path.join(__dirname, '..', 'bin', 'npmignore');

// fixture repos must not use, nor change, a git repository that runs these tests (eg, from a hook)
Object.keys(process.env).forEach(function (key) {
	if ((/^GIT_/).test(key)) {
		delete process.env[key];
	}
});

var counter = 0;
function createTempDir() {
	counter += 1;
	var tmpDir = path.join(fs.realpathSync(os.tmpdir()), 'npmignore-cli-test-' + process.pid + '-' + Date.now() + '-' + counter);
	fs.mkdirSync(tmpDir);
	return tmpDir;
}

function cleanup(dir) {
	var files = fs.readdirSync(dir);
	for (var i = 0; i < files.length; i++) {
		var filePath = path.join(dir, files[i]);
		var stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			cleanup(filePath);
		} else {
			fs.unlinkSync(filePath);
		}
	}
	fs.rmdirSync(dir);
}

function run(cmd, cwd, cb) {
	exec(cmd, { cwd: cwd }, function (e, stdout, stderr) {
		cb({
			stdout: stdout || '',
			stderr: stderr || '',
			exitCode: e ? e.code : 0,
		});
	});
}

test('CLI: --auto mode requires .npmignore to be ignored by git', function (t) {
	t.plan(2);
	var tmpDir = createTempDir();

	// Initialize git repo
	run('git init', tmpDir, function () {
		// Create .gitignore WITHOUT .npmignore
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');

		// Create package.json with publishConfig.ignore
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['foo'] },
		}));

		// Run --auto mode, should fail
		run('node ' + binPath + ' --auto', tmpDir, function (result) {
			t.equal(result.exitCode, 1, 'exits with code 1 when .npmignore is not ignored');
			t.ok(
				result.stderr.indexOf('must be ignored by git') > -1,
				'error message mentions file must be ignored by git'
			);
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode succeeds when .npmignore is ignored by git', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();

	// Initialize git repo
	run('git init', tmpDir, function () {
		// Create .gitignore WITH .npmignore
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n.npmignore\n');

		// Create package.json with publishConfig.ignore
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['foo'] },
		}));

		// Run --auto mode, should succeed
		run('node ' + binPath + ' --auto', tmpDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0 when .npmignore is ignored');
			t.ok(fs.existsSync(path.join(tmpDir, '.npmignore')), '.npmignore file was created');

			var content = fs.readFileSync(path.join(tmpDir, '.npmignore'), 'utf8');
			t.ok(content.indexOf('foo') > -1, '.npmignore contains publishConfig.ignore entries');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode works with global gitignore', function (t) {
	t.plan(2);
	var tmpDir = createTempDir();

	// Initialize git repo
	run('git init', tmpDir, function () {
		// Create .gitignore with .npmignore via a pattern
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n.*ignore\n');

		// Create package.json with publishConfig.ignore
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['bar'] },
		}));

		// Run --auto mode - should succeed because .*ignore pattern matches .npmignore
		run('node ' + binPath + ' --auto', tmpDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0 when .npmignore matches glob pattern');
			t.ok(fs.existsSync(path.join(tmpDir, '.npmignore')), '.npmignore file was created');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode works from subdirectory', function (t) {
	t.plan(2);
	var tmpDir = createTempDir();
	var subDir = path.join(tmpDir, 'packages', 'foo');

	// Initialize git repo at root
	run('git init', tmpDir, function () {
		// Create .gitignore at root with .npmignore
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n.npmignore\n');

		// Create subdirectory structure
		fs.mkdirSync(path.join(tmpDir, 'packages'));
		fs.mkdirSync(subDir);

		// Create package.json in subdirectory
		fs.writeFileSync(path.join(subDir, 'package.json'), JSON.stringify({
			name: 'test-sub',
			version: '1.0.0',
			publishConfig: { ignore: ['baz'] },
		}));

		// Create a local .gitignore in subdirectory (without .npmignore)
		fs.writeFileSync(path.join(subDir, '.gitignore'), 'dist/\n');

		// Run --auto mode from subdirectory
		// The root .gitignore should still cause .npmignore to be ignored
		run('node ' + binPath + ' --auto', subDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0 - root gitignore pattern applies');
			t.ok(fs.existsSync(path.join(subDir, '.npmignore')), '.npmignore file was created in subdirectory');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode finds .gitignore in parent directory when not present locally', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();
	var subDir = path.join(tmpDir, 'packages', 'foo');

	// Initialize git repo at root
	run('git init', tmpDir, function () {
		// Create .gitignore at root with .npmignore
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n.npmignore\n');

		// Create subdirectory structure
		fs.mkdirSync(path.join(tmpDir, 'packages'));
		fs.mkdirSync(subDir);

		// Create package.json in subdirectory
		fs.writeFileSync(path.join(subDir, 'package.json'), JSON.stringify({
			name: 'test-sub',
			version: '1.0.0',
			publishConfig: { ignore: ['qux'] },
		}));

		// NO local .gitignore in subdirectory - should find parent's .gitignore
		// Run --auto mode from subdirectory
		run('node ' + binPath + ' --auto', subDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0 - finds .gitignore in parent');
			t.ok(fs.existsSync(path.join(subDir, '.npmignore')), '.npmignore file was created');

			var content = fs.readFileSync(path.join(subDir, '.npmignore'), 'utf8');
			t.ok(content.indexOf('qux') > -1, '.npmignore contains publishConfig.ignore entries');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode does not pass --dest through a shell', function (t) {
	t.plan(4);
	var tmpDir = createTempDir();
	var dest = 'a b.ign;touch PWNED';

	run('git init', tmpDir, function () {
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), '*.ign*\n');
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['foo'] },
		}));

		run('node ' + binPath + ' --auto --dest \'' + dest + '\'', tmpDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0');
			t.notOk(fs.existsSync(path.join(tmpDir, 'PWNED')), 'shell metacharacters in --dest are not executed');
			t.ok(fs.existsSync(path.join(tmpDir, dest)), 'destination file is created with the exact given name');
			t.ok(fs.readFileSync(path.join(tmpDir, dest), 'utf8').indexOf('foo') > -1, 'destination contains publishConfig.ignore entries');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode does not C-quote globally ignored paths', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();
	var repo = path.join(tmpDir, 'repo');
	fs.mkdirSync(repo);
	var excludesFile = path.join(tmpDir, 'global-gitignore');
	fs.writeFileSync(excludesFile, '*.swp\n');

	run('git init && git config core.excludesFile "' + excludesFile + '" && git config core.quotePath true', repo, function (initResult) {
		t.equal(initResult.exitCode, 0, 'fixture repo is set up');
		fs.writeFileSync(path.join(repo, '.gitignore'), '.npmignore\n');
		fs.writeFileSync(path.join(repo, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
		}));
		fs.writeFileSync(path.join(repo, 'ü "x".swp'), '');

		run('node ' + binPath + ' --auto', repo, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0');
			var lines = fs.readFileSync(path.join(repo, '.npmignore'), 'utf8').split('\n');
			t.ok(lines.indexOf('ü "x".swp') > -1, '.npmignore contains the unquoted globally ignored path');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode crashes on a `package.json` of `null`', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();

	run('git init', tmpDir, function () {
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.npmignore\n');
		fs.writeFileSync(path.join(tmpDir, 'package.json'), 'null');

		run('node ' + binPath + ' --auto', tmpDir, function (result) {
			t.notEqual(result.exitCode, 0, 'exits with a nonzero code');
			t.notEqual(result.exitCode, 2, 'does not exit with the code for an invalid `publishConfig.ignore`');
			t.ok(result.stderr.indexOf('TypeError') > -1, 'reports the TypeError');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode requires a value for --dest and --gitignore', function (t) {
	var flags = ['-d', '--dest', '-g', '--gitignore', '-d a -d b'];
	t.plan(1 + (flags.length * 4));
	var tmpDir = createTempDir();
	var remaining = flags.length;

	run('git init', tmpDir, function (initResult) {
		t.equal(initResult.exitCode, 0, 'fixture repo is set up');
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.npmignore\ntrue\na\nb\na,b\n');
		fs.writeFileSync(path.join(tmpDir, '.npmignore'), 'existing\n');
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['foo'] },
		}));

		flags.forEach(function (flag) {
			run('node ' + binPath + ' --auto ' + flag, tmpDir, function (result) {
				t.equal(result.exitCode, 1, '`' + flag + '`: exits with code 1');
				t.ok(result.stderr.indexOf('requires a single value') > -1, '`' + flag + '`: error message says a single value is required');
				t.notOk(fs.existsSync(path.join(tmpDir, 'true')), '`' + flag + '`: no file named `true` is written');
				t.equal(fs.readFileSync(path.join(tmpDir, '.npmignore'), 'utf8'), 'existing\n', '`' + flag + '`: the existing destination is unchanged');
				remaining -= 1;
				if (remaining === 0) {
					cleanup(tmpDir);
				}
			});
		});
	});
});

test('CLI: --auto mode accepts a numeric --dest', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();

	run('git init', tmpDir, function () {
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), '5\n');
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: ['foo'] },
		}));

		run('node ' + binPath + ' --auto -d 5', tmpDir, function (result) {
			t.equal(result.exitCode, 0, 'exits with code 0');
			t.ok(fs.existsSync(path.join(tmpDir, '5')), 'destination file named `5` was created');
			t.ok(fs.readFileSync(path.join(tmpDir, '5'), 'utf8').indexOf('foo') > -1, 'destination contains publishConfig.ignore entries');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode does not remove the existing destination when it fails', function (t) {
	t.plan(4);
	var tmpDir = createTempDir();

	run('git init', tmpDir, function () {
		fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.npmignore\n');
		fs.writeFileSync(path.join(tmpDir, '.npmignore'), 'existing\n');
		fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
			name: 'test',
			version: '1.0.0',
			publishConfig: { ignore: 'foo' },
		}));

		run('node ' + binPath + ' --auto', tmpDir, function (result) {
			t.equal(result.exitCode, 2, 'exits with code 2');
			t.ok(result.stderr.indexOf('is not an array') > -1, 'error message says `publishConfig.ignore` is not an array');
			t.ok(fs.existsSync(path.join(tmpDir, '.npmignore')), 'existing destination is not removed');
			t.equal(fs.readFileSync(path.join(tmpDir, '.npmignore'), 'utf8'), 'existing\n', 'existing destination is unchanged');
			cleanup(tmpDir);
		});
	});
});

test('CLI: --auto mode reports when it is not in a git repository', function (t) {
	t.plan(3);
	var tmpDir = createTempDir();

	fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.npmignore\n');
	fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
		name: 'test',
		version: '1.0.0',
		publishConfig: { ignore: ['foo'] },
	}));

	run('GIT_CEILING_DIRECTORIES="' + path.dirname(tmpDir) + '" node ' + binPath + ' --auto', tmpDir, function (result) {
		t.notEqual(result.exitCode, 0, 'exits with a nonzero code'); // an uncaught error exits with 8 in node < 0.11
		t.ok(result.stderr.indexOf('not a git repository') > -1, 'error is from `git`');
		t.equal(result.stderr.indexOf('must be ignored by git'), -1, 'error does not claim the destination is not ignored');
		cleanup(tmpDir);
	});
});
