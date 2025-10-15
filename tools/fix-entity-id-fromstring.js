#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..");

/**
 * 递归获取指定目录下所有 .ts 文件（非 .d.ts）
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
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

/**
 * 修复文件中 EntityId.fromString 调用
 * @param {string} filePath
 */
async function fixEntityIdFromString(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 替换 EntityId.fromString 为 EntityId.create
  const originalContent = content;
  content = content.replace(/EntityId\.fromString/g, "EntityId.create");

  if (content !== originalContent) {
    hasChanges = true;
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed EntityId.fromString in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 开始修复 EntityId.fromString 调用...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const hybridArchiFiles = await getAllTsFiles(hybridArchiPath);

  console.log(
    `📁 找到 ${hybridArchiFiles.length} 个 hybrid-archi TypeScript 文件`,
  );

  let fixedCount = 0;
  for (const file of hybridArchiFiles) {
    if (await fixEntityIdFromString(file)) {
      fixedCount++;
    }
  }

  console.log("\n🎉 修复完成！");
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${hybridArchiFiles.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${hybridArchiFiles.length - fixedCount}`);
}

main().catch(console.error);
