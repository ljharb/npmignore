'use strict';

var defaultCommentLines = [
	'content above this line is automatically generated and modifications may be omitted',
	'see npmjs.com/npmignore for more details.',
];
var commentPreamble = 'npmignore - ';
var re = /#\s*npmignore/;

/**
 * @param {string[]} `arr`
 * @returns {string[]} uniquified array
 */
function uniq(arr) {
	var obj = {};
	var res = [];
	for (var i = 0; i < arr.length; i += 1) {
		var key = '$' + arr[i];
		if (!(key in obj)) {
			res.push(arr[i]);
			obj[key] = true;
		}
	}
	return res;
}

/**
 * Rebuild array back into newline delimited,
 * merging .gitignore, .npmignore extras &
 * comments (expcted output).
 *
 * @param  {String} `str`
 * @return {String}
 * @api private
 */

function format(git, npm, commentStr) {
	var gitStr = [].concat(git).join('\n');
	var npmStr = [].concat(npm).join('\n');

	var res = '';

	if (gitStr) {
		res += gitStr;
	}

	if (npmStr) {
		res += '\n\n' + commentStr + '\n' + npmStr;
	}

	return res.replace(/\n?$/, '\n');
}

/**
 * Normalize newlines and split the string into an array.
 *
 * @param  {String} `str`
 * @return {String[]}
 * @api private
 */

function split(str) {
	return (str || '\n\n')
		.replace(/\r/g, '')
		.split('\n');
}

/**
 * Remove unwanted elements and uniquify the given `array`.
 *
 * @param {string[]} `arr` The array to uniquify
 * @param {string[] | string} `remove` elements to remove
 * @return {string[]} Filtered array
 * @api private
 */

function diff(arr, remove) {
	if (arr == null) {
		return [];
	}

	if (remove == null) {
		return arr;
	}

	var res = [];
	var len = arr.length;
	var i = 0;

	while (i < len) {
		var ele = arr[i++];

		if (remove.indexOf(ele) === -1) {
			res.push(ele);
		}
	}

	return res;
}

/**
 * Extract relevant lines from `.npmignore`
 *
 * @param  {String} `npmignore` string
 * @return {String[]} Array of lines
 */

function extract(npmignore, options) {
	if (typeof npmignore !== 'string') {
		throw new TypeError('npmignore expects a string.');
	}

	var lines = split(npmignore);

	if (options.npmignored) {
		return lines;
	}

	var npmignored = false;
	var git = [];
	var npm = [];
	var i = 0;

	while (i < lines.length) {
		var line = lines[i++];
		if (re.test(line)) {
			npmignored = true;
		}

		if (npmignored) {
			npm.push(line);
		} else {
			git.push(line);
		}
	}

	return npm;
}

/**
 * Create or update a .npmignore file.
 *
 * @param  {String} `npm` String, from `.npmignore`
 * @param  {String} `git` String, from `.gitignore`
 * @param  {Object} `options`
 * @return {String}
 */

module.exports = function npmignore(npm, git, options) {
	if (typeof git !== 'string') {
		options = git;
		git = '';
	}

	options = options || {};

	var gitLines = typeof git === 'string' ? split(git) : git;

	// get the relevant lines from `.npmignore`
	var npmLines = typeof npm === 'string' ? extract(npm, { npmignored: options.keepdest }) : npm;

	if (typeof options.commentLines !== 'undefined' && !Array.isArray(options.commentLines)) {
		throw new TypeError('`commentLines` option, when provided, must be an array');
	}
	var commentLines = options.commentLines || defaultCommentLines;
	var comment = commentLines.map(function (line, i) {
		return '# ' + (i === 0 ? commentPreamble : '') + line;
	}).join('\n');

	if (options.unignore) {
		gitLines = diff(gitLines, [].concat(options.unignore));
		npmLines = diff(npmLines, [].concat(options.unignore));
	}

	// Remove the comment, we re-add later
	var npmLinesNoComment = diff(npmLines, comment + '#npmignore # npmignore');
	npmLines = diff(npmLinesNoComment, gitLines);

	if (options.ignore) {
		npmLines = npmLines.concat([].concat(options.ignore));
	}

	return format(gitLines, uniq(npmLines), comment);
};

/**
 * Expose `extract` function
 */

module.exports.extract = extract;
