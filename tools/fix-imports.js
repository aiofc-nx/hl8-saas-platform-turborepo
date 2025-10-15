#!/usr/bin/env node

import { readFile, writeFile, readdir, stat, access } from 'node:fs/promises';
import { join, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HYBRID_ARCHI_PATH = join(__dirname, '..', 'libs', 'hybrid-archi', 'src');

/**
 * 递归获取所有 TypeScript 文件
 */
async function getAllTsFiles(dir) {
  const files = [];
  const items = await readdir(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = await stat(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...await getAllTsFiles(fullPath));
    } else if (extname(item) === '.ts' && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 修复文件中的相对导入路径
 */
async function fixImportsInFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const dir = dirname(filePath);
  
  // 匹配相对导入路径的正则表达式
  const importRegex = /from\s+['"](\.\/[^'"]*?)['"]/g;
  const requireRegex = /require\s*\(\s*['"](\.\/[^'"]*?)['"]\s*\)/g;
  
  let newContent = content;
  let hasChanges = false;
  
  // 修复 import 语句
  newContent = newContent.replace(importRegex, (match, importPath) => {
    // 跳过已经有扩展名的路径
    if (extname(importPath)) {
      return match;
    }
    
    // 检查目标文件是否存在
    const targetPath = join(dir, importPath);
    const targetTsPath = targetPath + '.ts';
    const targetIndexPath = join(targetPath, 'index.ts');
    
    try {
      if (await access(targetTsPath).then(() => true).catch(() => false)) {
        hasChanges = true;
        return match.replace(importPath, importPath + '.js');
      } else if (await access(targetIndexPath).then(() => true).catch(() => false)) {
        hasChanges = true;
        return match.replace(importPath, importPath + '/index.js');
      }
    } catch (error) {
      // 如果无法检查文件存在性，添加 .js 扩展名
      hasChanges = true;
      return match.replace(importPath, importPath + '.js');
    }
    
    return match;
  });
  
  // 修复 require 语句（如果有的话）
  newContent = newContent.replace(requireRegex, (match, importPath) => {
    if (extname(importPath)) {
      return match;
    }
    
    hasChanges = true;
    return match.replace(importPath, importPath + '.js');
  });
  
  if (hasChanges) {
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`✅ Fixed imports in: ${relative(HYBRID_ARCHI_PATH, filePath)}`);
    return true;
  }
  
  return false;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始修复 hybrid-archi 中的相对导入路径...');
  
  try {
    const files = await getAllTsFiles(HYBRID_ARCHI_PATH);
    console.log(`📁 找到 ${files.length} 个 TypeScript 文件`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      const fixed = await fixImportsInFile(file);
      if (fixed) {
        fixedCount++;
      }
    }
    
    console.log(`\n🎉 修复完成！`);
    console.log(`📊 统计:`);
    console.log(`   - 总文件数: ${files.length}`);
    console.log(`   - 修复文件数: ${fixedCount}`);
    console.log(`   - 无需修复: ${files.length - fixedCount}`);
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
