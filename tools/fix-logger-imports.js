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

async function fixLoggerImports(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复 Logger 导入 - 从 NestJS 改为 FastifyLoggerService
  const loggerImportRegex = /import\s*{\s*Logger\s*}\s*from\s*['"]@nestjs\/common['"];?/g;
  
  if (loggerImportRegex.test(content)) {
    content = content.replace(loggerImportRegex, (match) => {
      hasChanges = true;
      return "import { FastifyLoggerService } from '@hl8/nestjs-fastify';";
    });
  }

  // 修复 Logger 类型引用
  const loggerTypeRegex = /: Logger\b/g;
  if (loggerTypeRegex.test(content)) {
    content = content.replace(loggerTypeRegex, (match) => {
      hasChanges = true;
      return ': FastifyLoggerService';
    });
  }

  // 修复 Logger 构造函数调用
  const loggerConstructorRegex = /new Logger\(/g;
  if (loggerConstructorRegex.test(content)) {
    content = content.replace(loggerConstructorRegex, (match) => {
      hasChanges = true;
      return 'new FastifyLoggerService(';
    });
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed Logger imports in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复 Logger 导入问题...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixLoggerImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
