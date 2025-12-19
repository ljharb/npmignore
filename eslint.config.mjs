import config from '@ljharb/eslint-config/flat/node/0.4';
import latestConfig from '@ljharb/eslint-config/flat/node/latest';

const nonNullFiles = (c) => !c.files || !c.files.some((f) => f == null);
const addFiles = (files) => (c) => (c.files ? c : { ...c, files });

export default [
	{ ignores: ['coverage/', '.nyc_output/'] },
	...config.filter(nonNullFiles).map(addFiles(['**/*.js', 'bin/[!.]*'])),
	...latestConfig.filter(nonNullFiles).map(addFiles(['eslint.config.mjs'])),
	{
		files: ['bin/[!.]*'],
		rules: {
			'no-process-exit': 'off',
		},
	},
	{
		rules: {
			'array-bracket-newline': 'off',
			eqeqeq: ['error', 'allow-null'],
			'func-style': 'off',
			'id-length': 'off',
			'multiline-comment-style': 'off',
			'no-param-reassign': 'warn',
			'no-plusplus': 'warn',
			'no-unused-vars': ['error', {
				args: 'after-used',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				vars: 'all',
			}],
		},
	},
];
