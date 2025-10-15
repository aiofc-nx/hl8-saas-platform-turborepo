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

  // 检查是否是领域层文件
  const isDomainFile = filePath.includes('/domain/');
  
  // 1. 替换 FastifyLoggerService 导入
  const fastifyLoggerImportRegex = /import\s*{\s*FastifyLoggerService\s*}\s*from\s*['"]@hl8\/nestjs-fastify['"];?/g;
  
  if (fastifyLoggerImportRegex.test(content)) {
    content = content.replace(fastifyLoggerImportRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return "import type { IPureLogger } from '@hl8/pure-logger';";
      } else {
        return "import { FastifyLoggerService } from '@hl8/nestjs-fastify';";
      }
    });
  }

  // 2. 替换 Logger 导入
  const loggerImportRegex = /import\s*{\s*Logger\s*}\s*from\s*['"]@nestjs\/common['"];?/g;
  
  if (loggerImportRegex.test(content)) {
    content = content.replace(loggerImportRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return "import type { IPureLogger } from '@hl8/pure-logger';";
      } else {
        return "import { Logger } from '@nestjs/common';";
      }
    });
  }

  // 3. 替换类型引用
  const fastifyLoggerTypeRegex = /: FastifyLoggerService\b/g;
  if (fastifyLoggerTypeRegex.test(content)) {
    content = content.replace(fastifyLoggerTypeRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return ': IPureLogger';
      } else {
        return ': FastifyLoggerService';
      }
    });
  }

  const loggerTypeRegex = /: Logger\b/g;
  if (loggerTypeRegex.test(content)) {
    content = content.replace(loggerTypeRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return ': IPureLogger';
      } else {
        return ': Logger';
      }
    });
  }

  // 4. 替换构造函数调用
  const fastifyLoggerConstructorRegex = /new FastifyLoggerService\(/g;
  if (fastifyLoggerConstructorRegex.test(content)) {
    content = content.replace(fastifyLoggerConstructorRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return 'null as any // TODO: 注入 IPureLogger';
      } else {
        return 'new FastifyLoggerService(';
      }
    });
  }

  const loggerConstructorRegex = /new Logger\(/g;
  if (loggerConstructorRegex.test(content)) {
    content = content.replace(loggerConstructorRegex, (match) => {
      hasChanges = true;
      if (isDomainFile) {
        return 'null as any // TODO: 注入 IPureLogger';
      } else {
        return 'new Logger(';
      }
    });
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    const layer = isDomainFile ? 'domain' : 'application';
    console.log(`✅ Updated ${layer} layer logger in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 修复所有 Logger 导入问题...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixLoggerImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 更新了 ${fixedCount} 个文件`);
}

main().catch(console.error);
