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

async function fixNestjsFastifyImports(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复 @hl8/nestjs-fastify/logging 导入
  content = content.replace(
    /from\s+['"]@hl8\/nestjs-fastify\/logging['"];?/g,
    (match) => {
      hasChanges = true;
      return "from '@hl8/nestjs-fastify';";
    }
  );

  // 修复 @hl8/nestjs-fastify/config 导入
  content = content.replace(
    /from\s+['"]@hl8\/nestjs-fastify\/config['"];?/g,
    (match) => {
      hasChanges = true;
      return "from '@hl8/nestjs-fastify';";
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed @hl8/nestjs-fastify imports in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复 @hl8/nestjs-fastify 导入路径...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixNestjsFastifyImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
