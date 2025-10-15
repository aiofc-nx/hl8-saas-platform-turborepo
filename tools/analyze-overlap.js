#!/usr/bin/env node

/**
 * 重叠内容分析工具
 *
 * 分析 hybrid-archi 和 isolation-model 之间的重叠内容
 * 生成详细的重叠分析报告
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 配置
const config = {
  hybridArchiPath: path.join(projectRoot, "libs/hybrid-archi/src"),
  isolationModelPath: path.join(projectRoot, "libs/isolation-model/src"),
  outputPath: path.join(projectRoot, "tools/overlap-analysis-detailed.md"),
};

/**
 * 递归获取目录下的所有文件
 */
function getAllFiles(dirPath, extensions = [".ts", ".js"]) {
  const files = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * 解析文件内容，提取类和接口定义
 */
function parseFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(projectRoot, filePath);

    const items = [];

    // 匹配类定义
    const classMatches = content.match(
      /export\s+(?:class|abstract class|interface|type|enum)\s+(\w+)/g,
    );
    if (classMatches) {
      for (const match of classMatches) {
        const name = match.replace(
          /export\s+(?:class|abstract class|interface|type|enum)\s+/,
          "",
        );
        items.push({
          type: "class",
          name,
          file: relativePath,
          content: match,
        });
      }
    }

    // 匹配值对象
    const valueObjectMatches = content.match(
      /export\s+class\s+(\w+)\s+extends\s+BaseValueObject/g,
    );
    if (valueObjectMatches) {
      for (const match of valueObjectMatches) {
        const name = match.replace(
          /export\s+class\s+(\w+)\s+extends\s+BaseValueObject/,
          "$1",
        );
        items.push({
          type: "value-object",
          name,
          file: relativePath,
          content: match,
        });
      }
    }

    // 匹配实体ID
    const entityIdMatches = content.match(
      /export\s+(?:class|type)\s+(EntityId|TenantId|UserId)/g,
    );
    if (entityIdMatches) {
      for (const match of entityIdMatches) {
        const name = match.replace(/export\s+(?:class|type)\s+/, "");
        items.push({
          type: "entity-id",
          name,
          file: relativePath,
          content: match,
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * 分析重叠内容
 */
function analyzeOverlap() {
  console.log("🔍 开始分析重叠内容...");

  // 获取所有文件
  const hybridFiles = getAllFiles(config.hybridArchiPath);
  const isolationFiles = getAllFiles(config.isolationModelPath);

  console.log(`📁 hybrid-archi: ${hybridFiles.length} 个文件`);
  console.log(`📁 isolation-model: ${isolationFiles.length} 个文件`);

  // 解析文件内容
  const hybridItems = [];
  const isolationItems = [];

  for (const file of hybridFiles) {
    hybridItems.push(...parseFileContent(file));
  }

  for (const file of isolationFiles) {
    isolationItems.push(...parseFileContent(file));
  }

  console.log(`📊 hybrid-archi: ${hybridItems.length} 个项目`);
  console.log(`📊 isolation-model: ${isolationItems.length} 个项目`);

  // 查找重叠
  const overlaps = [];

  for (const hybridItem of hybridItems) {
    const duplicate = isolationItems.find(
      (item) => item.name === hybridItem.name,
    );
    if (duplicate) {
      overlaps.push({
        name: hybridItem.name,
        type: hybridItem.type,
        hybridFile: hybridItem.file,
        isolationFile: duplicate.file,
        hybridContent: hybridItem.content,
        isolationContent: duplicate.content,
      });
    }
  }

  console.log(`⚠️  发现 ${overlaps.length} 个重叠项目`);

  return {
    hybridItems,
    isolationItems,
    overlaps,
  };
}

/**
 * 生成详细报告
 */
function generateReport(analysis) {
  const { overlaps, hybridItems, isolationItems } = analysis;

  let report = `# 重叠内容详细分析报告

**生成时间**: ${new Date().toISOString()}  
**分析工具**: analyze-overlap.js  

## 概览

- **hybrid-archi 项目数**: ${hybridItems.length}
- **isolation-model 项目数**: ${isolationItems.length}
- **重叠项目数**: ${overlaps.length}

## 重叠内容详情

`;

  if (overlaps.length === 0) {
    report += "✅ 未发现重叠内容\n";
  } else {
    for (const overlap of overlaps) {
      report += `### ${overlap.name} (${overlap.type})

**hybrid-archi 位置**: \`${overlap.hybridFile}\`
\`\`\`typescript
${overlap.hybridContent}
\`\`\`

**isolation-model 位置**: \`${overlap.isolationFile}\`
\`\`\`typescript
${overlap.isolationContent}
\`\`\`

**建议处理方案**:
- 如果两个实现完全相同，建议统一到 isolation-model
- 如果实现不同，需要评估哪个更符合业务需求
- 考虑将通用实现移到 hybrid-archi，业务特定实现保留在 isolation-model

---

`;
    }
  }

  report += `## 模块内容统计

### hybrid-archi 项目类型分布
`;

  const hybridTypes = {};
  for (const item of hybridItems) {
    hybridTypes[item.type] = (hybridTypes[item.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(hybridTypes)) {
    report += `- **${type}**: ${count} 个\n`;
  }

  report += `
### isolation-model 项目类型分布
`;

  const isolationTypes = {};
  for (const item of isolationItems) {
    isolationTypes[item.type] = (isolationTypes[item.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(isolationTypes)) {
    report += `- **${type}**: ${count} 个\n`;
  }

  report += `
## 建议

1. **立即处理重叠内容**: 重叠的 ${overlaps.length} 个项目需要明确归属
2. **建立清晰的模块边界**: 确保每个模块的职责明确
3. **统一命名规范**: 避免未来出现类似重叠
4. **文档化模块职责**: 为每个模块建立清晰的职责文档

## 下一步行动

1. 评估每个重叠项目的业务重要性
2. 决定保留哪个实现
3. 更新相关依赖和导入
4. 运行测试确保功能正常
`;

  return report;
}

/**
 * 主函数
 */
function main() {
  try {
    console.log("🚀 启动重叠内容分析工具...");

    const analysis = analyzeOverlap();
    const report = generateReport(analysis);

    // 写入报告文件
    fs.writeFileSync(config.outputPath, report, "utf-8");

    console.log(`📝 分析报告已生成: ${config.outputPath}`);
    console.log(`⚠️  发现 ${analysis.overlaps.length} 个重叠项目需要处理`);

    // 输出重叠项目列表
    if (analysis.overlaps.length > 0) {
      console.log("\n重叠项目列表:");
      for (const overlap of analysis.overlaps) {
        console.log(`- ${overlap.name} (${overlap.type})`);
      }
    }
  } catch (error) {
    console.error("❌ 分析过程中出现错误:", error);
    process.exit(1);
  }
}

// 运行主函数
main();
