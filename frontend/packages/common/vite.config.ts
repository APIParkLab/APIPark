import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

export default defineConfig({
  css: {
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
      { find: '@common', replacement: path.resolve(__dirname, './src') },
      { find: '@market', replacement: path.resolve(__dirname, '/./market/src') },
      { find: '@core', replacement: path.resolve(__dirname, '../core/src') },
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
