const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const packagesDir = path.join(rootDir, 'packages');
const srcDir = path.join(rootDir, 'src');
const appDir = path.join(srcDir, 'app');

console.log('🚀 开始拆除 Lerna 并迁移至 Next.js...');

// 1. 创建基础目录
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir);

// 2. 读取并合并 package.json
const rootPkgPath = path.join(rootDir, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

const mergedDeps = { ...rootPkg.dependencies };
const mergedDevDeps = { ...rootPkg.devDependencies };

if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir);
  for (const pkg of packages) {
    const pkgPath = path.join(packagesDir, pkg);
    if (fs.statSync(pkgPath).isDirectory()) {
      // 合并依赖
      const childPkgPath = path.join(pkgPath, 'package.json');
      if (fs.existsSync(childPkgPath)) {
        const childPkg = JSON.parse(fs.readFileSync(childPkgPath, 'utf8'));
        Object.assign(mergedDeps, childPkg.dependencies || {});
        Object.assign(mergedDevDeps, childPkg.devDependencies || {});
      }
      // 移动目录到 src 下
      const destPath = path.join(srcDir, pkg);
      if (!fs.existsSync(destPath)) {
        fs.renameSync(pkgPath, destPath);
        console.log(`📦 已迁移模块: packages/${pkg} -> src/${pkg}`);
      }
    }
  }
  // 删除空的 packages 文件夹
  try { fs.rmdirSync(packagesDir); } catch (e) { console.error('Failed to remove packages dir, skipping', e) }
}

// 3. 清理并更新根 package.json
delete rootPkg.workspaces; // 移除 lerna workspaces
rootPkg.scripts = {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
};

// 移除 Vite 和 Lerna 相关依赖
const removeDeps = ['lerna', 'vite', '@originjs/vite-plugin-federation', '@vitejs/plugin-react', 'vite-tsconfig-paths'];
removeDeps.forEach(dep => {
  delete mergedDeps[dep];
  delete mergedDevDeps[dep];
});

// 添加 Next.js 和 React 最新核心依赖 (与 xroute-ui 对齐)
mergedDeps['next'] = "15.4.5";
mergedDeps['react'] = "19.1.0";
mergedDeps['react-dom'] = "19.1.0";
mergedDevDeps['@types/react'] = "^19";
mergedDevDeps['@types/react-dom'] = "^19";

rootPkg.dependencies = mergedDeps;
rootPkg.devDependencies = mergedDevDeps;

fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));
console.log('✅ package.json 依赖已合并并重写');

// 4. 生成 tsconfig.json (配置路径别名)
const tsconfigPath = path.join(rootDir, 'tsconfig.json');
const tsconfig = {
  compilerOptions: {
    target: "es5",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: false,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [{ name: "next" }],
    baseUrl: ".",
    paths: {
      "@/*": ["src/*"],
      // 欺骗原有代码，使其能找到拍平后的新路径
      "@apipark/common/*": ["src/common/src/*"],
      "@apipark/core/*": ["src/core/src/*"],
      "@apipark/dashboard/*": ["src/dashboard/src/*"],
      "@apipark/market/*": ["src/market/src/*"],
      "@apipark/openApi/*": ["src/openApi/src/*"],
      "@apipark/systemRunning/*": ["src/systemRunning/src/*"]
    }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
};
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json 别名映射已配置');

// 5. 创建 Next.js App Router 挂载点
const layoutCode = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutCode);

const slugDir = path.join(appDir, '[[...slug]]');
if (!fs.existsSync(slugDir)) fs.mkdirSync(slugDir, { recursive: true });

const pageCode = `"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// 动态导入原有的 Vite SPA 根组件，禁用 SSR 避免 window 报错
const ApiParkApp = dynamic(() => import('@/core/src/App'), { 
  ssr: false,
  loading: () => <div style={{ padding: 50 }}>Loading APIPark...</div> 
});

export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  return <ApiParkApp />;
}`;
fs.writeFileSync(path.join(slugDir, 'page.tsx'), pageCode);

console.log('✅ Next.js 路由挂载点创建完毕！');
console.log('🎉 迁移完成！请执行 pnpm install 重新安装依赖。');