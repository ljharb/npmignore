# npmignore [![NPM version](https://badge.fury.io/js/npmignore.svg)](http://badge.fury.io/js/npmignore)

> Command line tool for creating or updating a .npmignore file based on .gitignore.

## Usage

Say `.gitignore` has:

```bash
node_modules/
build/
```

… so that build output is not committed, and you want `.npmignore` to have:

```bash
node_modules/
src/
test/
```
… so that source files and test files are not published, but build output is.

### Automatic usage

On the command line, run `npm install --save-dev npmignore`.

In your `.gitignore`, add `.npmignore` so that the `.npmignore` file is no longer committed to version control.

In your `package.json`, add the following JSON to “scripts” and “publishConfig”:
```json
"scripts": {
    …
    "prepack": "npmignore --auto"
    …
},
"publishConfig": {
    …
    "ignore": [
        "!build/",
        "src/",
        "test/"
    ]
    …
}
```

Whenever you run `npm pack` or `npm publish`, an `.npmignore` file will automatically be created:

```bash
node_modules/
build/

# npmignore
!build/
src/
test/
```

### Manual usage

On the command line run:

```bash
npx npmignore -i src/,test/,!build/
```

An `.npmignore` file will be created, or updated:

```bash
node_modules/
build/

# npmignore
!build/
src/
test/
```

**Heads up!**

The `# npmignore` comment is used to ensure that `.npmignore` reflects the latest changes in your `.gitignore` file, just by running `npmignore` in the command line.

_If you want to preserve everything in your `.npmignore` file, regardless of what is in `.gitignore`, just add the `# npmignore` comment at the top of the `.npmignore` file.

### Verification

Run `npm pack --dry-run` (or `npm publish --dry-run`) in a modern version of npm to get a printout of the files that will be included in your npm package.

## CLI commands

 - `--auto`: automatic mode. The `--ignore`, `--unignore`, `keepdest`, and `--npmignore` options are incompatible with this mode.
 - `-i`|`--ignore`: comma-separated list of patterns to add to `.npmignore`
 - `-u`|`--unignore`: comma-separated list of patterns to remove from `.npmignore`. This will not un-ignore patterns in `.gitignore`.
 - `-d`|`--dest`: optionally define a different destination filepath. Good for test driving to see what will be generated in advance.
 - `-g`|`--gitignore`: alternate source filepath for `.gitignore`.
 - `-n`|`--npmignore`: alternate source filepath for `.npmignore`.
 - `-k`|`--keepdest`: avoids altering the destination file
 - `--commentLines`: a comma-separated list of lines of comment text.

## API

To use via API, first:

```bash
npm install --save npmignore
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
    + `commentLines` Array of comment lines. Defaults to:
        ```
        [
            'content above this line is automatically generated and modifications may be omitted',
            'see npmjs.com/npmignore for more details.'
        ]
        ```
    + `ignore` Array of patterns to add to the existing patterns from `.gitignore`
    + `unignore` Array of patterns to remove from `.npmignore`. This will not un-ignore patterns in `.gitignore`
    + `keepdest` if `true`, avoids altering the destination file

## Tests
Simply clone the repo, `npm install`, and run `npm test`

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/ljharb/npmignore/issues)