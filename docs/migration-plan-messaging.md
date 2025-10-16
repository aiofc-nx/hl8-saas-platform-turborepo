# Messaging 模块迁移计划

## 📋 项目概述

本计划旨在将 `forks/messaging` 模块迁移到当前项目的 `libs/messaging` 目录下，并完成从 CommonJS 到 NodeNext 模块系统的转换，同时替换旧的基础设施依赖。

## 🎯 迁移目标

1. **模块系统升级**: CommonJS → NodeNext
2. **依赖关系更新**: 替换旧的基础设施模块
3. **架构集成**: 与当前项目架构完全兼容
4. **构建修复**: 解决 `hybrid-archi` 中的导入错误

## 📦 依赖映射表

| 旧依赖                          | 新依赖                 | 状态      | 说明       |
| ------------------------------- | ---------------------- | --------- | ---------- |
| `@hl8/cache`                    | `@hl8/caching`         | ✅ 已存在 | 缓存服务   |
| `@hl8/common` (EntityId)        | `@hl8/isolation-model` | ✅ 已存在 | 实体ID     |
| `@hl8/common` (ExceptionModule) | `@hl8/exceptions`      | ✅ 已存在 | 异常模块   |
| `@hl8/common` (异常类)          | `@hl8/exceptions`      | ✅ 已存在 | 异常处理   |
| `@hl8/config`                   | `@hl8/config`          | ✅ 已存在 | 配置管理   |
| `@hl8/logger`                   | `@hl8/nestjs-fastify`  | ✅ 已存在 | 日志服务   |
| `@hl8/multi-tenancy`            | `@hl8/isolation-model` | ✅ 已存在 | 多租户支持 |

## 🔄 迁移步骤

### Phase 1: 准备工作

#### 1.1 创建目标目录结构

```bash
mkdir -p libs/messaging/src
mkdir -p libs/messaging/tests
```

#### 1.2 复制核心文件

```bash
# 复制源码
cp -r forks/messaging/src/lib/* libs/messaging/src/
cp forks/messaging/src/index.ts libs/messaging/src/index.ts

# 复制配置文件
cp forks/messaging/tsconfig*.json libs/messaging/
cp forks/messaging/jest.config.ts libs/messaging/
cp forks/messaging/eslint.config.cjs libs/messaging/
```

### Phase 2: 模块系统转换

#### 2.1 更新 package.json

```json
{
  "name": "@hl8/messaging",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "@hl8/caching": "workspace:*",
    "@hl8/exceptions": "workspace:*",
    "@hl8/config": "workspace:*",
    "@hl8/nestjs-fastify": "workspace:*",
    "@hl8/isolation-model": "workspace:*",
    "@nestjs/common": "^11.1.6",
    "amqplib": "^0.10.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "ioredis": "^5.3.0",
    "kafkajs": "^2.2.4",
    "reflect-metadata": "^0.2.1",
    "tslib": "^2.3.0"
  }
}
```

#### 2.2 更新 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "tests", "**/*.spec.ts"]
}
```

### Phase 3: 依赖关系更新

#### 3.1 更新导入语句

**缓存服务更新**

```typescript
// 旧: import { CacheService } from '@hl8/cache';
// 新: import { CacheService } from '@hl8/caching';
```

**日志服务更新**

```typescript
// 旧: import { PinoLogger } from '@hl8/logger';
// 新: import { FastifyLoggerService } from '@hl8/nestjs-fastify';
```

**多租户服务更新**

```typescript
// 旧: import { TenantContextService, TenantIsolationService } from '@hl8/multi-tenancy';
// 新: import { TenantContextService, TenantIsolationService } from '@hl8/isolation-model';
```

**通用功能更新**

```typescript
// 1. EntityId 导入更新
// 旧: import { EntityId } from '@hl8/common';
// 新: import { EntityId } from '@hl8/isolation-model';

// 2. 异常处理更新
// 旧: import { ExceptionModule } from '@hl8/common';
// 新: import { ExceptionModule } from '@hl8/exceptions';

// 3. 异常类导入更新
// 旧: import { CustomException, ValidationException } from '@hl8/common';
// 新: import { CustomException, ValidationException } from '@hl8/exceptions';
```

#### 3.2 更新文件扩展名

```bash
# 将所有 .ts 文件中的相对导入添加 .js 扩展名
find libs/messaging/src -name "*.ts" -exec sed -i 's/from "\.\([^"]*\)";/from ".\1.js";/g' {} \;
find libs/messaging/src -name "*.ts" -exec sed -i 's/from "\.\.\/\([^"]*\)";/from "..\/\1.js";/g' {} \;
```

### Phase 4: 类型定义更新

#### 4.1 更新接口定义

```typescript
// 更新 MessagingService 接口
export interface IMessagingService {
  // 保持原有接口，更新内部实现
  publish<T = unknown>(
    topic: string,
    data: T,
    options?: PublishOptions,
  ): Promise<void>;
  subscribe<T = unknown>(
    topic: string,
    handler: MessageHandler<T>,
  ): Promise<void>;
  // ... 其他方法
}
```

#### 4.2 更新异常类

```typescript
// 确保异常类与新的日志服务兼容
export class MessagingConnectionException extends Error {
  constructor(message: string, context?: any) {
    super(message);
    this.name = "MessagingConnectionException";
  }
}
```

### Phase 5: 集成到 hybrid-archi

#### 5.1 更新 hybrid-archi 导入

```typescript
// 在 libs/hybrid-archi/src/infrastructure/adapters/message-queue/ 中
import { MessagingService } from "@hl8/messaging";
```

#### 5.2 修复基础设施模块

```typescript
// 更新 message-queue.adapter.ts
import { Injectable } from "@nestjs/common";
import { MessagingService } from "@hl8/messaging";
import { CacheService } from "@hl8/caching";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
```

### Phase 6: 测试和验证

#### 6.1 单元测试

```bash
cd libs/messaging
pnpm test
```

#### 6.2 构建测试

```bash
cd libs/messaging
pnpm build
```

#### 6.3 集成测试

```bash
cd libs/hybrid-archi
pnpm build
```

## 🔧 关键技术点

### 1. 模块解析策略

- 使用 `"moduleResolution": "NodeNext"`
- 所有相对导入必须包含 `.js` 扩展名
- 确保类型定义文件正确生成

### 2. 依赖注入更新

```typescript
// 更新构造函数参数类型
constructor(
  private readonly cacheService: CacheService, // @hl8/caching
  private readonly logger: FastifyLoggerService, // @hl8/nestjs-fastify
  private readonly tenantService: TenantContextService, // @hl8/isolation-model
) {}
```

### 3. 错误处理兼容性

```typescript
// 确保日志调用符合新接口
this.logger.error("Message failed", undefined, {
  error: error.message,
  context: additionalContext,
});
```

## 📊 迁移检查清单

- [ ] 创建目标目录结构
- [ ] 复制源码文件
- [ ] 更新 package.json (CommonJS → NodeNext)
- [ ] 更新 tsconfig.json
- [ ] 替换所有依赖导入
- [ ] 移除 `@hl8/common` 相关导入
- [ ] 更新异常处理导入为 `@hl8/exceptions`
- [ ] 添加 .js 扩展名到相对导入
- [ ] 更新类型定义
- [ ] 修复异常处理
- [ ] 更新 hybrid-archi 导入
- [ ] 运行单元测试
- [ ] 运行构建测试
- [ ] 验证集成功能

## 🚨 风险评估

### 高风险

- **类型不兼容**: 新模块的类型可能与旧版本不完全兼容
- **运行时错误**: 模块解析策略变更可能导致运行时错误

### 中风险

- **依赖冲突**: 多个模块使用不同版本的基础设施
- **构建失败**: tsconfig 配置不当导致构建失败

### 低风险

- **性能影响**: 模块系统变更对性能的影响
- **开发体验**: IDE 支持可能需要调整

## 📈 成功指标

1. **构建成功**: `pnpm build` 在所有相关模块中成功执行
2. **测试通过**: 所有单元测试和集成测试通过
3. **类型安全**: TypeScript 编译无错误
4. **功能完整**: 所有原有功能正常工作
5. **性能稳定**: 运行时性能无显著下降

## 🔄 回滚计划

如果迁移过程中遇到无法解决的问题：

1. **保留原文件**: 不删除 `forks/messaging` 目录
2. **版本控制**: 使用 Git 分支进行迁移工作
3. **快速回滚**: 可以快速切换到原始版本
4. **问题记录**: 记录所有遇到的问题和解决方案

## 📅 时间计划

| 阶段                         | 预计时间    | 负责人 |
| ---------------------------- | ----------- | ------ |
| Phase 1: 准备工作            | 30分钟      | -      |
| Phase 2: 模块系统转换        | 1小时       | -      |
| Phase 3: 依赖关系更新        | 2小时       | -      |
| Phase 4: 类型定义更新        | 1小时       | -      |
| Phase 5: 集成到 hybrid-archi | 1小时       | -      |
| Phase 6: 测试和验证          | 1小时       | -      |
| **总计**                     | **6.5小时** | -      |

---

_本文档将随着迁移进度持续更新_
