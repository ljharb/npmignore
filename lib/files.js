'use strict';

var fs = require('fs');
var path = require('path');

function lstat(filePath) {
	try {
		return fs.lstatSync(filePath);
	} catch (_) {
		return null;
	}
}

function readdir(dir) {
	try {
		return fs.readdirSync(dir);
	} catch (_) {
		return [];
	}
}

function isSameFile(a, b) {
	return !!a && !!b && a.dev === b.dev && a.ino === b.ino && a.ino !== 0;
}

/*
 * whether a path that `git` lists is the directory entry that `filePath` names, which removing `filePath` before listing files
 * used to exclude: `git` may spell it differently (eg, in case, or in Unicode normalization), but a hard link is another entry
 */
function isSameEntryAs(filePath) {
	var target = lstat(filePath);
	var dir = path.dirname(filePath);
	var base = path.basename(filePath);
	var names = readdir(dir);
	// the entry's name on disk: `filePath`'s own, or else (eg, on a case-insensitive filesystem) that of the entry that is the same file
	var name = names.filter(function (n) {
		return n === base;
	}).concat(names.filter(function (n) {
		return isSameFile(lstat(path.join(dir, n)), target);
	}))[0];
	return function (otherPath) {
		var otherBase = path.basename(otherPath);
		return isSameFile(lstat(otherPath), target)
			&& (otherBase === name || readdir(path.dirname(otherPath)).indexOf(otherBase) === -1);
	};
}

module.exports = {
	isSameEntryAs: isSameEntryAs,
	isSameFile: isSameFile,
	lstat: lstat,
	readdir: readdir,
};
