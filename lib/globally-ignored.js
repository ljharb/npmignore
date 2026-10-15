'use strict';

var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;

var fsHelpers = require('./files');
var toPatterns = require('./patterns');

var isSameFile = fsHelpers.isSameFile;
var lstat = fsHelpers.lstat;

function listFiles(args, cwd, cb) {
	execFile(
		'git',
		['ls-files'].concat(args, '-z'),
		{ cwd: cwd, maxBuffer: Infinity }, // the list of files, eg in `node_modules`, can be very large
		function (e, stdout) {
			if (e) {
				cb(e);
			} else {
				cb(null, String(stdout).split('\0').filter(function (line) {
					return line.length > 0;
				}));
			}
		}
	);
}

function getPrefix(cwd, cb) {
	execFile('git', ['rev-parse', '--show-prefix'], { cwd: cwd }, function (e, stdout) {
		if (e) {
			return cb(e);
		}
		return cb(null, String(stdout).replace(/\n$/, ''));
	});
}

// the deciding ignore rule, as `git check-ignore --verbose` reports it, for each of `files`
function getIgnoreRules(files, cwd, cb) {
	var child = execFile(
		'git',
		['check-ignore', '--verbose', '--non-matching', '-z', '--stdin'],
		{ cwd: cwd, maxBuffer: Infinity },
		function (e, stdout) {
			if (e) {
				return cb(e);
			}
			// each record is: source, line number, pattern, path
			var fields = String(stdout).split('\0');
			return cb(null, files.map(function (_, i) {
				return { pattern: fields[(i * 4) + 2], source: fields[i * 4] };
			}));
		}
	);
	child.stdin.on('error', Function.prototype); // if `git` fails, the callback above reports it
	// a leading `./` keeps a path that starts with `:` from being read as pathspec magic
	child.stdin.end(files.map(function (file) {
		return './' + file + '\0';
	}).join(''));
}

/*
 * whether `npm` will apply an ignore rule: only if it is in the gitignore file(s) whose content is written (and,
 * if that file is not in `cwd`, it is not relative to its own directory), or in a `.gitignore` in a subdirectory
 * of `cwd` without an `.npmignore`, which `npm` reads instead
 */
function isAppliedByNpm(ctx, prefix) {
	var up = prefix.replace(/[^/]+\//g, '../'); // from `cwd` to the repository root, which per-directory sources are relative to
	var cwdStat = lstat(ctx.cwd);
	var written = ctx.gitignoreFiles.map(lstat);
	return function (rule) {
		var source = path.resolve(ctx.cwd, up, rule.source);
		var sourceStat = lstat(source);
		var isWritten = written.some(function (stat) {
			return isSameFile(stat, sourceStat);
		});
		var isInCwd = isSameFile(lstat(path.dirname(source)), cwdStat);
		var rest = rule.source.slice(prefix.length);
		var isInSubdirectory = rule.source.slice(0, prefix.length) === prefix
			&& !(/^(?:[\\/]|[A-Za-z]:)/).test(rest)
			&& (/^[^]+\/\.gitignore$/).test(rest);
		return isWritten
			? isInCwd || !(/\/./).test(rule.pattern)
			: isInSubdirectory && !fs.existsSync(path.join(path.dirname(source), '.npmignore'));
	};
}

function getPrefixAndRules(files, cwd, cb) {
	getPrefix(cwd, function (err, prefix) {
		if (err) {
			return cb(err);
		}
		return getIgnoreRules(files, cwd, function (err2, rules) {
			return cb(err2, { prefix: prefix, rules: rules });
		});
	});
}

// files whose ignore rules `npm` will not apply, other than the (to-be-replaced) destination file
function notAppliedByNpm(ctx, files, found) {
	var applied = isAppliedByNpm(ctx, found.prefix);
	return files.filter(function (file, i) {
		return !applied(found.rules[i]) && !ctx.isExcluded(path.join(ctx.cwd, file));
	});
}

function getPatterns(cwd, globallyIgnored, cb) {
	if (globallyIgnored.length === 0) {
		return cb(null, []);
	}
	// every file, tracked or not, so that no pattern ignores one that is not globally ignored
	return listFiles(['--cached', '--others'], cwd, function (err, allFiles) {
		return cb(err, err ? undefined : toPatterns(globallyIgnored, allFiles));
	});
}

function computeGloballyIgnoredFiles(ctx, cb) {
	// all ignored files (local + global gitignore)
	listFiles(['--others', '--ignored', '--exclude-standard'], ctx.cwd, function (err, allIgnored) {
		if (err || allIgnored.length === 0) {
			return cb(err, []);
		}
		return getPrefixAndRules(allIgnored, ctx.cwd, function (err2, found) {
			if (err2) {
				return cb(err2);
			}
			return getPatterns(ctx.cwd, notAppliedByNpm(ctx, allIgnored, found), cb);
		});
	});
}

module.exports = computeGloballyIgnoredFiles;
