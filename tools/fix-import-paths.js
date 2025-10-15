#!/usr/bin/env node

/**
 * 修复导入路径脚本
 *
 * 为所有相对导入添加 .js 扩展名
 */

const fs = require("fs");
const path = require("path");

// 配置
const SRC_DIR = path.join(__dirname, "../libs/saas-core/src");

/**
 * 处理单个文件
 */
function processFile(filePath) {
  console.log(`处理文件: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 修复相对导入路径，添加 .js 扩展名
  const importRegex = /import\s+.*?\s+from\s+["']([^"']+)["']/g;

  content = content.replace(importRegex, (match, importPath) => {
    // 只处理相对路径（以 ./ 或 ../ 开头）
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      // 如果已经有扩展名，跳过
      if (
        importPath.endsWith(".js") ||
        importPath.endsWith(".ts") ||
        importPath.endsWith(".json")
      ) {
        return match;
      }

      // 添加 .js 扩展名
      const newImportPath = importPath + ".js";
      modified = true;
      return match.replace(importPath, newImportPath);
    }

    return match;
  });

  // 保存文件
  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ 已更新: ${filePath}`);
  } else {
    console.log(`⏭️  无需更新: ${filePath}`);
  }
}

/**
 * 递归获取所有 TypeScript 文件
 */
function getAllTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (
        item.endsWith(".ts") &&
        !item.endsWith(".spec.ts") &&
        !item.endsWith(".test.ts")
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 主函数
 */
function main() {
  console.log("🔧 开始修复导入路径...\n");

  // 获取所有 TypeScript 文件
  const files = getAllTsFiles(SRC_DIR);

  console.log(`找到 ${files.length} 个文件\n`);

  // 处理每个文件
  files.forEach(processFile);

  console.log("\n✅ 修复完成！");
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { processFile, main };
