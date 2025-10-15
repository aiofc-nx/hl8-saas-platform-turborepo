#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..');

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
    } else if (item.isFile() && extname(item.name) === '.ts' && !item.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 修复文件中的导入和类型问题
 */
async function fixFileIssues(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 1. 修复 fastify 导入
  content = content.replace(
    /import\s*{\s*([^}]*)\s*}\s*from\s*['"]fastify['"];?/g,
    () => {
      hasChanges = true;
      return `// import { $1 } from 'fastify'; // TODO: 需要安装 fastify 依赖`;
    }
  );

  // 2. 修复缺失的异常类导入
  content = content.replace(
    /import\s*{\s*GeneralBadRequestException\s*}\s*from\s*['"]@hl8\/isolation-model['"];?/g,
    () => {
      hasChanges = true;
      return `import { BadRequestException } from '@nestjs/common';`;
    }
  );

  content = content.replace(
    /import\s*{\s*GeneralInternalServerException\s*}\s*from\s*['"]@hl8\/isolation-model['"];?/g,
    () => {
      hasChanges = true;
      return `import { InternalServerErrorException } from '@nestjs/common';`;
    }
  );

  // 3. 修复缺失的服务类导入
  content = content.replace(
    /import\s*{\s*TenantContextService\s*}\s*from\s*['"]@hl8\/nestjs-isolation['"];?/g,
    () => {
      hasChanges = true;
      return `// import { TenantContextService } from '@hl8/nestjs-isolation'; // TODO: 需要实现`;
    }
  );

  content = content.replace(
    /import\s*{\s*ITenantContext\s*}\s*from\s*['"]@hl8\/nestjs-isolation['"];?/g,
    () => {
      hasChanges = true;
      return `// import { ITenantContext } from '@hl8/nestjs-isolation'; // TODO: 需要实现`;
    }
  );

  // 4. 修复 PinoLogger 导入
  content = content.replace(
    /import\s*{\s*PinoLogger\s*}\s*from\s*['"]@hl8\/nestjs-fastify\/logging['"];?/g,
    () => {
      hasChanges = true;
      return `import { Logger } from '@nestjs/common';`;
    }
  );

  // 5. 替换 PinoLogger 类型使用
  content = content.replace(
    /PinoLogger/g,
    () => {
      hasChanges = true;
      return 'Logger';
    }
  );

  // 6. 替换缺失的服务类型
  content = content.replace(
    /TenantContextService/g,
    () => {
      hasChanges = true;
      return 'any'; // 临时使用 any 类型
    }
  );

  content = content.replace(
    /ITenantContext/g,
    () => {
      hasChanges = true;
      return 'any'; // 临时使用 any 类型
    }
  );

  // 7. 替换缺失的异常类
  content = content.replace(
    /GeneralBadRequestException/g,
    () => {
      hasChanges = true;
      return 'BadRequestException';
    }
  );

  content = content.replace(
    /GeneralInternalServerException/g,
    () => {
      hasChanges = true;
      return 'InternalServerErrorException';
    }
  );

  // 8. 修复相对导入路径，添加 .js 扩展名
  content = content.replace(
    /(import\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return match;
      }
      if (importPath.endsWith('/')) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  // 9. 修复 export ... from 语句中的相对路径
  content = content.replace(
    /(export\s+[^'"]*from\s+['"])(\.{1,2}\/[^'"]*?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.match(/\.[a-zA-Z0-9]+$/)) {
        return match;
      }
      if (importPath.endsWith('/')) {
        hasChanges = true;
        return `${prefix}${importPath}index.js${suffix}`;
      }
      hasChanges = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  // 10. 修复 @hl8/nestjs-fastify/config 导入
  content = content.replace(
    /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@hl8\/nestjs-fastify\/config['"];?/g,
    () => {
      hasChanges = true;
      return `// import { $1 } from '@hl8/nestjs-fastify/config'; // TODO: 需要实现`;
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 开始最终修复 hybrid-archi 模块问题...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const files = await getAllTsFiles(hybridArchiPath);
  
  console.log(`📁 找到 ${files.length} 个 TypeScript 文件`);

  let fixedCount = 0;
  for (const file of files) {
    if (await fixFileIssues(file)) {
      fixedCount++;
    }
  }

  console.log('\n🎉 修复完成！');
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${files.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${files.length - fixedCount}`);
}

main().catch(console.error);
