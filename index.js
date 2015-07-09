'use strict';

/**
 * Module dependencies
 */

var uniq = require('array-uniq');
var comment = [
  '# dockerignore - content above this line is automatically generated and modifications may be omitted',
  '# see npmjs.com/dockerignore for more details.'
].join('\n');
var re = /#\s*dockerignore/;

/**
 * Create or update a .dockerignore file.
 *
 * @param  {String} `dock` String, from `.dockerignore`
 * @param  {String} `git` String, from `.gitignore`
 * @param  {Object} `options`
 * @return {String}
 */

module.exports = function dockerignore(dock, git, options) {
  if (typeof git !== 'string') {
    options = git;
    git = '';
  }

  options = options || {};

  if (typeof git === 'string') {
    git = split(git);
  }

  // get the relevant lines from `.dockerignore`
  if (typeof dock === 'string') {
    dock = extract(dock);
  }

  if (options.unignore) {
    git = diff(git, arrayify(options.unignore));
    dock = diff(dock, arrayify(options.unignore));
  }

  // Remove the comment, we re-add later
  dock = diff(dock, comment.concat('#dockerignore # dockerignore'));
  dock = diff(dock, git);

  if (options.ignore) {
    dock = dock.concat(arrayify(options.ignore));
  }

  return format(git, uniq(dock));
}

/**
 * Extract relevant lines from `.dockerignore`
 *
 * @param  {String} `dockerignore` string
 * @return {Array} Array of lines
 */

function extract(dockerignore) {
  if (dockerignore == null) {
    throw new Error('dockerignore expects a string.');
  }

  var lines = split(dockerignore);
  var len = lines.length;
  var dockerignored = false;
  var git = [];
  var dock = [];
  var i = 0;

  while (i < len) {
    var line = lines[i++];
    if (re.test(line)) {
      dockerignored = true;
    }

    if (dockerignored) {
      dock.push(line);
    } else {
      git.push(line);
    }
  }

  return dock;
}

/**
 * Expose `extract` function
 */

module.exports.extract = extract;

/**
 * Rebuild array back into newline delimited,
 * merging .gitignore, .dockerignore extras &
 * comments (expcted output).
 *
 * @param  {String} `str`
 * @return {Array}
 * @api private
 */

function format(git, dock) {
  git = Array.isArray(git) ? git.join('\n') : git;
  dock = Array.isArray(dock) ? dock.join('\n') : dock;

  var res = '';

  if (git) {
    res += git;
  }

  if (dock) {
    res += '\n\n' + comment + '\n'+ dock;
  }

  return res;
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
