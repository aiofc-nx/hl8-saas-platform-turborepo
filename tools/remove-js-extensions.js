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

async function removeJsExtensions(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 移除相对导入路径中的 .js 扩展名
  const jsImportRegex = /from\s+['"](\.[^'"]*?)\.js['"];?/g;

  content = content.replace(jsImportRegex, (match, path) => {
    hasChanges = true;
    return `from '${path}';`;
  });

  // 移除 export 语句中的 .js 扩展名
  const jsExportRegex = /from\s+['"](\.[^'"]*?)\.js['"];?/g;

  content = content.replace(jsExportRegex, (match, path) => {
    hasChanges = true;
    return `from '${path}';`;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Removed .js extensions in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 移除相对导入中的 .js 扩展名...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await removeJsExtensions(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
