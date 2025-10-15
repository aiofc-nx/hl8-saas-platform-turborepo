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

async function replaceDomainLogger(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 检查是否是领域层文件
  const isDomainFile = filePath.includes('/domain/');
  if (!isDomainFile) {
    return false;
  }

  // 替换 FastifyLoggerService 导入
  const fastifyLoggerImportRegex = /import\s*{\s*FastifyLoggerService\s*}\s*from\s*['"]@hl8\/nestjs-fastify['"];?/g;
  
  if (fastifyLoggerImportRegex.test(content)) {
    content = content.replace(fastifyLoggerImportRegex, (match) => {
      hasChanges = true;
      return "import type { IPureLogger } from '@hl8/pure-logger';";
    });
  }

  // 替换 Logger 导入
  const loggerImportRegex = /import\s*{\s*Logger\s*}\s*from\s*['"]@nestjs\/common['"];?/g;
  
  if (loggerImportRegex.test(content)) {
    content = content.replace(loggerImportRegex, (match) => {
      hasChanges = true;
      return "import type { IPureLogger } from '@hl8/pure-logger';";
    });
  }

  // 替换 Logger 类型引用
  const loggerTypeRegex = /: FastifyLoggerService\b/g;
  if (loggerTypeRegex.test(content)) {
    content = content.replace(loggerTypeRegex, (match) => {
      hasChanges = true;
      return ': IPureLogger';
    });
  }

  // 替换 Logger 类型引用
  const loggerTypeRegex2 = /: Logger\b/g;
  if (loggerTypeRegex2.test(content)) {
    content = content.replace(loggerTypeRegex2, (match) => {
      hasChanges = true;
      return ': IPureLogger';
    });
  }

  // 替换构造函数调用
  const loggerConstructorRegex = /new FastifyLoggerService\(/g;
  if (loggerConstructorRegex.test(content)) {
    content = content.replace(loggerConstructorRegex, (match) => {
      hasChanges = true;
      return 'null as any // TODO: 注入 IPureLogger';
    });
  }

  const loggerConstructorRegex2 = /new Logger\(/g;
  if (loggerConstructorRegex2.test(content)) {
    content = content.replace(loggerConstructorRegex2, (match) => {
      hasChanges = true;
      return 'null as any // TODO: 注入 IPureLogger';
    });
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Updated domain logger in: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 替换领域层 Logger 为 @hl8/pure-logger...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  let fixedCount = 0;
  for (const file of files) {
    if (await replaceDomainLogger(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 更新了 ${fixedCount} 个领域层文件`);
}

main().catch(console.error);
