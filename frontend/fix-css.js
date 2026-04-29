const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    if (dir.includes('node_modules')) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        try {
            let isDirectory = fs.statSync(dirPath).isDirectory();
            isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
        } catch(e) {}
    });
}

const filesToRename = [];
const filesToUpdate = [];

walkDir(srcDir, (filePath) => {
    if (filePath.endsWith('.module.css')) {
        filesToRename.push(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        filesToUpdate.push(filePath);
    }
});

filesToRename.forEach(oldPath => {
    const newPath = oldPath.replace(/\.module\.css$/, '.css');
    
    // Read and remove :global wrappers entirely
    let content = fs.readFileSync(oldPath, 'utf8');
    content = content.replace(/:global\(([^)]+)\)/g, '$1'); // replace :global(.foo) with .foo
    content = content.replace(/:global\s+/g, '');           // replace :global .foo with .foo
    
    fs.writeFileSync(oldPath, content);
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed and cleaned: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
});

filesToUpdate.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('.module.css')) {
        content = content.replace(/\.module\.css/g, '.css');
        fs.writeFileSync(filePath, content);
        console.log(`Updated imports in: ${path.basename(filePath)}`);
    }
});

console.log('Done!');
