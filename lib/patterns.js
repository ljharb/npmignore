'use strict';

/*
 * `npm` matches ignore rules with `minimatch`'s `nocase` option: a RegExp with the `i` flag (and no `u` flag),
 * which compares characters by their single-character uppercase form, except a non-ASCII one with an ASCII uppercase form
 */
function fold(str) {
	return str.split('').map(function (c) {
		var upper = c.toUpperCase();
		return upper.length === 1 && !(c > '\x7f' && upper <= '\x7f') ? upper : c;
	}).join('');
}

function dirsOf(file) {
	var dirs = [];
	for (var slash = file.indexOf('/'); slash !== -1; slash = file.indexOf('/', slash + 1)) {
		dirs[dirs.length] = file.slice(0, slash + 1);
	}
	return dirs;
}

function toSet(list) {
	var set = {};
	for (var i = 0; i < list.length; i++) {
		set['$' + list[i]] = true;
	}
	return set;
}

/*
 * `npm` trims lines, and matches them with `minimatch`: anchor, and escape everything that any version of `minimatch`
 * treats specially (`@`, `+`, and `!` are only special before `(`, or `!` at the start)
 */
function toPattern(file) {
	return '/' + file
		.replace(/[*?[]/g, '[$&]')
		.replace(/[\\{}()]/g, '\\$&')
		.replace(/\n/g, '?') // a line break can not be written in a pattern, so match any character there
		.replace(/\s+$/, function (trailing) {
			return trailing.replace(/[\s\S]/g, '[$&]'); // a character class survives trimming
		});
}

function outermostCollapsible(file, keptDirs) {
	var collapsible = dirsOf(file).filter(function (dir) {
		return !keptDirs['$' + fold(dir)];
	});
	return collapsible.length > 0 ? collapsible[0] : file;
}

/*
 * patterns for `globallyIgnored`, none of which match any of `allFiles` that is not globally ignored, nor any directory of one;
 * a directory is collapsed to one pattern when no such file is in it
 */
function toPatterns(globallyIgnored, allFiles, spell) {
	var isGloballyIgnored = toSet(globallyIgnored);
	var kept = allFiles.filter(function (file) {
		return !isGloballyIgnored['$' + file];
	});
	var keptFiles = toSet(kept.map(fold));
	var keptDirs = {};
	for (var i = 0; i < kept.length; i++) {
		var dirs = dirsOf(fold(kept[i]));
		for (var j = 0; j < dirs.length; j++) {
			keptDirs['$' + dirs[j]] = true;
		}
	}

	var patterns = [];
	var seen = {};
	for (var k = 0; k < globallyIgnored.length; k++) {
		var pattern = outermostCollapsible(globallyIgnored[k], keptDirs);
		// a file pattern also matches a directory, so it must match neither a kept file nor a kept directory
		var isAmbiguous = keptFiles['$' + fold(pattern)] || keptDirs['$' + fold(pattern) + '/'];
		if (!seen['$' + pattern] && !isAmbiguous) {
			seen['$' + pattern] = true;
			patterns[patterns.length] = toPattern(spell(pattern));
		}
	}
	return patterns;
}

module.exports = toPatterns;
