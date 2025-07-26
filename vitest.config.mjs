import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    coverage: {
      exclude: ['__mocks__/**', 'vitest.config.*', 'main.js']
    }
  },
  resolve: {
    alias: {
      obsidian: resolve(__dirname, '__mocks__/obsidian.ts')
    }
  }
});
