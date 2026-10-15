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

/*
 * a function that spells a path relative to `cwd` as its entries are named on disk, which `npm` matches,
 * but `git` may not use (eg, with `core.precomposeUnicode`, Unicode-normalized names)
 */
function onDiskSpeller(cwd) {
	var entries = {};
	function entriesOf(dir) {
		if (!entries['$' + dir]) {
			entries['$' + dir] = readdir(dir).map(function (name) {
				return { name: name, stat: lstat(path.join(dir, name)) };
			});
		}
		return entries['$' + dir];
	}
	return function (relativePath) {
		var dir = cwd;
		return relativePath.split('/').map(function (part) {
			var stat = lstat(path.join(dir, part));
			var list = entriesOf(dir);
			var name = list.filter(function (entry) {
				return entry.name === part;
			}).concat(list.filter(function (entry) {
				return isSameFile(entry.stat, stat);
			}), { name: part })[0].name;
			dir = path.join(dir, name);
			return name;
		}).join('/');
	};
}

module.exports = {
	isSameEntryAs: isSameEntryAs,
	isSameFile: isSameFile,
	lstat: lstat,
	onDiskSpeller: onDiskSpeller,
	readdir: readdir,
};
