const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../node_modules/monaco-editor/min/vs');
const targetDir = path.resolve(__dirname, '../public/vs');

if (!fs.existsSync(sourceDir)) {
    throw new Error(`Monaco source directory not found: ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

const zhCnNlsDoubleExt = path.join(targetDir, 'nls.messages.zh-cn.js.js');
const zhCnNlsCompat = path.join(targetDir, 'nls.messages.zh-cn.js');
if (fs.existsSync(zhCnNlsDoubleExt)) {
    fs.copyFileSync(zhCnNlsDoubleExt, zhCnNlsCompat);
}

console.log(`[monaco] Copied assets to ${targetDir}`);
