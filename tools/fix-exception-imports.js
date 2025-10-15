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

async function fixExceptionImports(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 替换 BadRequestException 导入
  if (content.includes("from '@hl8/isolation-model'")) {
    content = content.replace(
      /import\s*{[^}]*BadRequestException[^}]*}\s*from\s*'@hl8\/isolation-model';?/g,
      () => {
        hasChanges = true;
        return "import { BadRequestException } from '@nestjs/common';";
      }
    );
  }

  // 替换 EntityId 导入
  if (content.includes("from '../../../domain/value-objects.js'")) {
    content = content.replace(
      /import\s*{[^}]*EntityId[^}]*}\s*from\s*'\.\.\/\.\.\/\.\.\/domain\/value-objects\.js';?/g,
      () => {
        hasChanges = true;
        return "import { EntityId } from '@hl8/isolation-model';";
      }
    );
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed exception imports in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复异常类导入问题...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixExceptionImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
