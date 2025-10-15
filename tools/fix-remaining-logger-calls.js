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

async function fixRemainingLoggerCalls(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复多行 Logger 调用 - 移除第二个参数
  const multiLineLoggerRegex = /this\.logger\.(log|error|warn|debug)\(\s*([^,]+),\s*\{\s*[\s\S]*?\}\s*\)/g;
  
  content = content.replace(multiLineLoggerRegex, (match, method, message) => {
    hasChanges = true;
    return `this.logger.${method}(${message.trim()})`;
  });

  // 修复单行 Logger 调用 - 移除第二个参数
  const singleLineLoggerRegex = /this\.logger\.(log|error|warn|debug)\(([^,]+),\s*\{[^}]*\}\)/g;
  
  content = content.replace(singleLineLoggerRegex, (match, method, message) => {
    hasChanges = true;
    return `this.logger.${method}(${message.trim()})`;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed remaining logger calls in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复剩余的 Logger 调用...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixRemainingLoggerCalls(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
