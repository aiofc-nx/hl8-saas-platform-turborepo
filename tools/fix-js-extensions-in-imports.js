#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..');

async function getAllTsFiles(dir) {
  let files = [];
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(await getAllTsFiles(fullPath));
    } else if (item.isFile() && extname(item.name) === '.ts' && !item.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixJsExtensions(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复相对导入中的 .js 扩展名
  // 匹配相对路径导入，但不包括 node_modules 或绝对路径
  const relativeImportRegex = /from\s+['"](\.[^'"]*?)\.js['"];?/g;
  
  content = content.replace(relativeImportRegex, (match, path) => {
    hasChanges = true;
    return `from '${path}';`;
  });

  // 修复 export 语句中的 .js 扩展名
  const relativeExportRegex = /from\s+['"](\.[^'"]*?)\.js['"];?/g;
  
  content = content.replace(relativeExportRegex, (match, path) => {
    hasChanges = true;
    return `from '${path}';`;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed .js extensions in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复相对导入中的 .js 扩展名...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixJsExtensions(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
