'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var binPath = path.join(__dirname, '..', 'bin', 'npmignore');

function createTempDir() {
	var tmpDir = path.join(__dirname, '..', '.tmp-test-' + Date.now());
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
