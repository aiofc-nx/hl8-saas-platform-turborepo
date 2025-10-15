#!/usr/bin/env node

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..');

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
    } else if (item.isFile() && extname(item.name) === '.ts' && !item.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 修复文件中的导入问题
 * @param {string} filePath
 */
async function fixTenantImportsInFile(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 替换旧的基础设施模块引用
  const infrastructureMappings = [
    ['@hl8/logger', '@hl8/nestjs-fastify/logging'],
    ['@hl8/cache', '@hl8/caching'],
    ['@hl8/messaging', '@hl8/nestjs-fastify/messaging'],
    ['@hl8/config', '@hl8/nestjs-fastify/config'],
    ['@hl8/fastify-pro', '@hl8/nestjs-fastify'],
    ['@hl8/multi-tenancy', '@hl8/nestjs-isolation'],
    ['@hl8/common', '@hl8/isolation-model'],
  ];

  for (const [oldModule, newModule] of infrastructureMappings) {
    const importRegex = new RegExp(`(import\\s+[^'"]*from\\s+['"])${oldModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1${newModule}$2`);
      hasChanges = true;
    }
  }

  // 修复相对导入路径的 .js 扩展名
  content = content.replace(
    /(import\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // 如果路径已经有扩展名，跳过
      if (importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return match;
      }
      
      // 如果路径以 / 结尾，添加 index.js
      if (importPath.endsWith('/')) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }
      
      // 添加 .js 扩展名
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  // 修复 export ... from 语句中的相对路径
  content = content.replace(
    /(export\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      // 如果路径已经有扩展名，跳过
      if (importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return match;
      }
      
      // 如果路径以 / 结尾，添加 index.js
      if (importPath.endsWith('/')) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }
      
      // 添加 .js 扩展名
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed tenant imports in: ${relative(REPO_ROOT, filePath)}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 开始修复 saas-core 租户相关文件的导入问题...');
  
  const saasCorePath = join(REPO_ROOT, 'libs', 'saas-core', 'src');
  const tsFiles = await getAllTsFiles(saasCorePath);
  
  // 过滤出租户相关的文件
  const tenantFiles = tsFiles.filter(file => 
    file.includes('/tenant/') || 
    file.includes('/user/') || 
    file.includes('/organization/') || 
    file.includes('/department/') || 
    file.includes('/role/') || 
    file.includes('/permission/')
  );
  
  console.log(`📁 找到 ${tenantFiles.length} 个业务相关 TypeScript 文件`);

  let fixedCount = 0;
  for (const file of tenantFiles) {
    if (await fixTenantImportsInFile(file)) {
      fixedCount++;
    }
  }

  console.log('\n🎉 修复完成！');
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${tenantFiles.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${tenantFiles.length - fixedCount}`);
}

main().catch(console.error);
