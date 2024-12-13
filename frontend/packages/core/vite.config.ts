
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  cacheDir: './node_modules/.vite',
  build:{
    target: 'esnext',
    outDir:'../../dist',
    sourcemap: false,
    chunkSizeWarningLimit: 50,
    cacheDir: './node_modules/.vite',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/eo-[name]-[hash].js',
      },
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
       federation({
        name:"container",
        remotes:{
          remoteApp: 'http://localhost:5001/assets/remoteEntry.js' // 远程项目的URL
        },
        shared:[
          "react",
          "react-dom",
        ]
      })

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
    },
    open: true
  },
  logLevel:'info'
})
