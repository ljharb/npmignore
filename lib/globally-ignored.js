'use strict';

var path = require('path');
var execFile = require('child_process').execFile;

var minimizeGlobPatterns = require('./patterns');

function getGitIgnoredFiles(excludeArg, cwd, cb) {
	execFile(
		'git',
		['ls-files', '-z', '--others', '--ignored', excludeArg],
		{ cwd: cwd, maxBuffer: Infinity }, // the list of ignored files, eg in `node_modules`, can be very large
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

// the ignored files for each of `excludeArgs`, in order
function getAllGitIgnoredFiles(excludeArgs, cwd, cb) {
	var lists = [];
	function next(err, list) {
		if (err) {
			return cb(err);
		}
		if (list) {
			lists[lists.length] = list;
		}
		if (lists.length === excludeArgs.length) {
			return cb(null, lists);
		}
		return getGitIgnoredFiles(excludeArgs[lists.length], cwd, next);
	}
	return next();
}

function computeGloballyIgnoredFiles(ctx, cb) {
	getAllGitIgnoredFiles([
		'--exclude-standard', // all ignored files (local + global gitignore)
		'--exclude-from=.gitignore', // only locally ignored files
	], ctx.cwd, function (err, lists) {
		if (err) {
			return cb(err);
		}
		var allIgnored = lists[0];
		var locallyIgnored = lists[1];
		// these lists can be huge, eg with `node_modules`, so avoid quadratic lookups; keys are prefixed to avoid `__proto__`
		var isLocallyIgnored = {};
		for (var i = 0; i < locallyIgnored.length; i++) {
			isLocallyIgnored['$' + locallyIgnored[i]] = true;
		}
		// files in allIgnored but not in locallyIgnored, nor the (to-be-replaced) destination file
		var globallyIgnored = [];
		for (var j = 0; j < allIgnored.length; j++) {
			var file = allIgnored[j];
			if (!isLocallyIgnored['$' + file] && !ctx.isExcluded(path.join(ctx.cwd, file))) {
				globallyIgnored[globallyIgnored.length] = file;
			}
		}

		return cb(null, minimizeGlobPatterns(globallyIgnored));
	});
}

module.exports = computeGloballyIgnoredFiles;
