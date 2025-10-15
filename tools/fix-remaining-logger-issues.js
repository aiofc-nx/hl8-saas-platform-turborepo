#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..");

async function getAllTsFiles(dir) {
  let files = [];
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(await getAllTsFiles(fullPath));
    } else if (
      item.isFile() &&
      extname(item.name) === ".ts" &&
      !item.name.endsWith(".d.ts")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixRemainingLoggerIssues(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 修复类型导入
  const typeLoggerImportRegex =
    /import type\s*{\s*Logger\s*}\s*from\s*['"]@nestjs\/common['"];?/g;

  if (typeLoggerImportRegex.test(content)) {
    content = content.replace(typeLoggerImportRegex, (match) => {
      hasChanges = true;
      return "import type { FastifyLoggerService } from '@hl8/nestjs-fastify';";
    });
  }

  // 修复 Logger 类型引用
  const loggerTypeRegex = /Logger\b(?!Service)/g;
  if (loggerTypeRegex.test(content)) {
    content = content.replace(loggerTypeRegex, (match) => {
      // 检查是否在类型上下文中
      const beforeMatch = content.substring(0, content.indexOf(match));
      const typeContext = beforeMatch.match(/(:|\?|\[|\]|,|\s)(Logger)\s*$/);
      const importContext = beforeMatch.match(/import.*Logger.*from/);

      if (typeContext || importContext) {
        hasChanges = true;
        return "FastifyLoggerService";
      }
      return match;
    });
  }

  // 修复 Logger 构造函数调用
  const loggerConstructorRegex =
    /new FastifyLoggerService\((['"][^'"]*['"])\)/g;
  if (loggerConstructorRegex.test(content)) {
    content = content.replace(loggerConstructorRegex, (match, context) => {
      hasChanges = true;
      return `new FastifyLoggerService({ context: ${context} })`;
    });
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed remaining Logger issues in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复剩余的 Logger 问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixRemainingLoggerIssues(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
