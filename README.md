# npmignore [![NPM version](https://badge.fury.io/js/npmignore.svg)](http://badge.fury.io/js/npmignore)

> Command line tool for creating or updating a .npmignore file based on .gitignore.

## Install globally with [npm](npmjs.org):

```bash
npm i -g npmignore
```

## Usage

Say `.gitignore` has:

```bash
node_modules
test/actual
```

And you want `.npmignore` to have:

```bash
node_modules
test/actual
test/fixtures
```

In the command line run:

```bash
npmignore "test/fixtures"
```

An `.npmignore` file will be created, or updated:

```bash
node_modules
test/actual

# npmignore
test/fixtures
```

**Heads up!**

The `# npmignore` comment is used to ensure that `.npmignore` reflects the latest changes in your `.gitignore` file, just by running `npmignore` in the command line.

_If you want to preserve everything in your `.npmignore` file, regardless of what is in `.gitignore`, just add the `# npmignore` comment at the top of the `.npmignore` file.

## CLI commands

 - `-i`|`--ignore`: comma-separated list of patterns to add to `.npmignore`
 - `-u`|`--unignore`: comma-separated list of patterns to remove from `.npmignore`. This will not un-ignore patterns in `.gitignore`.
 - `-d`|`--dest`: optionally define a different destination filepath. Good for test driving to see what will be generated in advance.
 - `-g`|`--gitignore`: alternate source filepath for `.gitignore`.
 - `-n`|`--npmignore`: alternate source filepath for `.npmignore`.
 - `-k`|`--keepdest`: avoids altering the destination file

## API

To use via API, first:

```bash
npm i npmignore --save
```

Then:

```js
var npmignore = require('npmignore');
npmignore(npm, git, options);
```

**Params**

 - `npm` {String|Array}: String from `.npmignore` or an array of patterns to use.
 - `git` {String|Array}: String from `.gitignore` or an array of patterns to use.
 - `options` {Object}
    + `ignore` Array of patterns to add to the existing patterns from `.gitignore`
    + `unignore` Array of patterns to remove from `.npmignore`. This will not un-ignore patterns in `.gitignore`
    + `keepdest` if `true`, avoids altering the destination file

## Run tests
Install dev dependencies.

```bash
npm i -d && npm test
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/ljharb/npmignore/issues)