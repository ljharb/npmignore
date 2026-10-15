'use strict';

function minimizeGlobPatterns(files) {
	var dirSet = {};
	var topLevelFiles = [];

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var firstSlash = file.indexOf('/');

		if (firstSlash === -1) {
			// Top-level file with no directory
			topLevelFiles[topLevelFiles.length] = file;
		} else {
			// Extract first directory component
			dirSet[file.slice(0, firstSlash)] = true;
		}
	}

	return Object.keys(dirSet).map(function (dir) {
		return dir + '/';
	}).concat(topLevelFiles);
}

module.exports = minimizeGlobPatterns;
