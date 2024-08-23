# 部署

## 代码同步
    packages目录下，部分子项目为企业版独有，不要同步到开源版：
    packages/businessEntry, packages/openApi, packages/systemRunning, README.pro.md

## 安装依赖
    建议使用pnpm
    `npm install -g pnpm`
    使用pnpm安装依赖
    `pnpm install`
    
## 编译
### 开源版本
        `pnpm run build`
### 企业版本
        `pnpm run build:pro`