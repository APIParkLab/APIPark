const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const filesToDelete = [
    'package.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'postcss.config.js',
    'tailwind.config.js',
    '.eslintrc.cjs',
    'index.html',
    'start-vite.js'
];

function walkDirAndClean(dir) {
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        try {
            let stat = fs.statSync(dirPath);
            if (stat.isDirectory() && f !== 'node_modules') {
                // If it's a top-level module directory like src/core, src/common
                if (dir === srcDir) {
                    filesToDelete.forEach(file => {
                        const fileToDelete = path.join(dirPath, file);
                        if (fs.existsSync(fileToDelete)) {
                            fs.unlinkSync(fileToDelete);
                            console.log(`Deleted: ${fileToDelete}`);
                        }
                    });
                }
            }
        } catch(e) {}
    });
}

walkDirAndClean(srcDir);
console.log('Cleanup completed!');
