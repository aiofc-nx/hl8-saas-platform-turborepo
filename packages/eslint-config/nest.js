/**
 * HL8 SAAS Platform - NestJS ESLint 配置
 *
 * 本配置继承基础配置，添加 NestJS 特定的规则
 * 
 * ⚠️ 重要：严格遵循宪章原则 IX - TypeScript `any` 类型使用原则
 * 不允许关闭 @typescript-eslint/no-explicit-any 规则
 *
 * @see ../../.specify/memory/constitution.md
 * @see ../../docs/any-except.md
 * @type {import("eslint").Linter.Config}
 */

import eslintConfigPrettier from 'eslint-config-prettier';
import prettier_plugin from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { config as baseConfig, testConfig } from './base.js';

const default_ignores_pool = [
  '**/.git/**/*',
  '**/dist/**/*',
  '**/node_modules/**/*',
  '**/storage/**/*',
];

/**
 * NestJS ESLint 配置
 */
export const nestJsConfig = [
  // 继承基础配置
  ...baseConfig,
  
  // 测试文件配置
  ...testConfig,
  
  // NestJS 特定配置
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  
  // NestJS 特定规则
  {
    rules: {
      // NestJS 不要求接口名称前缀
      '@typescript-eslint/interface-name-prefix': 'off',
      
      // ============================================
      // ⚠️ 重要：以下规则已被移除，因为违反宪章原则
      // ============================================
      // '@typescript-eslint/explicit-function-return-type': 'off', // ❌ 已在 base.js 中配置为 warn
      // '@typescript-eslint/explicit-module-boundary-types': 'off', // ❌ 已在 base.js 中配置为 warn
      // '@typescript-eslint/no-explicit-any': 'off', // ❌ 严重违反宪章原则 IX！必须保持 error
      
      // NestJS 装饰器常用模式：允许空的构造函数（依赖注入）
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      
      // NestJS 装饰器常用模式：允许空的类
      'no-useless-empty-export': 'off',
      
      // NestJS 中允许 parameter properties
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
    },
  },
  
  // Prettier 配置
  {
    ...eslintConfigPrettier,
  },
  {
    ...prettier_plugin,
    name: 'prettier/recommended',
    ignores: [...default_ignores_pool],
  },
];
