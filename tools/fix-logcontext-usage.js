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

async function fixLogContextUsage(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 检查是否是领域层文件
  const isDomainFile = filePath.includes("/domain/");

  // 如果使用了 LogContext，需要修复
  if (content.includes("LogContext.")) {
    // 移除 LogContext 导入
    const logContextImportRegex =
      /import type\s*{\s*LogContext\s*}\s*from\s*['"]@hl8\/nestjs-fastify['"];?\s*\n?/g;
    if (logContextImportRegex.test(content)) {
      content = content.replace(logContextImportRegex, "");
      hasChanges = true;
    }

    // 替换 LogContext.SYSTEM 等使用
    const logContextSystemRegex = /LogContext\.SYSTEM/g;
    if (logContextSystemRegex.test(content)) {
      content = content.replace(logContextSystemRegex, '{ context: "SYSTEM" }');
      hasChanges = true;
    }

    const logContextBusinessRegex = /LogContext\.BUSINESS/g;
    if (logContextBusinessRegex.test(content)) {
      content = content.replace(
        logContextBusinessRegex,
        '{ context: "BUSINESS" }',
      );
      hasChanges = true;
    }

    const logContextAuthRegex = /LogContext\.AUTH/g;
    if (logContextAuthRegex.test(content)) {
      content = content.replace(logContextAuthRegex, '{ context: "AUTH" }');
      hasChanges = true;
    }

    const logContextDatabaseRegex = /LogContext\.DATABASE/g;
    if (logContextDatabaseRegex.test(content)) {
      content = content.replace(
        logContextDatabaseRegex,
        '{ context: "DATABASE" }',
      );
      hasChanges = true;
    }

    // 修复 logger 方法调用参数
    // 将 logger.method(message, LogContext.SYSTEM, context) 改为 logger.method(message, { ...context, context: "SYSTEM" })
    const loggerMethodRegex =
      /(\w+)\.(log|debug|info|warn|error)\(\s*([^,]+),\s*{\s*context:\s*["']([^"']+)["']\s*},\s*(\{[^}]+\})\s*\)/g;
    content = content.replace(
      loggerMethodRegex,
      (match, logger, method, message, contextType, context) => {
        hasChanges = true;
        return `${logger}.${method}(${message}, { ...${context}, context: "${contextType}" })`;
      },
    );

    // 修复简单的 LogContext 使用
    const simpleLogContextRegex =
      /(\w+)\.(log|debug|info|warn|error)\(\s*([^,]+),\s*{\s*context:\s*["']([^"']+)["']\s*}\s*\)/g;
    content = content.replace(
      simpleLogContextRegex,
      (match, logger, method, message, contextType) => {
        hasChanges = true;
        return `${logger}.${method}(${message}, { context: "${contextType}" })`;
      },
    );
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed LogContext usage in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复 LogContext 使用问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixLogContextUsage(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
