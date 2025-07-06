import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },

  // 构建配置
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
    assetsDir: 'assets',
  },
  
  // 基础路径配置
  base: './',

  // 开发服务器
  server: {
    port: 3000,
    strictPort: true,
  },

  // 环境变量前缀
  envPrefix: 'VITE_',
}); 