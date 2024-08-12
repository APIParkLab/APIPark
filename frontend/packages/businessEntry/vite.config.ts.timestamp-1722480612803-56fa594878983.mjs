// vite.config.ts
import { defineConfig } from "file:///D:/eolink/applatform/frontend/node_modules/.pnpm/vite@5.2.12_@types+node@20.14.2_less@4.2.0/node_modules/vite/dist/node/index.js";
import react from "file:///D:/eolink/applatform/frontend/node_modules/.pnpm/@vitejs+plugin-react@4.3.0_vite@5.2.12_@types+node@20.14.2_less@4.2.0_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import dynamicImportVars from "file:///D:/eolink/applatform/frontend/node_modules/.pnpm/@rollup+plugin-dynamic-import-vars@2.1.2_rollup@4.18.0/node_modules/@rollup/plugin-dynamic-import-vars/dist/es/index.js";
import tailwindcss from "file:///D:/eolink/applatform/frontend/node_modules/.pnpm/tailwindcss@3.4.4/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///D:/eolink/applatform/frontend/node_modules/.pnpm/autoprefixer@10.4.19_postcss@8.4.38/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_dirname = "D:\\eolink\\applatform\\frontend\\packages\\businessEntry";
var vite_config_default = defineConfig({
  cacheDir: "./node_modules/.vite",
  build: {
    outDir: "../../dist",
    sourcemap: false,
    chunkSizeWarningLimit: 5e4,
    cacheDir: "./node_modules/.vite",
    output: {
      manualChunks(id) {
        if (id.includes("node_modules")) {
          return id.toString().split("node_modules/")[1].split("/")[0].toString();
        }
        if (id.includes(".pnpm")) {
          const segments = id.split(path.sep);
          const packageName = segments[segments.indexOf(".pnpm") + 1].split("@")[0];
          return packageName;
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(path.resolve(__vite_injected_original_dirname, "../common/tailwind.config.js")),
        autoprefixer
      ]
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    },
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:2]"
    }
  },
  plugins: [
    react(),
    dynamicImportVars({
      include: ["src"],
      exclude: [],
      warnOnError: false
    })
  ],
  resolve: {
    alias: [
      { find: /^~/, replacement: "" },
      { find: "@common", replacement: path.resolve(__vite_injected_original_dirname, "../common/src") },
      { find: "@market", replacement: path.resolve(__vite_injected_original_dirname, "../market/src") },
      { find: "@core", replacement: path.resolve(__vite_injected_original_dirname, "../core/src") },
      { find: "@dashboard", replacement: path.resolve(__vite_injected_original_dirname, "../dashboard/src") },
      { find: "@openApi", replacement: path.resolve(__vite_injected_original_dirname, "../openApi/src") },
      { find: "@systemRunning", replacement: path.resolve(__vite_injected_original_dirname, "../systemRunning/src") },
      { find: "@businessEntry", replacement: path.resolve(__vite_injected_original_dirname, "./src") }
    ]
  },
  server: {
    proxy: {
      "/api/v1": {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: "http://172.18.166.219:8288/",
        changeOrigin: true
      },
      "/api2/v1": {
        // target: 'http://uat.apikit.com:11204/mockApi/aoplatform/',
        target: "http://172.18.166.219:8288/",
        changeOrigin: true
      }
    }
  },
  logLevel: "info"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxlb2xpbmtcXFxcYXBwbGF0Zm9ybVxcXFxmcm9udGVuZFxcXFxwYWNrYWdlc1xcXFxidXNpbmVzc0VudHJ5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxlb2xpbmtcXFxcYXBwbGF0Zm9ybVxcXFxmcm9udGVuZFxcXFxwYWNrYWdlc1xcXFxidXNpbmVzc0VudHJ5XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9lb2xpbmsvYXBwbGF0Zm9ybS9mcm9udGVuZC9wYWNrYWdlcy9idXNpbmVzc0VudHJ5L3ZpdGUuY29uZmlnLnRzXCI7LypcclxuICogQERhdGU6IDIwMjQtMDEtMzEgMTU6MDA6MzlcclxuICogQExhc3RFZGl0b3JzOiBtYWdnaWV5eXlcclxuICogQExhc3RFZGl0VGltZTogMjAyNC0wOC0wMSAxMDo1MDoxMlxyXG4gKiBARmlsZVBhdGg6IFxcZnJvbnRlbmRcXHBhY2thZ2VzXFxidXNpbmVzc0VudHJ5XFx2aXRlLmNvbmZpZy50c1xyXG4gKi9cclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgZHluYW1pY0ltcG9ydFZhcnMgZnJvbSAnQHJvbGx1cC9wbHVnaW4tZHluYW1pYy1pbXBvcnQtdmFycyc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcyc7XHJcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgY2FjaGVEaXI6ICcuL25vZGVfbW9kdWxlcy8udml0ZScsXHJcbiAgYnVpbGQ6e1xyXG4gICAgb3V0RGlyOicuLi8uLi9kaXN0JyxcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMDAwLFxyXG4gICAgY2FjaGVEaXI6ICcuL25vZGVfbW9kdWxlcy8udml0ZScsIFxyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlkLnRvU3RyaW5nKCkuc3BsaXQoJ25vZGVfbW9kdWxlcy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBcdTk0ODhcdTVCRjkgcG5wbSBcdTU0OEMgTW9ub3JlcG8gXHU3Mjc5XHU2QjhBXHU1OTA0XHU3NDA2XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy5wbnBtJykpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBpZC5zcGxpdChwYXRoLnNlcCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gc2VnbWVudHNbc2VnbWVudHMuaW5kZXhPZignLnBucG0nKSArIDFdLnNwbGl0KCdAJylbMF07XHJcbiAgICAgICAgICAgIHJldHVybiBwYWNrYWdlTmFtZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIGNzczoge1xyXG4gICAgcG9zdGNzczoge1xyXG4gICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgdGFpbHdpbmRjc3MocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2NvbW1vbi90YWlsd2luZC5jb25maWcuanMnKSksIFxyXG4gICAgICAgIGF1dG9wcmVmaXhlclxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgbGVzczoge1xyXG4gICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1vZHVsZXM6e1xyXG4gICAgICBsb2NhbHNDb252ZW50aW9uOlwiY2FtZWxDYXNlXCIsXHJcbiAgICAgIGdlbmVyYXRlU2NvcGVkTmFtZTpcIltsb2NhbF1fW2hhc2g6YmFzZTY0OjJdXCJcclxuICAgIH1cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLFxyXG4gICAgICBkeW5hbWljSW1wb3J0VmFycyh7XHJcbiAgICAgICAgaW5jbHVkZTpbXCJzcmNcIl0sXHJcbiAgICAgICAgZXhjbHVkZTpbXSxcclxuICAgICAgICB3YXJuT25FcnJvcjpmYWxzZVxyXG4gICAgICAgfSksXHJcbiAgICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiBbXHJcbiAgICAgIHsgZmluZDogL15+LywgcmVwbGFjZW1lbnQ6ICcnIH0sXHJcbiAgICAgIHsgZmluZDogJ0Bjb21tb24nLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2NvbW1vbi9zcmMnKSB9LFxyXG4gICAgICB7IGZpbmQ6ICdAbWFya2V0JywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9tYXJrZXQvc3JjJykgfSxcclxuICAgICAgeyBmaW5kOiAnQGNvcmUnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2NvcmUvc3JjJykgfSxcclxuICAgICAgeyBmaW5kOiAnQGRhc2hib2FyZCcsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGFzaGJvYXJkL3NyYycpIH0sXHJcbiAgICAgIHsgZmluZDogJ0BvcGVuQXBpJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9vcGVuQXBpL3NyYycpIH0sXHJcbiAgICAgIHsgZmluZDogJ0BzeXN0ZW1SdW5uaW5nJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zeXN0ZW1SdW5uaW5nL3NyYycpIH0sXHJcbiAgICAgIHsgZmluZDogJ0BidXNpbmVzc0VudHJ5JywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpIH0sXHJcbiAgICBdXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpL3YxJzoge1xyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly91YXQuYXBpa2l0LmNvbToxMTIwNC9tb2NrQXBpL2FvcGxhdGZvcm0vJyxcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTcyLjE4LjE2Ni4yMTk6ODI4OC8nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgJy9hcGkyL3YxJzoge1xyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly91YXQuYXBpa2l0LmNvbToxMTIwNC9tb2NrQXBpL2FvcGxhdGZvcm0vJyxcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTcyLjE4LjE2Ni4yMTk6ODI4OC8nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgbG9nTGV2ZWw6J2luZm8nXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFNQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sa0JBQWtCO0FBWHpCLElBQU0sbUNBQW1DO0FBYXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFVBQVU7QUFBQSxFQUNWLE9BQU07QUFBQSxJQUNKLFFBQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLHVCQUF1QjtBQUFBLElBQ3ZCLFVBQVU7QUFBQSxJQUNSLFFBQVE7QUFBQSxNQUNOLGFBQWEsSUFBSTtBQUNmLFlBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixpQkFBTyxHQUFHLFNBQVMsRUFBRSxNQUFNLGVBQWUsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVM7QUFBQSxRQUN4RTtBQUVBLFlBQUksR0FBRyxTQUFTLE9BQU8sR0FBRztBQUN4QixnQkFBTSxXQUFXLEdBQUcsTUFBTSxLQUFLLEdBQUc7QUFDbEMsZ0JBQU0sY0FBYyxTQUFTLFNBQVMsUUFBUSxPQUFPLElBQUksQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDeEUsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDRixLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTO0FBQUEsUUFDUCxZQUFZLEtBQUssUUFBUSxrQ0FBVyw4QkFBOEIsQ0FBQztBQUFBLFFBQ25FO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUTtBQUFBLE1BQ04sa0JBQWlCO0FBQUEsTUFDakIsb0JBQW1CO0FBQUEsSUFDckI7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFBQyxNQUFNO0FBQUEsSUFDWixrQkFBa0I7QUFBQSxNQUNoQixTQUFRLENBQUMsS0FBSztBQUFBLE1BQ2QsU0FBUSxDQUFDO0FBQUEsTUFDVCxhQUFZO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSjtBQUFBLEVBQ0YsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsRUFBRSxNQUFNLE1BQU0sYUFBYSxHQUFHO0FBQUEsTUFDOUIsRUFBRSxNQUFNLFdBQVcsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZUFBZSxFQUFFO0FBQUEsTUFDekUsRUFBRSxNQUFNLFdBQVcsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZUFBZSxFQUFFO0FBQUEsTUFDekUsRUFBRSxNQUFNLFNBQVMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsYUFBYSxFQUFFO0FBQUEsTUFDckUsRUFBRSxNQUFNLGNBQWMsYUFBYSxLQUFLLFFBQVEsa0NBQVcsa0JBQWtCLEVBQUU7QUFBQSxNQUMvRSxFQUFFLE1BQU0sWUFBWSxhQUFhLEtBQUssUUFBUSxrQ0FBVyxnQkFBZ0IsRUFBRTtBQUFBLE1BQzNFLEVBQUUsTUFBTSxrQkFBa0IsYUFBYSxLQUFLLFFBQVEsa0NBQVcsc0JBQXNCLEVBQUU7QUFBQSxNQUN2RixFQUFFLE1BQU0sa0JBQWtCLGFBQWEsS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRTtBQUFBLElBQzFFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBO0FBQUEsUUFFVCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxNQUNBLFlBQVk7QUFBQTtBQUFBLFFBRVYsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFVBQVM7QUFDWCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
