/**
 * Jest 配置 - Database 模块
 *
 * @description 测试框架配置
 */
export default {
  displayName: '@hl8/database',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      useESM: false,
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/libs/database',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/dist/',
    '.spec.ts$',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/*.spec.ts',
  ],
};

