/*
 * @Date: 2024-06-05 09:35:25
 * @LastEditors: maggieyyy
 * @LastEditTime: 2024-06-05 10:50:12
 * @FilePath: \frontend\packages\core\start-vite.js
 */
// start-vite.js// start-vite.js
import { exec } from 'child_process';

const viteProcess = exec('pnpm run build');

viteProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

viteProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});
