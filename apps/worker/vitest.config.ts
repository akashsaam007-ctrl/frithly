import { defineConfig } from 'vitest/config';
// Integration tests share one database, so run files one at a time.
export default defineConfig({ test: { fileParallelism: false, testTimeout: 30000 } });
