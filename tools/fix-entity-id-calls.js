#!/usr/bin/env node

/**
 * 修复 EntityId 方法调用脚本
 * 
 * 将 EntityId.fromString() 和 EntityId.generate() 调用替换为正确的具体类型调用
 */

const fs = require('fs');
const path = require('path');

// 配置
const SRC_DIR = path.join(__dirname, '../libs/saas-core/src');

// 替换规则
const REPLACEMENTS = [
  // 租户相关
  {
    pattern: /EntityId\.fromString\(([^)]+)\)/g,
    replacement: (match, param) => {
      // 根据上下文判断类型
      const context = match.replace(/EntityId\.fromString\([^)]+\)/, '');
      if (context.includes('tenant') || context.includes('Tenant')) {
        return `TenantId.create(${param})`;
      }
      if (context.includes('user') || context.includes('User')) {
        return `UserId.create(${param})`;
      }
      if (context.includes('organization') || context.includes('Organization')) {
        return `OrganizationId.create(${param})`;
      }
      if (context.includes('department') || context.includes('Department')) {
        return `DepartmentId.create(${param})`;
      }
      // 默认使用 EntityId（如果无法判断）
      return `EntityId.create(${param})`;
    }
  },
  {
    pattern: /EntityId\.generate\(\)/g,
    replacement: (match) => {
      // 根据上下文判断类型
      const context = match.replace(/EntityId\.generate\(\)/, '');
      if (context.includes('tenant') || context.includes('Tenant')) {
        return `TenantId.generate()`;
      }
      if (context.includes('user') || context.includes('User')) {
        return `UserId.generate()`;
      }
      if (context.includes('organization') || context.includes('Organization')) {
        return `OrganizationId.generate()`;
      }
      if (context.includes('department') || context.includes('Department')) {
        return `DepartmentId.generate()`;
      }
      // 默认使用 TenantId（最常见的情况）
      return `TenantId.generate()`;
    }
  }
];

// 需要添加的导入
const IMPORT_MAP = {
  'TenantId': '@hl8/isolation-model',
  'UserId': '@hl8/isolation-model', 
  'OrganizationId': '@hl8/isolation-model',
  'DepartmentId': '@hl8/isolation-model',
  'EntityId': '@hl8/isolation-model'
};

/**
 * 处理单个文件
 */
function processFile(filePath) {
  console.log(`处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 应用替换规则
  REPLACEMENTS.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  // 检查是否需要添加导入
  const needsImports = [];
  if (content.includes('TenantId.')) needsImports.push('TenantId');
  if (content.includes('UserId.')) needsImports.push('UserId');
  if (content.includes('OrganizationId.')) needsImports.push('OrganizationId');
  if (content.includes('DepartmentId.')) needsImports.push('DepartmentId');
  
  // 添加缺失的导入
  needsImports.forEach(typeName => {
    const importPath = IMPORT_MAP[typeName];
    const importStatement = `import { ${typeName} } from "${importPath}";`;
    
    // 检查是否已经导入
    if (!content.includes(importStatement) && !content.includes(`import { ${typeName}`)) {
      // 在最后一个 import 语句后添加
      const importRegex = /import\s+.*?from\s+["'][^"']+["'];?\s*\n/g;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertIndex) + importStatement + '\n' + content.slice(insertIndex);
        modified = true;
      }
    }
  });
  
  // 保存文件
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
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
      } else if (item.endsWith('.ts') && !item.endsWith('.spec.ts') && !item.endsWith('.test.ts')) {
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
  console.log('🔧 开始修复 EntityId 方法调用...\n');
  
  // 获取所有 TypeScript 文件
  const files = getAllTsFiles(SRC_DIR);
  
  console.log(`找到 ${files.length} 个文件\n`);
  
  // 处理每个文件
  files.forEach(processFile);
  
  console.log('\n✅ 修复完成！');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { processFile, main };
