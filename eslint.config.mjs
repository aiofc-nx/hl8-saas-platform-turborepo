/**
 * HL8 SAAS Platform - 根目录 ESLint 配置
 *
 * 本配置文件引用共享的 ESLint 配置包 @repo/eslint-config
 * 遵循项目宪章（Constitution v1.4.0）的 Monorepo 组织原则
 *
 * @see .specify/memory/constitution.md
 * @see packages/eslint-config/base.js
 */

import { config as baseConfig, testConfig } from '@repo/eslint-config/base';
import tseslint from 'typescript-eslint';

/**
 * 根目录 ESLint 配置
 * 继承共享配置，适用于整个 monorepo
 */
export default tseslint.config(
  // 继承基础配置
  ...baseConfig,
  
  // 测试文件配置
  ...testConfig,
  
  // TypeScript 项目配置
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  // JavaScript 文件配置（不需要类型检查）
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  }
);
