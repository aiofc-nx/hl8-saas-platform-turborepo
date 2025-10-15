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

  // 1. 修复相对导入路径，添加 .js 扩展名
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

  // 2. 修复 export ... from 语句中的相对路径
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

  // 3. 修复类型导入问题 - 将接口类型导入改为 type 导入
  content = content.replace(
    /import\s*{\s*([^}]*ILoggerService[^}]*)\s*}\s*from\s*['"][^'"]*['"];?/g,
    (match, imports) => {
      // 如果导入中包含 ILoggerService，将其改为 type 导入
      if (imports.includes('ILoggerService')) {
        hasChanges = true;
        return `import type { ${imports} } from '${match.match(/from\s*['"]([^'"]*)['"]/)?.[1] || ''}';`;
      }
      return match;
    }
  );

  // 4. 修复其他接口类型导入
  const interfaceTypes = [
    'IUserContext', 'IWebSocketContext', 'ICommandHandler', 'IQueryHandler',
    'IEventHandler', 'ISaga', 'IUseCase', 'IRepository', 'IAggregateRepository'
  ];

  for (const typeName of interfaceTypes) {
    const regex = new RegExp(
      `import\\s*{\\s*([^}]*${typeName}[^}]*)\\s*}\\s*from\\s*['"][^'"]*['"];?`,
      'g'
    );
    
    content = content.replace(regex, (match, imports) => {
      if (imports.includes(typeName)) {
        hasChanges = true;
        return `import type { ${imports} } from '${match.match(/from\s*['"]([^'"]*)['"]/)?.[1] || ''}';`;
      }
      return match;
    });
  }

  // 5. 修复 @hl8/nestjs-fastify 导入问题
  content = content.replace(
    /import\s*{\s*([^}]*FastifyRequest[^}]*)\s*}\s*from\s*['"]@hl8\/nestjs-fastify['"];?/g,
    (match, imports) => {
      hasChanges = true;
      return `import { ${imports} } from 'fastify';`;
    }
  );

  content = content.replace(
    /import\s*{\s*([^}]*FastifyReply[^}]*)\s*}\s*from\s*['"]@hl8\/nestjs-fastify['"];?/g,
    (match, imports) => {
      hasChanges = true;
      return `import { ${imports} } from 'fastify';`;
    }
  );

  // 6. 修复 @hl8/nestjs-fastify/logging 导入
  content = content.replace(
    /import\s*{\s*PinoLogger\s*}\s*from\s*['"]@hl8\/nestjs-fastify\/logging['"];?/g,
    () => {
      hasChanges = true;
      return `import { Logger } from '@nestjs/common';`;
    }
  );

  // 7. 修复 @hl8/nestjs-isolation 导入问题
  content = content.replace(
    /import\s*{\s*TenantContextService\s*}\s*from\s*['"]@hl8\/nestjs-isolation['"];?/g,
    () => {
      hasChanges = true;
      return `// import { TenantContextService } from '@hl8/nestjs-isolation'; // TODO: 需要实现`;
    }
  );

  // 8. 修复 @hl8/isolation-model 导入问题
  content = content.replace(
    /import\s*{\s*GeneralBadRequestException\s*}\s*from\s*['"]@hl8\/isolation-model['"];?/g,
    () => {
      hasChanges = true;
      return `import { BadRequestException } from '@nestjs/common';`;
    }
  );

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed: ${filePath.replace(REPO_ROOT, '.')}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 开始全面修复 hybrid-archi 模块问题...');
  
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
