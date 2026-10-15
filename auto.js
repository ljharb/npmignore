'use strict';

var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;
var hasOwn = require('hasown');

var npmignore = require('./');
var computeGloballyIgnoredFiles = require('./lib/globally-ignored');
var isSameEntryAs = require('./lib/files').isSameEntryAs;

function read(fp, cwd) {
	if (fp.indexOf(',') > -1) {
		return fp.split(/,/g).map(function (x) {
			return read(x, cwd);
		}).join('\n');
	}
	var resolved = path.resolve(cwd, fp);
	if (!fs.existsSync(resolved)) {
		return null;
	}
	return '# Rules from: ' + resolved + '\n' + fs.readFileSync(resolved, 'utf8');
}

function findUpward(filename, cwd) {
	var dir = cwd;

	while (true) {
		var fp = path.join(dir, filename);
		if (fs.existsSync(fp)) {
			return fp;
		}
		var parent = path.dirname(dir);
		if (parent === dir) {
			// Reached root, didn't find the file
			return null;
		}
		dir = parent;
	}
}

function isIgnoredByGit(filePath, cwd, cb) {
	execFile('git', ['check-ignore', '-q', filePath], { cwd: cwd }, function (e) {
		cb(!e);
	});
}

function readPublishConfig(cwd) {
	var publishConfig = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'))).publishConfig;

	if (publishConfig && hasOwn(publishConfig, 'ignore') && !Array.isArray(publishConfig.ignore)) {
		var err = new TypeError('`publishConfig.ignore` in `package.json` is not an array');
		err.code = 'ERR_NPMIGNORE_INVALID_PUBLISHCONFIG_IGNORE'; // the CLI exits with 2 only for this error
		throw err;
	}

	return {
		hasPublishConfig: !!publishConfig,
		ignore: publishConfig && publishConfig.ignore ? publishConfig.ignore.slice() : null,
	};
}

function validateOptions(options) {
	if (typeof options !== 'object' || Array.isArray(options)) {
		throw new TypeError('`options`, when provided, must be an object');
	}
	var names = ['cwd', 'gitignore', 'dest'];
	for (var i = 0; i < names.length; i++) {
		var value = options[names[i]];
		if (typeof value !== 'undefined' && (typeof value !== 'string' || value.indexOf('\0') !== -1)) {
			throw new TypeError('`' + names[i] + '` option, when provided, must be a string without NUL characters');
		}
	}
	if (typeof options.commentLines !== 'undefined' && !Array.isArray(options.commentLines)) {
		throw new TypeError('`commentLines` option, when provided, must be an array');
	}
}

function findGitignore(gitignore, cwd) {
	var git = read(gitignore, cwd);
	if (git) {
		return { content: git, path: gitignore };
	}
	// Try searching upward from cwd to find a .gitignore
	var found = findUpward(path.basename(gitignore), cwd);
	if (found) {
		return { content: read(found, cwd), path: found };
	}
	return null;
}

function computeContent(ctx, done) {
	var result = ctx.result;
	var publishConfig;
	try {
		publishConfig = readPublishConfig(result.cwd);
	} catch (e) {
		return done(e);
	}
	result.hasPublishConfig = publishConfig.hasPublishConfig;
	result.publishConfigIgnore = publishConfig.ignore;

	return computeGloballyIgnoredFiles({
		cwd: result.cwd,
		isExcluded: isSameEntryAs(result.dest),
	}, function (globallyIgnored) {
		result.globallyIgnored = globallyIgnored;

		var ignore = publishConfig.ignore;
		if (globallyIgnored.length > 0) {
			ignore = (ignore || []).concat(globallyIgnored);
		}

		if (ignore) {
			result.ignore = ignore.slice();
			try {
				result.content = npmignore('', ctx.git, {
					commentLines: ctx.commentLines,
					ignore: ignore,
				});
			} catch (e) {
				return done(e); // eg, `publishConfig.ignore` has an entry that can not be converted to a string
			}
		}

		return done();
	});
}

function initialResult(cwd, dest) {
	return {
		content: null,
		cwd: cwd,
		dest: dest,
		destIgnored: null,
		gitignore: null,
		globallyIgnored: null,
		hasPublishConfig: null,
		ignore: null,
		publishConfigIgnore: null,
	};
}

module.exports = function npmignoreAuto(opts, cb) {
	var callback = typeof opts === 'function' ? opts : cb;
	var options = typeof opts === 'function' || opts == null ? {} : opts;
	if (typeof callback !== 'function') {
		throw new TypeError('`callback` must be a function');
	}
	validateOptions(options);

	var cwd = path.resolve(options.cwd || process.cwd());
	var dest = options.dest || '.npmignore';
	var result = initialResult(cwd, path.resolve(cwd, dest));

	function done(err) {
		process.nextTick(function () {
			if (err) {
				return callback(err);
			}
			return callback(null, result);
		});
	}

	var git;
	try {
		if (!fs.statSync(cwd).isDirectory()) {
			var notDir = new Error('ENOTDIR: not a directory, `' + cwd + '`');
			notDir.code = 'ENOTDIR';
			throw notDir;
		}
		git = findGitignore(options.gitignore || '.gitignore', cwd);
	} catch (e) {
		return done(e);
	}
	if (!git) {
		return done();
	}
	result.gitignore = git.path;

	return isIgnoredByGit(dest, cwd, function (ignored) {
		result.destIgnored = ignored;
		if (!ignored) {
			return done();
		}
		return computeContent({
			commentLines: options.commentLines,
			git: git.content,
			result: result,
		}, done);
	});
};
