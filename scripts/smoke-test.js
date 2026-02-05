const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

const requiredFiles = [
  'index.js',
  'editor.worker.js',
  'ts.worker.js'
];

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[smoke-test] Missing build output: ${filePath}`);
    process.exit(1);
  }
}

const indexPath = path.join(distDir, 'index.js');
const indexSource = fs.readFileSync(indexPath, 'utf8');

const requiredNeedles = [
  '__SCRATCH_EXTENSION_EDITOR_PUBLIC_PATH__',
  'MonacoEnvironment',
  'getWorker'
];

for (const needle of requiredNeedles) {
  if (!indexSource.includes(needle)) {
    console.error(`[smoke-test] dist/index.js does not include expected marker: ${needle}`);
    process.exit(1);
  }
}

console.log('[smoke-test] OK');
