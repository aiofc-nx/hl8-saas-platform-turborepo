import nestConfig from '@repo/eslint-config/nest';

export default [
  ...nestConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
  },
];

