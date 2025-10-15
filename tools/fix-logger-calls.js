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

async function fixLoggerCalls(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复 logger.log 调用 - 移除第二个参数
  content = content.replace(
    /this\.logger\.log\(([^,]+),\s*\{[^}]*\}\s*\);?/g,
    (match, message) => {
      hasChanges = true;
      return `this.logger.log(${message});`;
    }
  );

  // 修复 logger.error 调用 - 移除第二个参数
  content = content.replace(
    /this\.logger\.error\(([^,]+),\s*\{[^}]*\}\s*\);?/g,
    (match, message) => {
      hasChanges = true;
      return `this.logger.error(${message});`;
    }
  );

  // 修复 logger.warn 调用 - 移除第二个参数
  content = content.replace(
    /this\.logger\.warn\(([^,]+),\s*\{[^}]*\}\s*\);?/g,
    (match, message) => {
      hasChanges = true;
      return `this.logger.warn(${message});`;
    }
  );

  // 修复 logger.debug 调用 - 移除第二个参数
  content = content.replace(
    /this\.logger\.debug\(([^,]+),\s*\{[^}]*\}\s*\);?/g,
    (match, message) => {
      hasChanges = true;
      return `this.logger.debug(${message});`;
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed logger calls in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复 Logger 方法调用...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixLoggerCalls(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
