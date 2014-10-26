'use strict';

/**
 * Module dependencies
 */

var uniq = require('array-uniq');
var comment = '# npmignore';
var re = new RegExp(comment);

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

  if (npm == null) {
    return format(git);
  }

  options = options || {};

  if (typeof git === 'string') {
    git = split(git);
  }

  // get the relevant lines from `.npmignore`
  if (typeof npm === 'string') {
    npm = extract(npm);
  }

  if (options.unignore) {
    git = diff(git, arrayify(options.unignore));
    npm = diff(npm, arrayify(options.unignore));
  }

  // Remove the comment, we re-add later
  npm = diff(npm, comment);
  npm = diff(npm, git);

  if (options.ignore) {
    npm = npm.concat(arrayify(options.ignore));
  }

  return format(git, uniq(npm));
}

/**
 * Extract relevant lines from `.npmignore`
 *
 * @param  {String} `npmignore` string
 * @return {Array} Array of lines
 */

function extract(npmignore) {
  if (npmignore == null) {
    throw new Error('npmignore expects a string.');
  }

  var lines = split(npmignore);
  var len = lines.length;
  var npmignored = false;
  var git = [];
  var npm = [];
  var i = 0;

  while (i < len) {
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
 * Expose `extract` function
 */

module.exports.extract = extract;

/**
 * Normalize newlines and split the string
 * into an array.
 *
 * @param  {String} `str`
 * @return {Array}
 * @api private
 */

function format(git, npm) {
  git = git || [];

  if (npm == null || Array.isArray(npm) && npm.length === 0) {
    return git.join('\n');
  }

  return ''
    + git.join('\n')
    + '\n\n'
    + comment
    + '\n'
    + npm.join('\n');
}

/**
 * Normalize newlines and split the string
 * into an array.
 *
 * @param  {String} `str`
 * @return {Array}
 * @api private
 */

function split(str) {
  return (str || '\n\n')
    .replace(/\r/g, '')
    .split('\n');
}

/**
 * Remove unwanted elements and uniquify the
 * given `array`.
 *
 * @param  {Array} `array` The array to uniquify
 * @return {Array} `remove` Array of elements to remove
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
 * Coerce the value to an array.
 *
 * @param  {*} val
 * @return {Array}
 * @api private
 */

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}
