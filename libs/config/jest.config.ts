export default {
  displayName: 'config',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/libs/config',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/*.spec.ts'],
};

