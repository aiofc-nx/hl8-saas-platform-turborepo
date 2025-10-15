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

async function fixTypeImports(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 修复接口类型导入 - 将 import { I... } 改为 import type { I... }
  const interfaceImportRegex =
    /import\s+\{\s*([^}]*I[A-Z][a-zA-Z]*[^}]*)\s*\}\s*from\s+['"][^'"]+\.js['"];?\s*$/gm;

  content = content.replace(interfaceImportRegex, (match, imports) => {
    // 检查是否只包含接口类型
    const interfaceTypes = [
      "I[A-Z][a-zA-Z]*",
      "I[A-Z][a-zA-Z]*Service",
      "I[A-Z][a-zA-Z]*Interface",
    ];
    const isInterfaceOnly = interfaceTypes.some((pattern) => {
      const regex = new RegExp(pattern, "g");
      const matches = imports.match(regex);
      return matches && matches.length > 0;
    });

    if (isInterfaceOnly) {
      hasChanges = true;
      return match.replace("import {", "import type {");
    }
    return match;
  });

  // 修复导出类型问题 - 将 export { Type } 改为 export type { Type }
  const typeExportRegex =
    /export\s+\{\s*([^}]*[A-Z][a-zA-Z]*[^}]*)\s*\}\s*from\s+['"][^'"]+['"];?\s*$/gm;

  content = content.replace(typeExportRegex, (match, exports) => {
    // 检查是否只包含类型
    const typePatterns = ["[A-Z][a-zA-Z]*", "I[A-Z][a-zA-Z]*"];
    const isTypeOnly = typePatterns.some((pattern) => {
      const regex = new RegExp(pattern, "g");
      const matches = exports.match(regex);
      return matches && matches.length > 0;
    });

    if (isTypeOnly) {
      hasChanges = true;
      return match.replace("export {", "export type {");
    }
    return match;
  });

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed type imports in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复类型导入问题...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixTypeImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
