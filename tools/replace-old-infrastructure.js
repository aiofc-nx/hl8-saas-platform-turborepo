#!/usr/bin/env node

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..");

/**
 * 旧基础设施模块到新基础设施模块的映射
 */
const INFRASTRUCTURE_MAPPING = {
  "@hl8/cache": "@hl8/caching",
  "@hl8/logger": "@hl8/nestjs-fastify/logging",
  "@hl8/messaging": "@hl8/nestjs-fastify/messaging",
  "@hl8/config": "@hl8/nestjs-fastify/config",
  "@hl8/fastify-pro": "@hl8/nestjs-fastify",
  "@hl8/multi-tenancy": "@hl8/nestjs-isolation",
  "@hl8/common": "@hl8/isolation-model",
};

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
 * 替换文件中的旧基础设施模块引用
 * @param {string} filePath
 */
async function replaceOldInfrastructureInFile(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 替换导入语句
  for (const [oldModule, newModule] of Object.entries(INFRASTRUCTURE_MAPPING)) {
    // 匹配 import ... from 'oldModule' 或 import ... from "oldModule"
    const importRegex = new RegExp(
      `(import\\s+[^'"]*from\\s+['"])${oldModule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"])`,
      "g",
    );
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1${newModule}$2`);
      hasChanges = true;
    }

    // 匹配 require('oldModule') 或 require("oldModule")
    const requireRegex = new RegExp(
      `(require\\(['"])${oldModule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"]\\))`,
      "g",
    );
    if (requireRegex.test(content)) {
      content = content.replace(requireRegex, `$1${newModule}$2`);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Updated infrastructure imports in: ${relative(REPO_ROOT, filePath)}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 开始替换旧基础设施模块引用...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const tsFiles = await getAllTsFiles(hybridArchiPath);
  console.log(`📁 找到 ${tsFiles.length} 个 TypeScript 文件`);

  let updatedCount = 0;
  for (const file of tsFiles) {
    if (await replaceOldInfrastructureInFile(file)) {
      updatedCount++;
    }
  }

  console.log("\n🎉 替换完成！");
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${tsFiles.length}`);
  console.log(`   - 更新文件数: ${updatedCount}`);
  console.log(`   - 无需更新: ${tsFiles.length - updatedCount}`);

  console.log("\n📋 映射关系:");
  for (const [oldModule, newModule] of Object.entries(INFRASTRUCTURE_MAPPING)) {
    console.log(`   ${oldModule} → ${newModule}`);
  }
}

main().catch(console.error);
