import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'StimulusDelegation',
      formats: ['es', 'umd'],
      fileName: (format) => `stimulus-delegation.${format}.js`
    },
    sourcemap: true,
    rollupOptions: {
      external: ['@hotwired/stimulus'],
      output: {
        globals: {
          '@hotwired/stimulus': 'Stimulus'
        }
      }
    }
  },
  plugins: [dts({
    entryRoot: 'src',
    outputDir: 'dist',
    exclude: ['tests/**/*', 'tests/e2e/**/*'],
  })],
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  }
});
