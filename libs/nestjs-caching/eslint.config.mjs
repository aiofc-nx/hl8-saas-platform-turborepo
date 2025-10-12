import baseConfig from '@repo/eslint-config/nestjs.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
];

