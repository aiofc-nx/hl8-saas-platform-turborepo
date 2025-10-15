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

async function addJsExtensions(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 匹配相对导入路径（以 ./ 或 ../ 开头），但不包括 node_modules 或绝对路径
  // 排除已经包含扩展名的导入
  const relativeImportRegex = /from\s+['"](\.[^'"]*?)(?<!\.js)(?<!\.ts)(?<!\.json)['"];?/g;
  
  content = content.replace(relativeImportRegex, (match, path) => {
    // 跳过 node_modules 和绝对路径
    if (path.includes('node_modules') || path.startsWith('/') || path.includes('@')) {
      return match;
    }
    
    // 跳过已经包含扩展名的路径
    if (path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.json')) {
      return match;
    }
    
    hasChanges = true;
    return `from '${path}.js';`;
  });

  // 修复 export 语句
  const relativeExportRegex = /from\s+['"](\.[^'"]*?)(?<!\.js)(?<!\.ts)(?<!\.json)['"];?/g;
  
  content = content.replace(relativeExportRegex, (match, path) => {
    if (path.includes('node_modules') || path.startsWith('/') || path.includes('@')) {
      return match;
    }
    
    if (path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.json')) {
      return match;
    }
    
    hasChanges = true;
    return `from '${path}.js';`;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Added .js extensions in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 为相对导入添加 .js 扩展名...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await addJsExtensions(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
