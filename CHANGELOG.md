# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
