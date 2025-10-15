#!/usr/bin/env node

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, extname, dirname, relative } from "node:path";
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
 * 修复文件中的相对导入路径
 * @param {string} filePath
 */
async function fixImportsInFile(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 修复 import 语句中的相对路径
  content = content.replace(
    /(import\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // 如果路径已经有扩展名，跳过
      if (importPath.includes(".") && !importPath.endsWith("/")) {
        return match;
      }

      // 如果路径以 / 结尾，添加 index.js
      if (importPath.endsWith("/")) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }

      // 添加 .js 扩展名
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    },
  );

  // 修复 require 语句中的相对路径
  content = content.replace(
    /(require\\(['"])(\.{1,2}\/[^'"]*?)(['"]\\))/g,
    (match, prefix, importPath, suffix) => {
      // 如果路径已经有扩展名，跳过
      if (importPath.includes(".") && !importPath.endsWith("/")) {
        return match;
      }

      // 如果路径以 / 结尾，添加 index.js
      if (importPath.endsWith("/")) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }

      // 添加 .js 扩展名
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    },
  );

  // 修复 export 语句中的相对路径
  content = content.replace(
    /(export\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // 如果路径已经有扩展名，跳过
      if (importPath.includes(".") && !importPath.endsWith("/")) {
        return match;
      }

      // 如果路径以 / 结尾，添加 index.js
      if (importPath.endsWith("/")) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }

      // 添加 .js 扩展名
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    },
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed imports in: ${relative(REPO_ROOT, filePath)}`);
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 开始全面修复相对导入路径...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const tsFiles = await getAllTsFiles(hybridArchiPath);
  console.log(`📁 找到 ${tsFiles.length} 个 TypeScript 文件`);

  let fixedCount = 0;
  for (const file of tsFiles) {
    if (await fixImportsInFile(file)) {
      fixedCount++;
    }
  }

  console.log("\n🎉 修复完成！");
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${tsFiles.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${tsFiles.length - fixedCount}`);
}

main().catch(console.error);
