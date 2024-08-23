
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  cacheDir: './node_modules/.vite',
  build:{
    outDir:'../../dist',
    sourcemap: false,
    chunkSizeWarningLimit: 50000,
    cacheDir: './node_modules/.vite', 
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
          // 针对 pnpm 和 Monorepo 特殊处理
          if (id.includes('.pnpm')) {
            const segments = id.split(path.sep);
            const packageName = segments[segments.indexOf('.pnpm') + 1].split('@')[0];
            return packageName;
          }
        }
      },
    },
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.resolve(__dirname, '../common/tailwind.config.js')), 
        autoprefixer
      ],
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    modules:{
      localsConvention:"camelCase",
      generateScopedName:"[local]_[hash:base64:2]"
    }
  },
  plugins: [react(),
      dynamicImportVars({
        include:["src"],
        exclude:[],
        warnOnError:false
       }),
    ],
  resolve: {
    alias: [
      { find: /^~/, replacement: '' },
      { find: '@common', replacement: path.resolve(__dirname, '../common/src') },
      { find: '@market', replacement: path.resolve(__dirname, '../market/src') },
      { find: '@core', replacement: path.resolve(__dirname, './src') },
      { find: '@dashboard', replacement: path.resolve(__dirname, '../dashboard/src') },
    ]
  },
  server: {
    proxy: {
      '/api/v1': {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: 'http://172.18.166.219:8288/',
        changeOrigin: true,
      },
      '/api2/v1': {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: 'http://172.18.166.219:8288/',
        changeOrigin: true,
      }
    }
  },
  logLevel:'info'
})
