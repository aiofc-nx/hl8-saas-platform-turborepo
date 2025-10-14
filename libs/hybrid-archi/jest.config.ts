export default {
  displayName: 'hybrid-archi',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/hybrid-archi',
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ansi-styles|strip-ansi|has-flag|supports-color|color-convert|color-name|@hl8)/)',
  ],
  moduleNameMapper: {
    '^chalk$': '<rootDir>/../../node_modules/.pnpm/chalk@4.1.2/node_modules/chalk',
  },
  
  /**
   * 测试环境设置文件
   * 在测试环境初始化后、测试运行前执行
   */
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest-setup.ts'],
  
  /**
   * 测试超时
   */
  testTimeout: 30000, // 30秒
  
  /**
   * 测试匹配模式
   */
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/?(*.)+(spec|test).ts',
  ],
};
