import type { Config } from "jest";

const config: Config = {
  displayName: "@hl8/pure-logger",
  preset: "ts-jest/presets/default-esm",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/jest-setup.ts"],
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],
  moduleNameMapper: {
    "^@hl8/pure-logger$": "<rootDir>/src/index.ts",
  },
};

export default config;
