import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.e2e.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    include: ['tests/e2e/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'supabase'],

    env: {
      NODE_ENV: 'test',
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
