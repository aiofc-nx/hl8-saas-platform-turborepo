import type { Config } from "jest";

const config: Config = {
  displayName: "@hl8/hybrid-archi",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@hl8/hybrid-archi$": "<rootDir>/src/index.ts",
    "^chalk$":
      "<rootDir>/../../node_modules/.pnpm/chalk@4.1.2/node_modules/chalk",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
        },
      },
    ],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 38,
      functions: 40,
      lines: 46,
      statements: 46,
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  transformIgnorePatterns: [
    "node_modules/(?!(chalk|ansi-styles|strip-ansi|has-flag|supports-color|color-convert|color-name|@hl8)/)",
  ],

  /**
   * 测试环境设置文件
   * 在测试环境初始化后、测试运行前执行
   */
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/jest-setup.ts"],

  /**
   * 测试超时
   */
  testTimeout: 30000, // 30秒

  // 移除已弃用的globals配置，使用transform中的配置
};

export default config;
