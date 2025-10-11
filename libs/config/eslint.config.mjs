import baseConfig from '@repo/eslint-config/library.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];

