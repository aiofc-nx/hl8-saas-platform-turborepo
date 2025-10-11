/**
 * HL8 SAAS Platform - ESLint 基础配置
 *
 * 本配置文件遵循项目宪章（Constitution v1.4.0）的所有质量保证原则：
 * - 中文优先原则：支持中文注释
 * - 代码即文档原则：强制 TSDoc 注释规范
 * - TypeScript any 类型使用原则：严格限制 any 类型的使用
 * - 质量保证原则：统一的代码规范和检查
 *
 * @see ../../.specify/memory/constitution.md
 * @see ../../docs/any-except.md
 * @type {import("eslint").Linter.Config}
 */

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import tsdoc from 'eslint-plugin-tsdoc';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

const default_ignores_pool = [
  '**/.git/**/*',
  '**/node_modules/**/*',
  '**/dist/**/*',
  '**/build/**/*',
  '**/coverage/**/*',
  '**/.turbo/**/*',
  '**/.next/**/*',
  '**/out/**/*',
  '**/backup/**/*',
  '**/forks/**/*', // 第三方项目代码不检查
  '**/.specify/**/*', // 规范模板文件不检查
];

/**
 * 基础 ESLint 配置
 * 所有子配置都应该继承此配置
 */
export const config = [
  // 基础推荐规则
  js.configs.recommended,
  
  // TypeScript 推荐规则（包含类型检查）
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  
  // Prettier 集成（必须放在最后以覆盖格式化相关规则）
  eslintConfigPrettier,
  
  // 核心规则配置
  {
    plugins: {
      turbo: turboPlugin,
      tsdoc,
    },
    rules: {
      // ============================================
      // TypeScript `any` 类型使用原则（宪章 IX）
      // ============================================
      
      // 禁止显式使用 any 类型（ERROR 级别）
      '@typescript-eslint/no-explicit-any': 'error',
      
      // 禁止不安全的赋值
      '@typescript-eslint/no-unsafe-assignment': 'error',
      
      // 禁止不安全的函数调用
      '@typescript-eslint/no-unsafe-call': 'error',
      
      // 禁止不安全的成员访问
      '@typescript-eslint/no-unsafe-member-access': 'error',
      
      // 禁止不安全的返回值
      '@typescript-eslint/no-unsafe-return': 'error',
      
      // 禁止不安全的参数类型
      '@typescript-eslint/no-unsafe-argument': 'error',
      
      // ============================================
      // Turbo 规则
      // ============================================
      
      'turbo/no-undeclared-env-vars': 'warn',
      
      // ============================================
      // 代码即文档原则（宪章 II）
      // ============================================
      
      // TSDoc 注释规范检查
      'tsdoc/syntax': 'warn',
      
      // ============================================
      // TypeScript 最佳实践
      // ============================================
      
      // 要求显式的函数返回类型
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      
      // 要求显式的模块边界类型
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      
      // 禁止未使用的变量
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // 禁止浮动的 Promise
      '@typescript-eslint/no-floating-promises': 'error',
      
      // 禁止滥用 Promise
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      
      // 要求 Promise 使用 await
      '@typescript-eslint/await-thenable': 'error',
      
      // 要求 Array 方法返回语句
      '@typescript-eslint/require-array-sort-compare': [
        'error',
        {
          ignoreStringArrays: true,
        },
      ],
      
      // 禁止不必要的类型断言
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      
      // 禁止冗余的类型构造
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      
      // ============================================
      // 命名约定
      // ============================================
      
      '@typescript-eslint/naming-convention': [
        'warn',
        // 类型和接口使用 PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // 枚举成员使用 UPPER_CASE
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        // 类使用 PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // 接口可以不使用 I 前缀
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
      ],
      
      // ============================================
      // 代码质量
      // ============================================
      
      // 禁止使用 console（除了 warn 和 error）
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      
      // 禁止使用 debugger
      'no-debugger': 'error',
      
      // 要求使用 === 和 !==
      'eqeqeq': ['error', 'always'],
      
      // 禁止重复的 import
      'no-duplicate-imports': 'error',
      
      // 要求 switch 语句有 default
      'default-case': 'warn',
      
      // 要求 switch 语句的 case 有 break
      'no-fallthrough': 'error',
      
      // 禁止空的代码块
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      
      // ============================================
      // 复杂度控制
      // ============================================
      
      // 限制圈复杂度
      'complexity': ['warn', 15],
      
      // 限制最大嵌套深度
      'max-depth': ['warn', 4],
      
      // 限制最大行数
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      
      // 限制函数最大行数
      'max-lines-per-function': [
        'warn',
        {
          max: 100,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      
      // 限制函数参数数量
      'max-params': ['warn', 5],
    },
  },
  
  // Only Warn 插件（将某些错误降低为警告）
  {
    plugins: {
      onlyWarn,
    },
  },
  
  // 忽略的文件和目录
  {
    ignores: default_ignores_pool,
  },
];

/**
 * 测试文件特殊配置
 * 在测试文件中放宽某些规则
 */
export const testConfig = [
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
    ],
    rules: {
      // 测试文件中允许使用 any（降低为 warning）
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      
      // 测试文件可以不要求返回类型
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // 测试文件可以有较长的函数
      'max-lines-per-function': 'off',
      
      // 测试文件可以使用 console
      'no-console': 'off',
    },
  },
];

