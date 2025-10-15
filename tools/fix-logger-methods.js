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

async function fixLoggerMethods(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 替换 Logger 的方法调用
  content = content.replace(/\.setContext\(/g, () => {
    hasChanges = true;
    return ".debug("; // 临时使用 debug 方法
  });

  content = content.replace(/\.info\(/g, () => {
    hasChanges = true;
    return ".log("; // 使用 NestJS Logger 的 log 方法
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed Logger methods in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复 Logger 方法问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixLoggerMethods(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
