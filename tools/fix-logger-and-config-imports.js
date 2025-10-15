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

async function fixLoggerAndConfigImports(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 修复 Logger 导入
  content = content.replace(
    /import\s+type\s*\{\s*Logger\s*\}\s+from\s+['"]@hl8\/nestjs-fastify['"];?/g,
    (match) => {
      hasChanges = true;
      return "import type { Logger } from '@nestjs/common';";
    }
  );

  content = content.replace(
    /import\s*\{\s*Logger\s*\}\s+from\s+['"]@hl8\/nestjs-fastify['"];?/g,
    (match) => {
      hasChanges = true;
      return "import { Logger } from '@nestjs/common';";
    }
  );

  // 修复 TypedConfigModule 导入
  content = content.replace(
    /import\s+type\s*\{\s*TypedConfigModule\s*\}\s+from\s+['"]@hl8\/nestjs-fastify['"];?/g,
    (match) => {
      hasChanges = true;
      return "import type { TypedConfigModule } from '@hl8/config';";
    }
  );

  content = content.replace(
    /import\s*\{\s*TypedConfigModule\s*\}\s+from\s+['"]@hl8\/nestjs-fastify['"];?/g,
    (match) => {
      hasChanges = true;
      return "import { TypedConfigModule } from '@hl8/config';";
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed Logger and TypedConfigModule imports in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复 Logger 和 TypedConfigModule 导入路径...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixLoggerAndConfigImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
