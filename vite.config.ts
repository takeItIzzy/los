import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      root: path.resolve(__dirname, '.'),
    },
  },
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'los',
      fileName: (format) => `los.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
