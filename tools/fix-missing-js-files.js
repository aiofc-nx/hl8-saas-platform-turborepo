#!/usr/bin/env node

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
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

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fixMissingJsFiles(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 匹配相对导入路径中的 .js 扩展名
  const jsImportRegex = /from\s+['"](\.[^'"]*?)\.js['"];?/g;
  
  const matches = [...content.matchAll(jsImportRegex)];
  
  for (const match of matches) {
    const fullImportPath = match[1];
    const currentDir = dirname(filePath);
    const resolvedPath = join(currentDir, fullImportPath);
    
    // 检查对应的 .ts 文件是否存在
    const tsFile = resolvedPath + '.ts';
    const tsIndexFile = join(resolvedPath, 'index.ts');
    
    if (await fileExists(tsFile) || await fileExists(tsIndexFile)) {
      // 如果 .ts 文件存在，移除 .js 扩展名
      const newImport = match[0].replace('.js', '');
      content = content.replace(match[0], newImport);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed missing .js files in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复缺失的 .js 文件导入...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixMissingJsFiles(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
