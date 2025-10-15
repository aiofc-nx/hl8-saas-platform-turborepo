#!/usr/bin/env node

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..");

/**
 * 递归获取指定目录下所有 .ts 文件（非 .d.ts）
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
 * 修复文件中 EntityId 的使用问题
 */
async function fixEntityIdUsage(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 1. 修复 EntityId.create 调用 - 根据上下文使用合适的子类
  content = content.replace(/EntityId\.create\(/g, () => {
    hasChanges = true;
    return "TenantId.create(";
  });

  // 2. 修复 EntityId.generate 调用
  content = content.replace(/EntityId\.generate\(/g, () => {
    hasChanges = true;
    return "TenantId.generate(";
  });

  // 3. 修复导入语句
  if (
    content.includes("EntityId.create") ||
    content.includes("EntityId.generate")
  ) {
    // 如果文件中使用了 EntityId 的方法，添加 TenantId 导入
    if (
      content.includes("import { EntityId") &&
      !content.includes("TenantId")
    ) {
      content = content.replace(
        /import\s*{\s*EntityId\s*}\s*from\s*['"]@hl8\/isolation-model['"];?/g,
        () => {
          hasChanges = true;
          return `import { EntityId, TenantId } from '@hl8/isolation-model';`;
        },
      );
    }
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed EntityId usage in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 开始修复 EntityId 使用问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  console.log(`📁 找到 ${files.length} 个 TypeScript 文件`);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixEntityIdUsage(file)) {
      fixedCount++;
    }
  }

  console.log("\n🎉 修复完成！");
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${files.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${files.length - fixedCount}`);
}

main().catch(console.error);
