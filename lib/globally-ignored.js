'use strict';

var exec = require('child_process').exec;

var minimizeGlobPatterns = require('./patterns');

function getGitIgnoredFiles(excludeArgs, cwd, cb) {
	exec(
		'git ls-files --others --ignored ' + excludeArgs,
		{ cwd: cwd },
		function (_e, stdout) {
			if (_e) {
				cb([]);
			} else {
				cb(stdout.split('\n').filter(function (line) {
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
			// Compute the difference: files in allIgnored but not in locallyIgnored
			var globallyIgnored = [];
			for (var i = 0; i < allIgnored.length; i++) {
				if (locallyIgnored.indexOf(allIgnored[i]) === -1) {
					globallyIgnored[globallyIgnored.length] = allIgnored[i];
				}
			}

			cb(minimizeGlobPatterns(globallyIgnored));
		});
	});
}

module.exports = computeGloballyIgnoredFiles;
