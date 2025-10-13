import baseConfig from '@repo/eslint-config/nest.js';

/**
 * ESLint 配置 - Database 模块
 *
 * @description 继承根目录的 NestJS ESLint 配置
 */
export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

