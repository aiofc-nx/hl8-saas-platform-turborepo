# @repo/ts-config

HL8 SAAS Platform 的共享 TypeScript 配置包。

## 概述

本包提供符合项目宪章（Constitution v1.4.1）的 TypeScript 配置，确保所有项目遵循统一的配置标准。

**核心要求**（来自宪章）：

- ✅ 使用 **NodeNext** 模块系统（服务端项目）
- ✅ 启用 **strict** 严格模式
- ✅ 目标版本 **ES2022**
- ✅ 强制模块检测
- ❌ 禁止使用 CommonJS（服务端项目）

## 可用配置

### 基础配置（base.json）

适用于所有 TypeScript 项目的基础配置。

**核心配置项**：

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "target": "ES2022",
  "moduleDetection": "force",
  "esModuleInterop": true,
  "allowSyntheticDefaultImports": true,
  "strict": true,
  "skipLibCheck": true
}
```

### NestJS 配置（nestjs.json）

适用于所有 NestJS 服务端项目。

**使用方法**：

```json
{
  "extends": "@repo/ts-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**NestJS 特定配置**：

- `emitDecoratorMetadata: true` - 装饰器元数据
- `experimentalDecorators: true` - 实验性装饰器
- `removeComments: true` - 移除注释
- `sourceMap: true` - 生成 Source Map
- `incremental: true` - 增量编译

### Next.js 配置（nextjs.json）

适用于 Next.js 前端项目。

**使用方法**：

```json
{
  "extends": "@repo/ts-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### React 库配置（react-library.json）

适用于 React 组件库和前端共享库。

**使用方法**：

```json
{
  "extends": "@repo/ts-config/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/ui/*": ["./src/*"]
    }
  }
}
```

## 编译工具策略（tsc + swc）

根据项目宪章的要求，所有服务端项目必须联合使用 tsc 和 swc：

### TypeScript (tsc) - 类型检查

- 用于严格的类型检查
- 生成类型声明文件（.d.ts）
- 在 CI/CD 中强制执行
- 使用 `--noEmit` 仅进行类型检查

### SWC - 快速编译

- 用于生产环境的快速代码编译
- 开发模式下的热重载
- 速度比 tsc 快 20-70 倍
- 不进行类型检查，纯粹的代码转换

### 构建脚本规范

所有服务端项目必须包含以下脚本：

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

**脚本说明**：

- `build`: 默认构建（tsc 编译 + 类型检查）
- `build:swc`: 生产环境构建（swc 快速编译 + tsc 类型检查）⚡
- `dev`: 开发模式（swc 热重载）🔥
- `type-check`: 独立的类型检查 ✅

### 性能收益

- **开发模式**：swc 热重载，毫秒级响应
- **生产构建**：总时间约为纯 tsc 的 30-50%
- **类型安全**：保持 100% 类型检查覆盖

## 配置继承规则

根据项目宪章的要求：

### ✅ 允许的配置覆盖

以下项目特定配置可以在子项目中自定义：

- `outDir` - 输出目录
- `baseUrl` - 基础路径
- `paths` - 路径映射
- `include` - 包含的文件
- `exclude` - 排除的文件

### ❌ 禁止覆盖的核心配置

以下核心配置**不允许**在子项目中覆盖（服务端项目）：

- `module` - 必须保持 "NodeNext"
- `moduleResolution` - 必须保持 "NodeNext"
- `target` - 必须保持 "ES2022"
- `strict` - 必须保持 true
- `moduleDetection` - 必须保持 "force"

## 服务端项目配置清单

### tsconfig.json 配置

- [ ] 继承 `@repo/ts-config/nestjs.json`
- [ ] 包含宪章要求的8个核心配置项（通过继承获得）
- [ ] 仅添加项目特定配置（paths、outDir等）
- [ ] 不覆盖核心配置项

### package.json 配置

- [ ] 添加 `"type": "module"`
- [ ] 添加 `"engines": { "node": ">=20" }`

### 代码规范

- [ ] 使用 ES 模块语法：`import` / `export`
- [ ] 禁止使用 `require()` / `module.exports`
- [ ] 文件扩展名使用 `.ts`（源文件）、`.mjs`（配置文件）

## 宪章合规性检查

本配置完全符合项目宪章 v1.4.1 的技术约束要求：

| 宪章要求 | base.json | nestjs.json | 状态 |
|---------|-----------|-------------|------|
| module: "NodeNext" | ✅ | ✅ (继承) | ✅ |
| moduleResolution: "NodeNext" | ✅ | ✅ (继承) | ✅ |
| target: "ES2022" | ✅ | ✅ (继承) | ✅ |
| moduleDetection: "force" | ✅ | ✅ (继承) | ✅ |
| esModuleInterop: true | ✅ | ✅ (继承) | ✅ |
| allowSyntheticDefaultImports: true | ✅ | ✅ (继承) | ✅ |
| strict: true | ✅ | ✅ (继承) | ✅ |
| skipLibCheck: true | ✅ | ✅ (继承) | ✅ |

## 配置修复记录

### 2025-10-11: 修复 nestjs.json 违反宪章的问题

**问题**：

- ❌ `"module": "commonjs"` - 违反宪章要求
- ❌ `"strictNullChecks": false` - 违反严格模式要求
- ❌ `"noImplicitAny": false` - 违反 any 类型使用原则

**修复**：

- ✅ 继承 `base.json`，获得所有宪章要求的核心配置
- ✅ 只保留 NestJS 特定配置（装饰器支持等）
- ✅ 移除所有违反宪章的配置项

## 参考资料

- [项目宪章](../../.specify/memory/constitution.md) - 查看完整的技术约束要求
- [TypeScript 配置说明](../../docs/ts-config.md) - 了解 NodeNext 的详细说明
- [TypeScript 官方文档](https://www.typescriptlang.org/tsconfig)

## 版本历史

- **v0.0.0** (2025-10-11): 初始版本，遵循宪章 v1.4.1
  - 使用 NodeNext 模块系统
  - 启用严格模式
  - 修复 nestjs.json 违反宪章的问题
