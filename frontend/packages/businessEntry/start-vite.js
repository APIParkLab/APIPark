
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
