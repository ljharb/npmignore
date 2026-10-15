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

### `--auto` API

The computation behind `npmignore --auto` is available without writing any files:

```js
var npmignoreAuto = require('npmignore/auto');

npmignoreAuto(options, function (err, result) {
	if (err) {
		// e.g. `package.json` is missing or invalid, `publishConfig.ignore` is not an array (a `TypeError`), `cwd` is not a directory, a gitignore file could not be read, or `git` failed (including when a gitignore was found, but `cwd` is not in a git repository)
	}
	// `result.content` is what `npmignore --auto` would write to `result.dest`, or `null` if it would write nothing
});
```

The callback is always called asynchronously. Invalid arguments throw a `TypeError` synchronously.

**Params**

 - `options` {Object} (optional)
    + `cwd` String: the package directory. Defaults to `process.cwd()`
    + `gitignore` String: path (relative to `cwd`) to the `.gitignore` file, or a comma-separated list of them; empty entries and missing files are skipped. Defaults to `.gitignore`. If none of the files exist, the nearest file named like the last nonempty entry's last path segment, in `cwd` or an ancestor directory, is used
    + `dest` String: path (relative to `cwd`) of the would-be `.npmignore` file. Defaults to `.npmignore`
    + `commentLines` Array of comment lines, as above
 - `callback` {Function}: called with `(err, result)`

**Result**

 - `content` {String|null}: the would-be `.npmignore` content; `null` when no gitignore was found, when `dest` is not ignored by git, or when there is no `publishConfig.ignore` and there are no globally ignored files (an empty `publishConfig.ignore` still produces content)
 - `cwd` {String}: the absolute package directory
 - `dest` {String}: the absolute path of `dest`
 - `destIgnored` {Boolean|null}: whether `dest` is ignored by git, which `--auto` mode requires; `null` if no gitignore was found
 - `gitignore` {String|null}: the gitignore that was read: the `gitignore` option as given (or `.gitignore`), if any of its files exist; otherwise the absolute path found by searching upward; `null` if none was found
 - `hasPublishConfig` {Boolean|null}: whether `package.json` has a `publishConfig`; `null` if `package.json` was not read (because no gitignore was found, or `dest` is not ignored)
 - `publishConfigIgnore` {Array|null}: a copy of the `publishConfig.ignore` array; `null` if there is none, or `package.json` was not read
 - `globallyIgnored` {Array|null}: patterns for files that git ignores, but `npm` would not: those that a rule in `core.excludesFile` or `.git/info/exclude` ignores, and those whose deciding rule is in a `.gitignore` that `npm` will not apply (one above `cwd`, other than the gitignore that was read for a rule without a `/` before its end; or one in a subdirectory that has an `.npmignore`), excluding `dest` itself. Each pattern is anchored to `cwd`, uses the names on disk, and is escaped (a line break in a name, which a pattern can not contain, matches any character). A directory (eg, `/dir/`) is used only when every file in it is globally ignored, and no pattern is written that would also match a file or directory that is not globally ignored, when ignoring case as `npm` does. `null` if they were not computed
 - `ignore` {Array|null}: the patterns added after the gitignore content (`publishConfigIgnore` followed by `globallyIgnored`; `content` omits duplicates); `null` if there is no `publishConfig.ignore` and no globally ignored files

An existing `dest` file is neither read nor removed.

## Tests
Simply clone the repo, `npm install`, and run `npm test`

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/ljharb/npmignore/issues)