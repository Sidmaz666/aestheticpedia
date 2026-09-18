import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    environment: 'node',
    testTimeout: 30_000,
    server: { deps: { external: ['@duckdb/node-api', '@duckdb/node-bindings'] } },
  },
})
