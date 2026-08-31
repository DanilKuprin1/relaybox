import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    root: './src',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../coverage',
      include: ['**/*.ts'],
      exclude: [
        'main.ts',
        '**/*.module.ts',
        'config/**',
        'auth/clerk.ts',
        'prisma/db.service.ts',
      ],
      thresholds: {
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
