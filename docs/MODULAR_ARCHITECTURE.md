# HL8 SAAS Platform - 模块化架构方案

## 概述

本文档阐述了 HL8 SAAS Platform 的模块化架构方案，包括项目结构、TypeScript 配置要求和 ES 模块导入规范。本项目采用 Turborepo 管理的 Monorepo 架构，结合 Clean Architecture + CQRS + 事件溯源（ES）+ 事件驱动架构（EDA）的混合架构模式。

## 项目架构

### 整体架构图

```
hl8-saas-platform-turborepo/
├── apps/                          # 应用程序
│   ├── fastify-api/              # Fastify API 应用
│   └── [其他应用...]
├── libs/                          # 业务库和领域模块
│   ├── nestjs-fastify/           # Fastify 企业级基础设施
│   ├── database/                  # 数据库抽象层
│   ├── caching/                   # 缓存抽象层
│   ├── config/                    # 配置管理
│   ├── exceptions/                # 异常处理
│   ├── isolation-model/           # 多租户隔离模型
│   ├── nestjs-isolation/          # 多租户隔离实现
│   └── [其他业务库...]
├── packages/                      # 共享工具包
│   ├── typescript-config/         # TypeScript 配置
│   └── eslint-config/             # ESLint 配置
└── forks/                         # 第三方项目参考（不作为项目一部分）
```

### 架构原则

1. **领域驱动设计（DDD）**: 每个业务库代表一个独立的领域边界
2. **Clean Architecture**: 保持依赖方向从外向内
3. **微服务就绪**: 每个库都可以独立部署为微服务
4. **单一职责**: 每个模块只负责一个特定的业务领域
5. **高内聚低耦合**: 模块内部高内聚，模块间低耦合

## 模块化方案

### 1. 应用层（Apps）

**职责**: 应用程序入口，组合各种业务库

**特点**:

- 使用 Turborepo 管理
- 每个应用独立部署
- 组合多个业务库
- 提供统一的 API 接口

**示例**: `apps/fastify-api/`

```typescript
// 组合多个业务库
import { DatabaseModule } from "@hl8/database/index.js";
import { CachingModule } from "@hl8/caching/index.js";
import { FastifyLoggingModule } from "@hl8/nestjs-fastify/index.js";
```

### 2. 业务库层（Libs）

**职责**: 实现具体的业务逻辑和领域模型

**分类**:

#### 2.1 基础设施库

- `@hl8/nestjs-fastify`: Fastify 企业级基础设施
- `@hl8/database`: 数据库抽象层
- `@hl8/caching`: 缓存抽象层
- `@hl8/config`: 配置管理

#### 2.2 业务领域库

- `@hl8/exceptions`: 异常处理
- `@hl8/isolation-model`: 多租户隔离模型
- `@hl8/nestjs-isolation`: 多租户隔离实现

#### 2.3 共享工具库

- `@hl8/typescript-config`: TypeScript 配置
- `@hl8/eslint-config`: ESLint 配置

### 3. 包管理策略

**依赖关系**:

```
apps/fastify-api
├── @hl8/nestjs-fastify
├── @hl8/database
├── @hl8/caching
├── @hl8/config
└── @hl8/exceptions

@hl8/nestjs-fastify
├── @hl8/exceptions
├── @hl8/config
└── @hl8/nestjs-isolation

@hl8/nestjs-isolation
└── @hl8/isolation-model
```

## TypeScript 配置要求

### 1. 根配置（packages/typescript-config/）

#### base.json - 基础配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

#### nestjs.json - NestJS 应用配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "NestJS",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "incremental": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### 2. 应用配置（apps/\*/tsconfig.json）

```json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@hl8/nestjs-fastify": ["node_modules/@hl8/nestjs-fastify"],
      "@hl8/caching": ["node_modules/@hl8/caching"],
      "@hl8/database": ["node_modules/@hl8/database"],
      "@hl8/config": ["node_modules/@hl8/config"],
      "@hl8/exceptions": ["node_modules/@hl8/exceptions"]
    }
  }
}
```

### 3. 库配置（libs/\*/tsconfig.json）

```json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "./src",
    "outDir": "./dist",
    "paths": {
      "@hl8/config": ["node_modules/@hl8/config"],
      "@hl8/exceptions": ["node_modules/@hl8/exceptions"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

## ES 模块导入规范

### 1. 导入路径规范

#### 1.1 包导入（推荐）

```typescript
// ✅ 正确 - 使用明确的文件路径
import { DatabaseModule } from "@hl8/database/index.js";
import { CachingModule } from "@hl8/caching/index.js";
import { FastifyLoggerService } from "@hl8/nestjs-fastify/index.js";
```

#### 1.2 相对路径导入

```typescript
// ✅ 正确 - 项目内部相对路径
import { User } from "../entities/user.entity.js";
import { AppConfig } from "./config/app.config.js";
```

#### 1.3 避免的导入方式

```typescript
// ❌ 错误 - 目录导入（Node.js ES 模块不支持）
import { DatabaseModule } from "@hl8/database";
import { CachingModule } from "@hl8/caching";

// ❌ 错误 - 缺少文件扩展名
import { User } from "../entities/user.entity";
import { AppConfig } from "./config/app.config";
```

### 2. 包导出配置

#### 2.1 package.json 配置

```json
{
  "name": "@hl8/database",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./index.js": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

#### 2.2 关键配置说明

- `"type": "module"`: 启用 ES 模块
- `exports` 字段: 定义包的导出路径
- `./index.js` 路径: 支持明确的文件路径导入
- `types` 字段: 提供 TypeScript 类型定义

### 3. 构建配置

#### 3.1 NestJS 构建配置（nest-cli.json）

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "swc",
    "typeCheck": true,
    "assets": [],
    "watchAssets": false,
    "tsConfigPath": "tsconfig.build.json",
    "preserveWatchOutput": true,
    "webpack": false
  }
}
```

#### 3.2 构建脚本

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "build:swc": "swc src -d dist --strip-leading-paths && tsc --emitDeclarationOnly --outDir dist -p tsconfig.build.json",
    "clean": "rm -rf dist"
  }
}
```

## 开发规范

### 1. 代码组织

#### 1.1 文件命名

- 使用 kebab-case: `user.service.ts`
- 实体文件: `user.entity.ts`
- 配置文件: `app.config.ts`
- 测试文件: `user.service.spec.ts`

#### 1.2 目录结构

```
libs/database/src/
├── config/                 # 配置类
├── entities/              # 实体类
├── services/              # 服务类
├── decorators/            # 装饰器
├── exceptions/            # 异常类
├── types/                 # 类型定义
└── index.ts              # 统一导出
```

### 2. 导入顺序

```typescript
// 1. Node.js 内置模块
import { readFileSync } from "fs";

// 2. 第三方库
import { Injectable } from "@nestjs/common";
import { FastifyRequest } from "fastify";

// 3. 项目内部包
import { DatabaseModule } from "@hl8/database/index.js";
import { CachingModule } from "@hl8/caching/index.js";

// 4. 相对路径导入
import { User } from "../entities/user.entity.js";
import { AppConfig } from "./config/app.config.js";
```

### 3. 类型定义

#### 3.1 接口定义

```typescript
/**
 * 数据库配置接口
 *
 * @description 定义数据库连接的基本配置
 */
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
}
```

#### 3.2 类型导出

```typescript
// index.ts
export * from "./config/database.config.js";
export * from "./entities/user.entity.js";
export * from "./services/database.service.js";
```

## 常见问题和解决方案

### 1. ES 模块导入错误

**问题**: `ERR_UNSUPPORTED_DIR_IMPORT`

**原因**: Node.js ES 模块不支持从目录直接导入

**解决方案**:

```typescript
// ❌ 错误
import { DatabaseModule } from "@hl8/database";

// ✅ 正确
import { DatabaseModule } from "@hl8/database/index.js";
```

### 2. TypeScript 路径映射

**问题**: 构建后使用相对路径导入目录

**解决方案**:

1. 使用明确的文件路径导入
2. 配置正确的包导出路径
3. 确保所有包都正确构建

### 3. 配置验证错误

**问题**: 环境变量未正确映射到配置类

**解决方案**:

1. 检查环境变量前缀是否匹配
2. 确保配置类字段有正确的装饰器
3. 使用 `@Transform` 装饰器处理复杂映射

## 最佳实践

### 1. 模块设计

- 每个模块职责单一
- 接口设计清晰
- 依赖关系明确
- 易于测试和维护

### 2. 配置管理

- 使用类型安全的配置
- 支持多环境配置
- 提供合理的默认值
- 完整的验证机制

### 3. 错误处理

- 统一的异常处理
- 详细的错误信息
- 适当的日志记录
- 优雅的降级处理

### 4. 性能优化

- 使用 SWC 构建器
- 启用增量编译
- 合理的缓存策略
- 监控和指标收集

## 总结

本项目的模块化架构方案基于以下核心原则：

1. **清晰的模块边界**: 每个库都有明确的职责和边界
2. **ES 模块优先**: 使用现代 ES 模块系统，支持 Tree Shaking
3. **类型安全**: 完整的 TypeScript 类型支持
4. **微服务就绪**: 每个模块都可以独立部署
5. **开发体验**: 统一的配置和工具链

通过遵循这些规范和最佳实践，可以构建出高质量、可维护、可扩展的企业级应用系统。
