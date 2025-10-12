/**
 * Jest 配置
 *
 * @description 用于 @hl8/exceptions 的 Jest 测试配置
 */

import type { Config } from 'jest';

const config: Config = {
  displayName: 'nestjs-exceptions',
  testEnvironment: 'node',
  
  // ES Module 支持
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          moduleResolution: 'bundler',
        },
      },
    ],
  },

  // 测试匹配
  testMatch: ['<rootDir>/src/**/*.spec.ts'],

  // 覆盖率
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/exception.module.ts',  // 模块配置，主要是依赖注入逻辑
    '!src/config/**/*.ts',        // 配置文件，主要是类型定义
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },

  // 其他选项
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

export default config;

