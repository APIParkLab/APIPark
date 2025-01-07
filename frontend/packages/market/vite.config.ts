import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'

export default defineConfig({
  build: {
    outDir: '../../tenant_dist',
    sourcemap: false,
    chunkSizeWarningLimit: 50000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  },
  plugins: [
    react(),
    dynamicImportVars({
      include: ['src'],
      exclude: [],
      warnOnError: false
    })
  ],
  resolve: {
    alias: [
      { find: /^~/, replacement: '' },
      { find: '@market', replacement: path.resolve(__dirname, './src') },
      { find: '@common', replacement: path.resolve(__dirname, '../common/src') },
      { find: '@core', replacement: path.resolve(__dirname, '../core/src') }
    ]
  },
  server: {
    proxy: {
      '/api/v1': {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: 'http://172.18.166.219:8488/',
        changeOrigin: true
      },
      '/api2/v1': {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: 'http://172.18.166.219:8488/',
        changeOrigin: true
      }
    }
  },
  logLevel: 'info'
})
