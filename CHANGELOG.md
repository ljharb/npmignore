# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.3.6](https://github.com/ljharb/npmignore/compare/v0.3.5...v0.3.6) - 2026-10-15

### Commits

- [Refactor] `--auto`: extract the computation into `auto.js`, and filesystem helpers into `lib/files.js` [`403aae3`](https://github.com/ljharb/npmignore/commit/403aae3b5016c9339d1eefd3245bbabecf8bb272)
- [Fix] `--auto`: decide which ignored files are "globally ignored" by whether `npm` will apply their ignore rule [`763d8e2`](https://github.com/ljharb/npmignore/commit/763d8e2dbaa5bb4ba4a3f6e759906af1d8617fdb)
- [Fix] `--auto`: write globally ignored files as anchored, escaped patterns that match no other file, collapsing only directories whose files are all globally ignored [`5d1f739`](https://github.com/ljharb/npmignore/commit/5d1f7399f473fd6490c6ccfbddbb0c6cc14c1a00)
- [Refactor] `--auto`: move the computation of globally ignored files into `lib/globally-ignored.js` [`df38b2c`](https://github.com/ljharb/npmignore/commit/df38b2c12393acc724d388068925cfe94518ee31)
- [Refactor] `auto.js`: [`06c19c4`](https://github.com/ljharb/npmignore/commit/06c19c46c770eae3ca679eb36206fab43e3dbd79)
- [Fix] `--auto`: do not silently drop globally ignored files when the output of `git ls-files` is large, or `git ls-files` fails [`64fe2a7`](https://github.com/ljharb/npmignore/commit/64fe2a7c3ddcd4c411c51ed8ec0c73078431c2d4)
- [Fix] `--auto`: handle comma-separated `--gitignore` lists consistently [`132e1c5`](https://github.com/ljharb/npmignore/commit/132e1c5cb07b7172a2c07a2562a02e5ff5e8b07d)
- [Refactor] `--auto`: move the generation of patterns for globally ignored files into `lib/patterns.js` [`eb34920`](https://github.com/ljharb/npmignore/commit/eb349209b60480871f0a7e6cec7e21b9c33f4448)
- [Fix] `--auto`: write patterns with the names on disk, which `npm` matches, rather than those `git` reports [`f618d21`](https://github.com/ljharb/npmignore/commit/f618d216b03277ac1b56591ff12d2f99ad842ab8)
- [Fix] `--auto`: give a clear error when `--dest` or `--gitignore` lack a single value, and write a numeric `--dest` to a file of that name, not to a file descriptor [`c079209`](https://github.com/ljharb/npmignore/commit/c07920913a2f216aa5e5818c0ddbe1a5639aea8a)
- [actions] update workflows [`5e3e070`](https://github.com/ljharb/npmignore/commit/5e3e0703c97cb6bed296a08892a083768b7b312b)
- [Fix] `--auto`: add files that a global ignore rule matches, even when a local rule also ignores them [`a9e6475`](https://github.com/ljharb/npmignore/commit/a9e64753c9115ea7c6cb127494fe5df2b7361d22)
- [Fix] `--auto`: ensure `dest` is passed to `git check-ignore` as a path, never as an option or pathspec magic [`0ac5a55`](https://github.com/ljharb/npmignore/commit/0ac5a55bd1c640d8ff637d1080e2c13e7502857e)
- [Fix] `--auto`: report `git check-ignore` failures, instead of treating `dest` as not ignored [`2687668`](https://github.com/ljharb/npmignore/commit/268766821d077001b5d8c4c289a307793bc9a0c5)
- [Fix] `--auto`: use NUL-separated `git ls-files` output, so globally ignored paths are not C-quoted [`12d6685`](https://github.com/ljharb/npmignore/commit/12d66857037f145d6a767e1b3c7e59fb5f607a34)
- [New] add `npmignore/auto` API, to compute `--auto` output without writing [`2bcba0b`](https://github.com/ljharb/npmignore/commit/2bcba0bd9e4b96d922bbe7287f483927e04460d7)
- [Fix] `--auto`: run `git` without a shell, so `--dest` is not shell-interpreted [`62ea9f5`](https://github.com/ljharb/npmignore/commit/62ea9f54a1a7f2c0257498b0191b14a5b8b31c26)
- [Fix] `--auto`: do not remove the existing `dest` when computing its content fails [`9ccea2a`](https://github.com/ljharb/npmignore/commit/9ccea2ab653961894cd5bb67ae9791de57bc874f)
- [Fix] `--auto`: report incompatible options before anything else [`5175be1`](https://github.com/ljharb/npmignore/commit/5175be1941ad7e3a108d41b7b0b472cf77a346d9)
- [Tests] use `tmp` instead of `os.tmpdir`, which node 0.8 lacks [`fb988a9`](https://github.com/ljharb/npmignore/commit/fb988a9ef8454037964fe33d340cc596fb8fac73)
- [Fix] `--auto`: avoid quadratic time when comparing lists of ignored files [`23a6ac6`](https://github.com/ljharb/npmignore/commit/23a6ac656591f81a47033894761b2757da6519e1)
- [Dev Deps] update `@ljharb/eslint-config`, `auto-changelog`, `eslint`, `tape` [`c5bb91d`](https://github.com/ljharb/npmignore/commit/c5bb91d468b51702681ba27b488557ffa40b93ab)
- [Tests] isolate CLI tests from inherited `GIT_*` environment variables [`23fb1b4`](https://github.com/ljharb/npmignore/commit/23fb1b4eb14a028510a8fee67b3c26951ac5d53d)
- [Tests] avoid `path.delimiter`, which node 0.8 lacks [`743d0cf`](https://github.com/ljharb/npmignore/commit/743d0cf5e4931817bf45c5bdd71fd85620fe6e8a)
- [Tests] create CLI test fixtures in the OS temp directory, not inside the repo [`8d4cdd0`](https://github.com/ljharb/npmignore/commit/8d4cdd0f2a9fb79ea9d1da416cc89c381518af0f)
- [actions] set least-privilege `cache-mode` [`6f170b2`](https://github.com/ljharb/npmignore/commit/6f170b2c51585fb8d42f89b60291f99e585d4f82)
- [Dev Deps] update `auto-changelog`; remove `encoding` [`6b7a84c`](https://github.com/ljharb/npmignore/commit/6b7a84c169724a730c21f7ffefffac02117a7678)
- [Deps] update `hasown` [`2763fc2`](https://github.com/ljharb/npmignore/commit/2763fc2c42415f4907ee8b19cc1bf82af76fb45a)

## [v0.3.5](https://github.com/ljharb/npmignore/compare/v0.3.4...v0.3.5) - 2025-12-22

### Commits

- [Fix] avoid use of `path.parse` [`be4a464`](https://github.com/ljharb/npmignore/commit/be4a46416a2bd800769a03870d256e9eb788667a)

## [v0.3.4](https://github.com/ljharb/npmignore/compare/v0.3.3...v0.3.4) - 2025-12-20

### Commits

- [Fix] search up to the git root for a gitignore file [`d195293`](https://github.com/ljharb/npmignore/commit/d19529375a973edecc5412a103fed62668a8abc1)

## [v0.3.3](https://github.com/ljharb/npmignore/compare/v0.3.2...v0.3.3) - 2025-12-19

### Commits

- [Fix] use `exec` instead of `execSync` [`6b67465`](https://github.com/ljharb/npmignore/commit/6b67465111edee14e504faf7cc4b9ff25410b97d)
- [Fix] check if npmignore is ignored, instead of looking at gitignore contents [`e6ea871`](https://github.com/ljharb/npmignore/commit/e6ea871575e6d391e81dc6c8e04bb4d4fec3c95d)
- [Dev Deps] update `eslint`, `@ljharb/eslint-config` [`53cbb21`](https://github.com/ljharb/npmignore/commit/53cbb21a18ef89c22baed03d378521ccc621eeaa)
- [Refactor] move finisher logic into a function [`008ab73`](https://github.com/ljharb/npmignore/commit/008ab73915a9d758a6da919487df3e459a04b2f6)
- [Dev Deps] add missing peer dep [`0d6dfce`](https://github.com/ljharb/npmignore/commit/0d6dfce969a7779c0bff81dec5c696add9e04e5c)

## [v0.3.2](https://github.com/ljharb/npmignore/compare/v0.3.1...v0.3.2) - 2025-11-13

### Commits

- [Tests] increase coverage [`9b224a9`](https://github.com/ljharb/npmignore/commit/9b224a90a05559da9fec29b5a39f6cd339112ba8)
- [New] `--auto` mode: respect global gitignore [`d4f706e`](https://github.com/ljharb/npmignore/commit/d4f706e39df189f48e7f3c615f4d82c8ee05d08d)
- [Dev Deps] update `@ljharb/eslint-config`, `auto-changelog`, `tape` [`c3ef83d`](https://github.com/ljharb/npmignore/commit/c3ef83d1276009f846735080f53259f4d6b0c744)
- [meta] use `npm audit` instead of `aud` [`1c01544`](https://github.com/ljharb/npmignore/commit/1c01544249ffe896edd9163bd629ba1b2d82d568)
- [Dev Deps] update `@ljharb/eslint-config` [`063663a`](https://github.com/ljharb/npmignore/commit/063663a33a931866f1a7edbb9471ffcf5488c5c8)
- [Dev Deps] update `tape` [`2f4390a`](https://github.com/ljharb/npmignore/commit/2f4390a1e4b609d03f7688a364a3ae7144ab896f)
- [Dev Deps] update `aud` [`41f6104`](https://github.com/ljharb/npmignore/commit/41f6104972b42f8117968b7e6591c7d18dbe0a31)
- [Dev Deps] add missing peer dep [`7bc9142`](https://github.com/ljharb/npmignore/commit/7bc914262bbea9ac2ae629cbc07a5abc1307748e)

## [v0.3.1](https://github.com/ljharb/npmignore/compare/v0.3.0...v0.3.1) - 2023-11-29

### Commits

- [meta] update editorconfig [`c4b7754`](https://github.com/ljharb/npmignore/commit/c4b7754e5606dab85cd47c3b56f9b9727d74d422)
- [actions] remove redundant workflow [`fcdc202`](https://github.com/ljharb/npmignore/commit/fcdc20233614a96f0567dc7b44887ff0cbcaa25a)
- [Tests] add `nyc` [`98ec251`](https://github.com/ljharb/npmignore/commit/98ec251599e6c499d165cf5d5e8c5329e1f99f91)
- [actions] update rebase action [`cd7cc76`](https://github.com/ljharb/npmignore/commit/cd7cc76a41c009162a080f1fabaa5f8329de306c)
- [Dev Deps] update `@ljharb/eslint-config`, `aud`, `tape` [`79e56a5`](https://github.com/ljharb/npmignore/commit/79e56a505cb1660bcb1449504e18b965400b8140)
- [Fix] better error message when gitignore is not found [`3cad507`](https://github.com/ljharb/npmignore/commit/3cad5072204c6406257c07d54e960fe2099ba0a6)
- [Dev Deps] update `aud`, `tape` [`cba23fc`](https://github.com/ljharb/npmignore/commit/cba23fc43d05b866c8bf87d305b6321c97c5768f)
- [Deps] update `minimist` [`56cac61`](https://github.com/ljharb/npmignore/commit/56cac61f9ed425459607f71f95ec4aabb4198795)
- [Deps] update `minimist` [`a96fc20`](https://github.com/ljharb/npmignore/commit/a96fc2032e3e8d4bc16b66d02ea6db890834b85f)

## [v0.3.0](https://github.com/ljharb/npmignore/compare/v0.2.0...v0.3.0) - 2022-05-04

### Merged

- Some improvements [`#11`](https://github.com/ljharb/npmignore/pull/11)
- fix format() jsDoc [`#5`](https://github.com/ljharb/npmignore/pull/5)

### Commits

- [Refactor] spaces -&gt; tabs [`d40c8b8`](https://github.com/ljharb/npmignore/commit/d40c8b80ce6ed885df210fea6b5fe02de58d389c)
- [Tests] add `npm run lint` [`cd5f42b`](https://github.com/ljharb/npmignore/commit/cd5f42b965ff5005835eebee07bf49b5181b8a35)
- [New] add `--auto` mode, and dogfood it [`624ef0a`](https://github.com/ljharb/npmignore/commit/624ef0a57bdcac6fa4af063acdcfbaa6d218055e)
- Only apps should have lockfiles [`706ac5c`](https://github.com/ljharb/npmignore/commit/706ac5c9a7416f8537f5492ecc1e44bc736fe389)
- [Refactor] remove `verbalize` and `verb` [`f98f4b4`](https://github.com/ljharb/npmignore/commit/f98f4b46c9053d2ae250b6da5b62f3a28aca80c9)
- [Tests] add github actions, FUNDING.yml [`0e83333`](https://github.com/ljharb/npmignore/commit/0e833334d2852bf0ae8e83df79f0272c576a980c)
- [Tests] add `aud`, `auto-changelog`, `safe-publish-latest` [`4e1e5d0`](https://github.com/ljharb/npmignore/commit/4e1e5d07485967ed363fc290743ead01f8c62870)
- [Refactor] clean up the code a bit [`037a72d`](https://github.com/ljharb/npmignore/commit/037a72d25ed1dc05bb04dc1cc7bb15a178cfda5e)
- [New] add `--commentLines` CLI and `commentLines` API option [`95a58a1`](https://github.com/ljharb/npmignore/commit/95a58a15726a86aace5311c43d3b86f27394855b)
- [Tests] initial tests [`5ea6473`](https://github.com/ljharb/npmignore/commit/5ea64732a980b4c004ce1aa669dda3a3e56c8877)
- [meta] package.json field cleanup [`9e8d32d`](https://github.com/ljharb/npmignore/commit/9e8d32db589ed5d608cbf3c82cd650c89c79027f)
- [meta] update repo URLs [`dc672e7`](https://github.com/ljharb/npmignore/commit/dc672e7857ccb1ebea9057fc12c522b96af75033)
- [meta] remove unused files [`e48ea97`](https://github.com/ljharb/npmignore/commit/e48ea977caf9d6f6a2b3451d9d6bbf78ef6c4f0f)
- [Refactor] replace `array-uniq` with a simple inline impl [`3a3b88b`](https://github.com/ljharb/npmignore/commit/3a3b88b89d089f6abb5e38c9db48b9efc19f2725)
- [Refactor] `arrayify` is never needed, since `[].concat` exists [`7c56059`](https://github.com/ljharb/npmignore/commit/7c560595e95a9e7a43ef4139d76fe3f73a39ad97)
- [New] add `--keepdest` command-line option to keep existing .npmignore [`2fc3a3c`](https://github.com/ljharb/npmignore/commit/2fc3a3c5b55409196f5b1601e353388a06f47bee)
- [Breaking] add `exports` [`6636852`](https://github.com/ljharb/npmignore/commit/6636852dc675555ac3e3871b0d29d6fc9c4ab6f6)
- [Fix] ensure `.npmignore` always has a trailing newline [`f20380d`](https://github.com/ljharb/npmignore/commit/f20380d584e25ed9c72557dbf825bcd3b4e379ac)
- [Refactor] move cli script to `bin` dir [`e12c1e0`](https://github.com/ljharb/npmignore/commit/e12c1e0541400d3c732ece53bfb7b8b868980c1d)
- [Dev Deps] removed mocha, added verb [`a027807`](https://github.com/ljharb/npmignore/commit/a0278072e0854df5f5938ac568ad4870005e2484)
- [meta] avoid the dangerous "files" field [`308b063`](https://github.com/ljharb/npmignore/commit/308b0632c5db6b3d87497749ae84cd5cb6bc5943)
- Allow absolute paths [`3df0205`](https://github.com/ljharb/npmignore/commit/3df0205b0149b520dd1785b7322197c782326fa2)
- Add missing --gitignore --npmignore argument keys [`ba530e5`](https://github.com/ljharb/npmignore/commit/ba530e5b88e07b5e6df70da60283f4d70567ac19)
- Allow multiple comma separated .gitignore/.npmignore files [`6c9d7b3`](https://github.com/ljharb/npmignore/commit/6c9d7b36b8bd2bd8f3e352d778cd9ce2d96f4ca4)
- [Deps] update `minimist` [`078c5b3`](https://github.com/ljharb/npmignore/commit/078c5b32842d816005306e5bf42cfdd2c4c19a63)
- [Refactor] `extract`: use a TypeError for a wrong type [`38a9741`](https://github.com/ljharb/npmignore/commit/38a97415288f8c80872009cad4f2485bb1820f87)
- Adds name of the file from which the rules were copied [`19e1ec6`](https://github.com/ljharb/npmignore/commit/19e1ec6216a93aad0b6009993fe5cbc9e9e072f1)

## [v0.2.0](https://github.com/ljharb/npmignore/compare/v0.1.2...v0.2.0) - 2015-03-17

### Merged

- issue a warning in the .npmignore file [`#3`](https://github.com/ljharb/npmignore/pull/3)

### Commits

- lint [`08da7f4`](https://github.com/ljharb/npmignore/commit/08da7f4c81fd12f50f16e374daa9aba25b4451d9)

## [v0.1.2](https://github.com/ljharb/npmignore/compare/v0.1.1...v0.1.2) - 2014-10-26

### Commits

- CLI / API instructions [`2e90534`](https://github.com/ljharb/npmignore/commit/2e90534d73680fe2bf5114828534c9a98dcf972c)

## [v0.1.1](https://github.com/ljharb/npmignore/compare/v0.1.0...v0.1.1) - 2014-10-26

### Commits

- adds CLI instructions. fixes bug related to missing npmignore [`e305cdf`](https://github.com/ljharb/npmignore/commit/e305cdf245e24c84abb6eac65ae9581a082be4f1)
- fix examples [`a0e51ee`](https://github.com/ljharb/npmignore/commit/a0e51eed813a217c7cd8eb59b652c28cbd81432a)

## v0.1.0 - 2014-10-26

### Commits

- first commit [`a7a9d60`](https://github.com/ljharb/npmignore/commit/a7a9d605b3af6fdfe23787aa46bc029a2494f0e0)
