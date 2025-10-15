# 下一步：创建 Fastify 专用模块（方案 2）

**日期**: 2025-10-11  
**目标**: 创建 `@hl8/nestjs-fastify` - Fastify 专用的企业级基础设施模块  
**原因**: 解决 Fastify 适配器的兼容性问题，充分利用 Fastify 的高性能特性

---

## 🎯 为什么需要 Fastify 专用版本？

### 当前问题

| 模块                | 问题                     | 影响               |
| ------------------- | ------------------------ | ------------------ |
| **ExceptionModule** | `.status()` vs `.code()` | 异常响应失败       |
| **LoggingModule**   | HttpAdapterHost 时机     | 启动失败（静默）   |
| **通用设计**        | 偏向 Express             | Fastify 特性未利用 |

### Fastify vs Express 的关键差异

| 特性             | Express            | Fastify          | 影响          |
| ---------------- | ------------------ | ---------------- | ------------- |
| **Response API** | `.status().send()` | `.code().send()` | ✅ 已修复     |
| **Logger**       | 需要集成           | 内置 Pino        | ⚠️ 未充分利用 |
| **Schema 验证**  | 手动               | 内置 JSON Schema | ⚠️ 未使用     |
| **插件系统**     | 中间件             | Fastify 插件     | ⚠️ 未优化     |
| **性能**         | 中等               | 极高             | ⚠️ 未充分发挥 |

---

## 📋 新项目规划：@hl8/nestjs-fastify

### 项目定位

**名称**: `@hl8/nestjs-fastify`  
**定位**: Fastify 专用的企业级基础设施模块  
**继承**: 复用 `@hl8/nestjs-infra` 的 80% 代码  
**优化**: 专门为 Fastify 优化的 20% 适配层

---

## 🏗️ 架构设计

### 分层结构

```
@hl8/nestjs-fastify (Fastify 专用)
    ├── core/                   ← 复用 @hl8/nestjs-infra/shared
    │   ├── entities/
    │   ├── value-objects/
    │   ├── enums/
    │   └── types/
    │
    ├── exceptions/              ← Fastify 专用异常过滤器
    │   ├── filters/
    │   │   ├── fastify-http-exception.filter.ts  ← 使用 .code()
    │   │   └── fastify-any-exception.filter.ts
    │   └── core/               ← 复用 AbstractHttpException
    │
    ├── logging/                 ← Fastify Pino 原生集成
    │   ├── fastify-logger.service.ts  ← 直接使用 Fastify 的 Pino
    │   └── logger.module.ts    ← 简化的模块
    │
    ├── caching/                 ← 复用 100%
    │   └── (直接复用 @hl8/nestjs-infra/caching)
    │
    ├── isolation/               ← 复用 100%
    │   └── (直接复用 @hl8/nestjs-infra/isolation)
    │
    ├── configuration/           ← 复用 100%
    │   └── (直接复用 @hl8/nestjs-infra/configuration)
    │
    └── fastify/                 ← Fastify 专用适配器
        └── enterprise-fastify.adapter.ts  ← 优化的适配器
```

---

## 🔄 复用策略

### 可以 100% 复用的模块（~70%）

这些模块与适配器无关，可以直接复用：

1. **shared/** - 值对象、实体、枚举、类型
2. **caching/** - Redis 缓存服务
3. **isolation/** - 数据隔离服务
4. **configuration/** - 配置管理

**方式**: 通过 `pnpm workspace` 依赖 `@hl8/nestjs-infra`

---

### 需要适配的模块（~30%）

这些模块与 HTTP 适配器相关，需要 Fastify 专用版本：

#### 1. ExceptionModule（Fastify 版）

**关键差异**:

```typescript
// @hl8/nestjs-infra (通用)
response.status(500).send(...)  // ❌ Express 风格

// @hl8/nestjs-fastify (Fastify 专用)
response.code(500).send(...)    // ✅ Fastify 风格
```

**文件**:

- `exceptions/filters/fastify-http-exception.filter.ts`
- `exceptions/filters/fastify-any-exception.filter.ts`

**复用**: `exceptions/core/` 100% 复用

---

#### 2. LoggingModule（Fastify 版）

**关键优化**:

```typescript
// @hl8/nestjs-infra (通用)
// 需要检测 HttpAdapterHost，可能有时机问题

// @hl8/nestjs-fastify (Fastify 专用)
// 直接使用 Fastify 内置的 Pino，无需检测
export class FastifyLoggerService {
  constructor(
    @Inject(HTTP_ADAPTER_HOST)
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    // 直接获取 Fastify 的 Pino 实例
    const fastifyInstance = this.httpAdapterHost.httpAdapter.getInstance();
    this.logger = fastifyInstance.log;
  }
}
```

**优势**: 零配置，直接使用 Fastify 的 Pino

---

#### 3. EnterpriseFastifyAdapter（优化版）

**当前问题**: 插件冲突

**Fastify 专用优化**:

- 使用 Fastify 原生插件系统
- 避免重复注册
- 利用 Fastify 的高性能特性

---

## 📦 项目结构

### 新项目：@hl8/nestjs-fastify

```
libs/nestjs-fastify/
├── package.json
│   └── dependencies:
│       └── "@hl8/nestjs-infra": "workspace:*"  ← 复用核心
│
├── src/
│   ├── index.ts                 ← 导出 Fastify 专用 API
│   │
│   ├── exceptions/               ← Fastify 专用
│   │   ├── filters/
│   │   │   ├── fastify-http-exception.filter.ts
│   │   │   └── fastify-any-exception.filter.ts
│   │   └── exception.module.ts
│   │
│   ├── logging/                  ← Fastify 专用
│   │   ├── fastify-logger.service.ts
│   │   └── logging.module.ts
│   │
│   ├── fastify/                  ← Fastify 适配器
│   │   └── enterprise-fastify.adapter.ts
│   │
│   └── core/                     ← 导出复用的模块
│       ├── index.ts              ← 重新导出 @hl8/nestjs-infra
│       ├── caching.ts            ← export * from '@hl8/nestjs-infra/caching'
│       ├── isolation.ts          ← export * from '@hl8/nestjs-infra/isolation'
│       └── configuration.ts      ← export * from '@hl8/nestjs-infra/configuration'
│
└── README.md
```

---

## 🚀 实施计划

### Phase 1: 项目初始化（1-2 小时）

1. 创建 `libs/nestjs-fastify` 目录
2. 配置 `package.json`（依赖 `@hl8/nestjs-infra`）
3. 配置 TypeScript, ESLint, Jest
4. 创建基础结构

### Phase 2: Fastify 专用异常处理（2-3 小时）

1. 创建 `FastifyHttpExceptionFilter`
   - 使用 `.code()` 替代 `.status()`
   - 正确处理 Fastify Reply 对象

2. 创建 `FastifyAnyExceptionFilter`
   - 全局兜底异常处理

3. 创建 `FastifyExceptionModule`
   - 自动注册 Fastify 专用过滤器

4. 单元测试

### Phase 3: Fastify 专用日志模块（1-2 小时）

1. 创建 `FastifyLoggerService`
   - 直接使用 Fastify 内置 Pino
   - 无需 HttpAdapterHost 检测

2. 创建 `FastifyLoggingModule`
   - 简化的模块设计

3. 单元测试

### Phase 4: 导出复用模块（30 分钟）

1. 重新导出 `@hl8/nestjs-infra` 的可复用模块：
   - CachingModule
   - IsolationModule
   - ConfigurationModule
   - Shared 模块

### Phase 5: Fastify 适配器优化（2-3 小时）

1. 优化 `EnterpriseFastifyAdapter`
   - 使用 Fastify 原生插件
   - 避免重复注册
   - 利用 Fastify 特性

2. 测试和文档

### Phase 6: 集成测试（1-2 小时）

1. 在 `apps/fastify-api` 中测试
2. 验证所有功能
3. 性能测试

---

## 📊 预期成果

### 代码复用率

- **核心逻辑**: 100% 复用（entities, value-objects, services）
- **适配层**: 20% 新开发（filters, logger wrapper）
- **总体**: ~80% 复用

### 性能提升

- **日志**: 零开销（直接使用 Fastify Pino）
- **异常**: 更快的响应处理
- **整体**: 充分发挥 Fastify 性能

### 维护性

- **模块分离**: Fastify 专用 vs 通用
- **清晰职责**: 适配器明确
- **易于维护**: 代码简洁

---

## 💡 关键设计决策

### 1. 依赖关系

```
@hl8/nestjs-fastify
    ↓ depends on
@hl8/nestjs-infra
    ↓ provides
core business logic (isolation, caching, config, shared)
```

### 2. 导出策略

```typescript
// libs/nestjs-fastify/src/index.ts
export {
  // Fastify 专用
  FastifyExceptionModule,
  FastifyLoggingModule,
  EnterpriseFastifyAdapter,

  // 从 @hl8/nestjs-infra 复用
  CachingModule,
  IsolationModule,
  TypedConfigModule,

  // Shared
  EntityId,
  IsolationContext,
  IsolationLevel,
  DataSharingLevel,
} from "./core/index.js";
```

### 3. 适配器优化

```typescript
// 利用 Fastify 特性
export class EnterpriseFastifyAdapter extends FastifyAdapter {
  async init() {
    await super.init();

    const fastify = this.getInstance();

    // 使用 Fastify 原生插件系统（避免冲突）
    fastify.register(require("@fastify/cors"), {});
    fastify.register(require("@fastify/helmet"), {});

    // 直接访问 Fastify 的 Pino
    const logger = fastify.log;
  }
}
```

---

## 📝 文件清单（预计）

### 新增文件（~15 个）

```
libs/nestjs-fastify/
├── package.json                                          ← 1
├── tsconfig.json, eslint.config.mjs, jest.config.ts     ← 3
├── README.md                                             ← 1
├── src/
│   ├── index.ts                                          ← 1
│   ├── exceptions/
│   │   ├── filters/
│   │   │   ├── fastify-http-exception.filter.ts          ← 1
│   │   │   └── fastify-any-exception.filter.ts           ← 1
│   │   └── exception.module.ts                           ← 1
│   ├── logging/
│   │   ├── fastify-logger.service.ts                     ← 1
│   │   └── logging.module.ts                             ← 1
│   ├── fastify/
│   │   └── enterprise-fastify.adapter.ts                 ← 1
│   └── core/
│       └── index.ts (re-exports)                         ← 1
└── __tests__/                                            ← 3-5 测试文件
```

**预计**: ~15-20 个文件，~800-1000 行代码

---

## ⏱️ 时间估算

| Phase       | 任务             | 预计时间      |
| ----------- | ---------------- | ------------- |
| **Phase 1** | 项目初始化       | 1-2 h         |
| **Phase 2** | Fastify 异常处理 | 2-3 h         |
| **Phase 3** | Fastify 日志模块 | 1-2 h         |
| **Phase 4** | 复用模块导出     | 0.5 h         |
| **Phase 5** | 适配器优化       | 2-3 h         |
| **Phase 6** | 集成测试         | 1-2 h         |
| **总计**    |                  | **8-13 小时** |

---

## 🎯 立即可开始的任务

### Task 1: 创建项目结构（15 分钟）

```bash
cd /home/arligle/hl8/hl8-saas-platform-turborepo

# 创建目录
mkdir -p libs/nestjs-fastify/src/{exceptions/filters,logging,fastify,core}
mkdir -p libs/nestjs-fastify/__tests__

# 创建 package.json
cat > libs/nestjs-fastify/package.json <<'EOF'
{
  "name": "@hl8/nestjs-fastify",
  "version": "0.1.0",
  "description": "Fastify 专用的企业级基础设施模块",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@hl8/nestjs-infra": "workspace:*",
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@nestjs/platform-fastify": "^11.1.6",
    "fastify": "^5.6.1"
  }
}
EOF
```

### Task 2: 创建 Fastify 异常过滤器（30 分钟）

```typescript
// src/exceptions/filters/fastify-http-exception.filter.ts
import { AbstractHttpException } from "@hl8/nestjs-infra";

export class FastifyHttpExceptionFilter {
  catch(exception: AbstractHttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>(); // ← Fastify Reply
    const problemDetails = exception.toRFC7807();

    response
      .code(problemDetails.status) // ← Fastify .code()
      .header("Content-Type", "application/problem+json")
      .send(problemDetails);
  }
}
```

### Task 3: 创建 Fastify 日志服务（30 分钟）

```typescript
// src/logging/fastify-logger.service.ts
export class FastifyLoggerService implements LoggerService {
  private logger: pino.Logger;

  constructor() {
    // 在模块中通过 useFactory 注入 Fastify 的 Pino 实例
  }

  log(message: string, context?: any) {
    this.logger.info(context, message);
  }
}
```

---

## 📚 参考资料

### Fastify 官方文档

- [Fastify Plugins](https://fastify.dev/docs/latest/Reference/Plugins/)
- [Fastify Logging](https://fastify.dev/docs/latest/Reference/Logging/)
- [Fastify Reply](https://fastify.dev/docs/latest/Reference/Reply/)

### NestJS + Fastify

- [NestJS Fastify Adapter](https://docs.nestjs.com/techniques/performance)
- [Platform Fastify](https://github.com/nestjs/nest/tree/master/packages/platform-fastify)

### 现有实现

- `@hl8/nestjs-infra` - 通用版本
- `backup/fastify-pro` - 旧的 Fastify 实现

---

## ✅ 验收标准

### 功能完整性

- ✅ Fastify 异常处理（RFC7807）
- ✅ Fastify 日志集成（Pino）
- ✅ 数据隔离（5 级）
- ✅ Redis 缓存
- ✅ 配置管理
- ✅ 企业级适配器

### 性能要求

- ✅ 零日志开销（复用 Fastify Pino）
- ✅ 快速响应（<5ms 异常处理）
- ✅ 高吞吐量（>10k QPS）

### 代码质量

- ✅ 单元测试覆盖率 >60%
- ✅ 100% TypeScript 类型安全
- ✅ 0 linter errors
- ✅ 100% TSDoc 注释

### 集成验证

- ✅ 在 fastify-api 中成功运行
- ✅ 所有模块正常工作
- ✅ 无启动错误

---

## 🎊 预期收益

### 1. 性能提升

- ⚡ 日志：零开销（复用 Fastify Pino）
- ⚡ 异常处理：更快的响应
- ⚡ 整体：充分发挥 Fastify 性能

### 2. 开发体验

- ✅ 专门为 Fastify 设计
- ✅ 避免适配器差异
- ✅ 更简洁的 API

### 3. 维护性

- ✅ 职责清晰（Fastify 专用 vs 通用）
- ✅ 代码复用（80%）
- ✅ 易于扩展

---

## 🔄 与现有项目的关系

### @hl8/nestjs-infra（通用版本）

**用途**: Express 或通用场景  
**保留**: 是（继续维护）  
**关系**: 被 `@hl8/nestjs-fastify` 依赖

### @hl8/nestjs-fastify（Fastify 专用）

**用途**: Fastify 应用  
**新建**: 是（本次创建）  
**关系**: 依赖并扩展 `@hl8/nestjs-infra`

### 使用建议

```typescript
// Express 应用
import { ... } from '@hl8/nestjs-infra';

// Fastify 应用（推荐）
import { ... } from '@hl8/nestjs-fastify';
```

---

## 📝 下一步行动

### 立即开始（如果批准）

1. **创建规格说明**: `specs/002-hl8-nestjs-fastify/`
2. **运行**: `/speckit.spec` 创建详细规格
3. **运行**: `/speckit.plan` 创建实施计划
4. **运行**: `/speckit.tasks` 生成任务清单
5. **运行**: `/speckit.implement` 开始开发

### 或者先完成当前项目

1. **提交所有代码**: 当前 @hl8/nestjs-infra 已完成
2. **合并分支**: 001-hl8-nestjs-enhance → main
3. **创建新分支**: 002-hl8-nestjs-fastify
4. **开始新规格**

---

## 🎯 建议

**我的建议**:

1. ✅ **先完成当前项目**
   - 提交并合并 `@hl8/nestjs-infra`
   - 标记为 v0.3.0 完成

2. ✅ **创建新的 Feature**
   - `specs/002-hl8-nestjs-fastify/`
   - 完整的规格说明流程

3. ✅ **循序渐进**
   - 先让通用版本稳定
   - 再创建 Fastify 专用版本

**您的选择？**

- A: 立即开始创建 `@hl8/nestjs-fastify`
- B: 先提交当前工作，再开始新项目

---

**无论选择哪个方案，当前的 @hl8/nestjs-infra 开发工作都已圆满完成！** 🎉
