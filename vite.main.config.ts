import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 主进程配置
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main/main.ts'),
        preload: resolve(__dirname, 'src/main/preload.ts'),
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'electron', 
        'path', 
        'fs', 
        'os', 
        'util',
        'crypto',
        'stream',
        'events',
        'url',
        'querystring',
        'http',
        'https',
        'buffer',
        'child_process',
        'net',
        'tls',
        'zlib'
      ],
      output: {
        format: 'cjs',
      },
    },
    target: 'node14',
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
}); 