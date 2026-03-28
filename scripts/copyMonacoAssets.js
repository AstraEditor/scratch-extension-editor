const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../node_modules/monaco-editor/min/vs');
const targetDir = path.resolve(__dirname, '../public/vs');

if (!fs.existsSync(sourceDir)) {
    throw new Error(`Monaco source directory not found: ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

// 处理 NLS 文件：修复文件名和模块名
// 原始文件是 nls.messages.zh-cn.js.js（双扩展名）
// Monaco loader 期望 nls.messages.zh-cn.js，模块名为 vs/nls.messages.zh-cn
const nlsFiles = fs.readdirSync(targetDir).filter(f => f.match(/^nls\.messages\.[a-z-]+\.js\.js$/));
nlsFiles.forEach(file => {
    const oldPath = path.join(targetDir, file);
    // 新文件名：去掉末尾的 .js
    const newFile = file.replace(/\.js\.js$/, '.js');
    const newPath = path.join(targetDir, newFile);

    let content = fs.readFileSync(oldPath, 'utf8');

    // 修复模块名：把 "vs/nls.messages.xxx.js" 改成 "vs/nls.messages.xxx"
    content = content.replace(
        /define\("vs\/nls\.messages\.([a-z-]+)\.js"/g,
        'define("vs/nls.messages.$1"'
    );

    // 删除旧文件，写入新文件
    fs.rmSync(oldPath);
    fs.writeFileSync(newPath, content);
});

console.log(`[monaco] Copied assets to ${targetDir}`);
