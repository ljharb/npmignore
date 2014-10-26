#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var log = require('verbalize');
var argv = require('minimist')(process.argv.slice(2));
var parser = require('./');

log.runner = 'npmignore';

var gitignore = argv.g || '.gitignore';
var npmignore = argv.n || '.npmignore';
var dest = argv.d || argv.dest || npmignore;

var i = argv.i || argv.ignore;
var u = argv.u || argv.unignore;

if (typeof i === 'string') i = i.split(',');
if (typeof u === 'string') u = u.split(',');

var git = read(gitignore);
var npm = read(npmignore);

var res = parser(npm, git, {ignore: i, unignore: u});
fs.writeFileSync(dest, res);

log.inform('updated', dest);

console.log();

log.success('  Done.');

function read(fp) {
  fp = path.join(process.cwd(), fp);
  if (!fs.existsSync(fp)) {
    return null;
  }
  return fs.readFileSync(fp, 'utf8');
}
