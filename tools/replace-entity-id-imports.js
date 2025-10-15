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
 * 修复文件中的 EntityId 导入问题
 * @param {string} filePath
 */
async function replaceEntityIdImportsInFile(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let hasChanges = false;

  // 替换相对路径的 EntityId 导入为 @hl8/isolation-model
  const entityIdImportRegex = /import\s+{\s*([^}]*EntityId[^}]*)\s*}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/domain\/value-objects\/entity-id\.js['"]/g;
  if (entityIdImportRegex.test(content)) {
    content = content.replace(entityIdImportRegex, (match, imports) => {
      hasChanges = true;
      return `import { ${imports} } from '@hl8/isolation-model'`;
    });
  }

  // 替换其他相对路径的 EntityId 导入
  const otherEntityIdImportRegex = /import\s+{\s*([^}]*EntityId[^}]*)\s*}\s+from\s+['"]\.\.\/[^'"]*entity-id\.js['"]/g;
  if (otherEntityIdImportRegex.test(content)) {
    content = content.replace(otherEntityIdImportRegex, (match, imports) => {
      hasChanges = true;
      return `import { ${imports} } from '@hl8/isolation-model'`;
    });
  }

  // 替换 export ... from 语句中的 EntityId
  const entityIdExportRegex = /export\s+{\s*([^}]*EntityId[^}]*)\s*}\s+from\s+['"]\.\.\/[^'"]*entity-id\.js['"]/g;
  if (entityIdExportRegex.test(content)) {
    content = content.replace(entityIdExportRegex, (match, exports) => {
      hasChanges = true;
      return `export { ${exports} } from '@hl8/isolation-model'`;
    });
  }

  if (hasChanges) {
    await writeFile(filePath, content);
    console.log(`✅ Fixed EntityId imports in: ${relative(REPO_ROOT, filePath)}`);
  }
  return hasChanges;
}

async function main() {
  console.log('🚀 开始替换 EntityId 导入...');
  
  const hybridArchiPath = join(REPO_ROOT, 'libs', 'hybrid-archi', 'src');
  const tsFiles = await getAllTsFiles(hybridArchiPath);
  
  console.log(`📁 找到 ${tsFiles.length} 个 TypeScript 文件`);

  let fixedCount = 0;
  for (const file of tsFiles) {
    if (await replaceEntityIdImportsInFile(file)) {
      fixedCount++;
    }
  }

  console.log('\n🎉 替换完成！');
  console.log(`📊 统计:`);
  console.log(`   - 总文件数: ${tsFiles.length}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 无需修复: ${tsFiles.length - fixedCount}`);
}

main().catch(console.error);
