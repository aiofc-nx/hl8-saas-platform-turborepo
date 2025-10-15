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

async function fixBrokenImports(filePath) {
  let content = await readFile(filePath, "utf-8");
  let hasChanges = false;

  // 修复被破坏的 import 语句
  const lines = content.split("\n");
  let newLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 检查是否是 import type 语句被破坏的情况
    if (
      line.includes("import type {") &&
      line.includes("import { TenantId }")
    ) {
      // 分离 type import 和 TenantId import
      const typeImportMatch = line.match(/import type \{([^}]+)\}/);
      const tenantIdMatch = line.match(
        /import \{ TenantId \} from '@hl8\/isolation-model';/,
      );

      if (typeImportMatch && tenantIdMatch) {
        newLines.push(`import type {${typeImportMatch[1]}}`);
        newLines.push(`import { TenantId } from '@hl8/isolation-model';`);
        hasChanges = true;
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }

    i++;
  }

  if (hasChanges) {
    content = newLines.join("\n");
    await writeFile(filePath, content);
    console.log(
      `✅ Fixed broken imports in: ${filePath.replace(REPO_ROOT, ".")}`,
    );
  }
  return hasChanges;
}

async function main() {
  console.log("🚀 修复被破坏的 import 语句...");

  const hybridArchiPath = join(REPO_ROOT, "libs", "hybrid-archi", "src");
  const files = await getAllTsFiles(hybridArchiPath);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixBrokenImports(file)) {
      fixedCount++;
    }
  }

  console.log(`📊 修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
