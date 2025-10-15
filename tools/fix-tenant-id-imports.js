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

async function fixTenantIdImports(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 查找使用 TenantId 但未导入的文件
  if (
    content.includes("TenantId") &&
    !content.includes("import { TenantId }")
  ) {
    // 在文件顶部添加 TenantId 导入
    const lines = content.split("\n");
    let insertIndex = 0;

    // 找到最后一个 import 语句的位置
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith("import ")) {
        insertIndex = i + 1;
      }
    }

    // 在最后一个 import 后插入 TenantId 导入
    lines.splice(
      insertIndex,
      0,
      "import { TenantId } from '@hl8/isolation-model';",
    );
    content = lines.join("\n");
    hasChanges = true;
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed TenantId imports in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复 TenantId 导入问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixTenantIdImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
