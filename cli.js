#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var log = require('verbalize');
var argv = require('minimist')(process.argv.slice(2));
var parser = require('./');

log.runner = 'npmignore';

/**
 * Find the local `ignore` files we need
 */

var gitignore = argv.g || '.gitignore';
var npmignore = argv.n || '.npmignore';

// optionally specify a different destination
var dest = argv.d || argv.dest || npmignore;

// patterns to ignore
var i = argv.i || argv.ignore;

// patterns to un-ignore
var u = argv.u || argv.unignore;

if (typeof i === 'string') i = i.split(',');
if (typeof u === 'string') u = u.split(',');

var git = read(gitignore);
var npm = read(npmignore);

// Parse the files and create a new `.npmignore` file
// based on the given arguments along with data that
// is already present in either or both files.
var res = parser(npm, git, {ignore: i, unignore: u});

// write the file.
fs.writeFileSync(dest, res);

console.log();
log.inform('updated', dest);
log.success('  Done.');

function read(fp) {
  fp = path.join(process.cwd(), fp);
  if (!fs.existsSync(fp)) {
    return null;
  }
  return fs.readFileSync(fp, 'utf8');
}
