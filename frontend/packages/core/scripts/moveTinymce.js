import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tinymcePath = path.resolve(__dirname, '../node_modules/tinymce');
const destPath = path.resolve(__dirname, '../public/tinymce');

fse.removeSync(destPath); // 删除旧目录

// 使用 fs-extra 的 copySync 方法来复制目录
fse.copySync(tinymcePath, destPath, { dereference: true });