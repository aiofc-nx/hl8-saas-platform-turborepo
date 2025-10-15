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

async function fixBadRequestExceptions(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 修复 BadRequestException 调用 - 简化为单参数
  const badRequestRegex =
    /throw new BadRequestException\(\s*'[^']*',\s*([^,]+),\s*\{[\s\S]*?\}\s*\)/g;

  content = content.replace(badRequestRegex, (match, message) => {
    hasChanges = true;
    return `throw new BadRequestException(${message.trim()})`;
  });

  // 修复 InternalServerErrorException 调用 - 简化为单参数
  const internalServerRegex =
    /throw new InternalServerErrorException\(\s*'[^']*',\s*([^,]+),\s*\{[\s\S]*?\}\s*\)/g;

  content = content.replace(internalServerRegex, (match, message) => {
    hasChanges = true;
    return `throw new InternalServerErrorException(${message.trim()})`;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed BadRequestException calls in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复 BadRequestException 调用...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixBadRequestExceptions(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
