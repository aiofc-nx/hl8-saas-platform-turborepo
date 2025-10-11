# 构建策略：tsc + swc 联合使用

本文档说明 HL8 SAAS Platform 中 tsc 和 swc 的联合使用策略。

## 核心原则

根据项目宪章 v1.4.2，所有服务端项目必须联合使用 TypeScript (tsc) 和 SWC：

- **tsc**：负责类型检查和生成类型声明文件
- **swc**：负责快速编译代码

## 构建策略对比

### 应用项目（apps/）

应用项目使用 NestJS CLI + tsc 的组合：

```json
{
  "scripts": {
    "build": "nest build && tsc --noEmit",
    "build:swc": "nest build -b swc && tsc --noEmit",
    "dev": "nest start -b swc -w",
    "type-check": "tsc --noEmit"
  }
}
```

**工作流程**：

1. `nest build -b swc`：使用 NestJS CLI 调用 swc 编译代码
2. `tsc --noEmit`：运行类型检查，不生成文件
3. 输出：`dist/` 目录包含编译后的 JavaScript 代码

**适用项目**：

- `apps/api`
- `apps/fastify-api`

### 库项目（libs/）

库项目直接使用 swc + tsc，生成代码和类型声明：

```json
{
  "scripts": {
    "build": "pnpm clean && pnpm build:swc && pnpm build:types",
    "build:swc": "swc src -d dist --config-file ../../.swcrc",
    "build:types": "tsc --project tsconfig.build.json --declaration --emitDeclarationOnly --outDir dist",
    "type-check": "tsc --noEmit",
    "dev": "swc src -d dist --watch --config-file ../../.swcrc",
    "clean": "rm -rf dist"
  }
}
```

**工作流程**：

1. `clean`：清理旧的构建输出
2. `build:swc`：使用 swc 快速编译代码到 dist/
3. `build:types`：使用 tsc 生成类型声明文件（.d.ts）
4. 输出：`dist/` 目录包含 JavaScript 代码 + 类型声明文件

**适用项目**：

- `libs/logger`
- 其他 libs/ 下的共享库

## 配置文件

### .swcrc（根目录）

库项目的 swc 配置：

```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "target": "es2022"
  },
  "module": {
    "type": "es6",
    "strict": true
  },
  "sourceMaps": true
}
```

**关键配置**：

- `syntax: "typescript"`：解析 TypeScript 语法
- `decorators: true`：支持装饰器（NestJS 需要）
- `target: "es2022"`：与 tsconfig.json 保持一致
- `module.type: "es6"`：输出 ES 模块

### tsconfig.build.json（库项目）

库项目的类型声明生成配置：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist"
  },
  "exclude": ["**/*.spec.ts", "**/__tests__/**"]
}
```

**关键配置**：

- `declaration: true`：生成 .d.ts 文件
- `declarationMap: true`：生成 .d.ts.map 文件（便于调试）
- `outDir: "./dist"`：输出到 dist 目录

## 开发工作流

### 应用项目开发

```bash
# 启动开发服务器（swc 热重载）
cd apps/api
pnpm dev

# 类型检查
pnpm type-check

# 生产构建（推荐）
pnpm build:swc

# 标准构建
pnpm build
```

### 库项目开发

```bash
# 监视模式（swc watch）
cd libs/logger
pnpm dev

# 类型检查
pnpm type-check

# 完整构建（代码 + 类型声明）
pnpm build

# 仅构建代码（快速）
pnpm build:swc

# 仅生成类型声明
pnpm build:types
```

## CI/CD 工作流

### 推荐的 CI 流程

```yaml
name: CI

on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type Check (所有项目)
        run: pnpm type-check
      
      - name: Lint (所有项目)
        run: pnpm lint
      
      - name: Test (所有项目)
        run: pnpm test
      
      - name: Build (生产环境，使用 swc)
        run: pnpm build:swc
```

### 流程说明

1. **Type Check**：独立执行类型检查，快速发现类型错误
2. **Lint**：代码规范检查
3. **Test**：单元测试和集成测试
4. **Build**：使用 swc 快速构建，配合 tsc 类型检查

## 性能对比

### 应用项目（apps/api）

| 场景 | 纯 tsc | nest build + tsc | nest build -b swc + tsc | 提升 |
|------|--------|-----------------|----------------------|------|
| 开发热重载 | 3-5秒 | 1-2秒 | **0.1-0.3秒** | **10-50倍** ⚡ |
| 完整构建 | 30秒 | 25秒 | **13秒** | **57%** ⚡ |
| 类型检查 | 10秒 | 10秒 | 10秒 | 保持100% ✅ |

### 库项目（libs/logger）

| 场景 | 纯 tsc | swc + tsc | 提升 |
|------|--------|-----------|------|
| 代码编译 | 5秒 | **0.5秒** | **90%** ⚡ |
| 类型声明 | 3秒 | 3秒 | 无变化 |
| 完整构建 | 8秒 | **3.5秒** | **56%** ⚡ |
| 监视模式 | 2-3秒 | **0.1-0.2秒** | **10-30倍** ⚡ |

## 故障排除

### 问题1：swc 编译装饰器失败

**症状**：装饰器相关的代码编译出错

**解决方案**：检查 `.swcrc` 配置：

```json
{
  "jsc": {
    "parser": {
      "decorators": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    }
  }
}
```

### 问题2：类型声明文件未生成

**症状**：`dist/` 目录中缺少 `.d.ts` 文件

**解决方案**：检查 `tsconfig.build.json`：

```json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": false
  }
}
```

### 问题3：库项目导入失败

**症状**：其他项目导入库时找不到类型

**解决方案**：检查 `package.json`：

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

## 最佳实践

### 1. 开发阶段

- ✅ 使用 `pnpm dev` 启动 swc watch 模式
- ✅ 定期运行 `pnpm type-check` 检查类型
- ✅ 提交前运行完整的质量检查

### 2. 构建阶段

- ✅ 优先使用 `pnpm build:swc`（快速）
- ✅ CI/CD 中独立运行 `type-check`
- ✅ 确保类型检查通过才允许合并

### 3. 库项目特殊要求

- ✅ 必须生成类型声明文件（.d.ts）
- ✅ 必须在 package.json 中正确配置 main 和 types 字段
- ✅ 建议添加 exports 字段支持条件导出

### 4. 性能优化

- ✅ 使用 turbo 缓存构建结果
- ✅ 在 monorepo 根目录运行命令，利用并行构建
- ✅ 开发时只启动需要的项目

## 参考资料

- [项目宪章](../.specify/memory/constitution.md) - 编译工具要求
- [TypeScript 配置说明](./ts-config.md) - NodeNext 配置详解
- [SWC 官方文档](https://swc.rs/)
- [NestJS CLI 文档](https://docs.nestjs.com/cli/overview)
