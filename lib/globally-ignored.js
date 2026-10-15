'use strict';

var path = require('path');
var execFile = require('child_process').execFile;

var minimizeGlobPatterns = require('./patterns');

function getGitIgnoredFiles(excludeArg, cwd, cb) {
	execFile(
		'git',
		['ls-files', '-z', '--others', '--ignored', excludeArg],
		{ cwd: cwd },
		function (_e, stdout) {
			if (_e) {
				cb([]);
			} else {
				cb(String(stdout).split('\0').filter(function (line) {
					return line.length > 0;
				}));
			}
		}
	);
}

function computeGloballyIgnoredFiles(ctx, cb) {
	// get all ignored files (local + global gitignore)
	getGitIgnoredFiles('--exclude-standard', ctx.cwd, function (allIgnored) {
		// get only locally ignored files
		getGitIgnoredFiles('--exclude-from=.gitignore', ctx.cwd, function (locallyIgnored) {
			// files in allIgnored but not in locallyIgnored, nor the (to-be-replaced) destination file
			var globallyIgnored = [];
			for (var i = 0; i < allIgnored.length; i++) {
				var file = allIgnored[i];
				if (locallyIgnored.indexOf(file) === -1 && !ctx.isExcluded(path.join(ctx.cwd, file))) {
					globallyIgnored[globallyIgnored.length] = file;
				}
			}

			cb(minimizeGlobPatterns(globallyIgnored));
		});
	});
}

module.exports = computeGloballyIgnoredFiles;
