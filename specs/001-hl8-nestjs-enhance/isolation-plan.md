# Implementation Plan: 拆分 Isolation 数据隔离模块为独立库项目

**Branch**: `001-hl8-nestjs-enhance` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Related**: 本计划与 [caching 模块拆分](./plan.md) 并行进行

## Summary

将 `libs/nestjs-infra/src/isolation` 模块拆分为两个独立的库项目：

1. **`libs/isolation-model`** - 纯粹的领域模型库（核心）⭐
   - 包名：`@hl8/isolation-model`
   - 提供 IsolationContext 领域实体、值对象（TenantId、OrganizationId 等）
   - 定义隔离级别、共享级别等枚举
   - 提供接口定义（无具体实现）
   - **零依赖**（仅依赖 TypeScript）
   - **框架无关**（不含 "nestjs" 名称，可用于任何框架）
   - 可被日志、缓存、数据库等任何模块引用

2. **`libs/nestjs-isolation`** - NestJS 实现库
   - 包名：`@hl8/nestjs-isolation`
   - 依赖 `@hl8/isolation-model`
   - 提供基于 nestjs-cls 的上下文管理实现
   - 提供中间件、守卫、装饰器等 NestJS 特定功能
   - 依赖 NestJS 框架

**命名原则**:

- 领域模型库：不含框架名称（isolation-model）
- 实现库：包含框架名称（nestjs-isolation）

**架构原则**: 依赖倒置 - 业务库（caching、logging）依赖纯粹的领域模型，而非依赖具体实现。

## Technical Context

**Language/Version**: TypeScript 5.9.2 + Node.js >= 20  

**Primary Dependencies (isolation-model - 领域模型库)**:

- **零外部依赖**（绝对纯粹）
- 仅依赖 TypeScript 类型系统
- **包名**: `@hl8/isolation-model`

**Primary Dependencies (nestjs-isolation - 实现库)**:

- @hl8/isolation-model workspace:* (领域模型，核心依赖)
- NestJS 11.1.6 (后端框架)
- nestjs-cls 6.0.1 (请求级上下文存储)
- class-validator 0.14.2 + class-transformer 0.5.1 (验证)

**Storage**:

- 领域模型库：无状态（纯类型定义和领域逻辑）
- 实现库：内存（请求级上下文，基于 nestjs-cls）

**Testing**: Jest 30.2.0  
**Target Platform**:

- 领域模型库：任意 TypeScript 环境（浏览器、Node.js、Deno 等）
- 实现库：Linux server, Node.js >= 20, Docker 容器化部署

**Project Type**:

- isolation-model: 纯 TypeScript 库（零依赖领域模型，框架无关）
- nestjs-isolation: 服务端库项目 (libs/，NestJS 框架绑定）

**Module System**: ES Module (NodeNext)  
**Build Tools**:

- 领域模型库：TypeScript (tsc) 仅类型检查和编译
- 实现库：TypeScript (tsc) + SWC (快速编译)  

**Performance Goals**:

- 上下文提取延迟 < 1ms
- 权限验证延迟 < 0.5ms
- 支持至少 10,000 并发请求
- 无内存泄漏

**Constraints**:

**领域模型库约束（isolation-model）**:

- ✅ **零外部依赖**: 绝对不依赖任何 npm 包（除了 TypeScript）
- ✅ **框架无关**: 不依赖 NestJS、Express、Fastify 等框架
- ✅ **纯粹性**: 只包含领域模型、值对象、接口、枚举
- ✅ **不可变性**: 所有值对象和实体不可变
- ✅ **业务规则封装**: 隔离逻辑在领域对象内部实现
- ✅ **通用性**: 可被任何 TypeScript 项目引用（包括浏览器环境）
- ✅ **无副作用**: 纯函数，无 IO 操作

**实现库约束（nestjs-isolation）**:

- ✅ 依赖领域模型库（@hl8/isolation-model）
- ✅ 基于 nestjs-cls 实现请求级上下文
- ✅ 支持 Fastify 和 Express
- ✅ 中间件不能阻塞请求
- ✅ 完全兼容现有 nestjs-infra 的 isolation 模块 API

**Scale/Scope**:

**领域模型库**:

- 代码规模约 300-500 LOC（纯类型和领域模型）
- 测试覆盖率 >= 95%（领域逻辑测试，无外部依赖易测试）
- 包大小 < 10KB（编译后）
- 可被任意数量的依赖库引用（caching、logging、database 等）

**实现库**:

- 代码规模约 1,000-1,500 LOC（不含测试）
- 测试覆盖率 >= 80%
- 预期支持 10,000+ 租户
- 单租户并发用户 < 1,000

## Constitution Check

**GATE**: Must pass before Phase 0 research. Re-check after Phase 1 design.

### 中文优先原则 (NON-NEGOTIABLE)

- [x] 所有代码注释使用中文，遵循 TSDoc 规范
- [x] 技术文档使用中文编写
- [x] 错误消息和日志使用中文
- [x] API 文档和接口说明使用中文

### 代码即文档原则

- [x] 所有公共 API、类、方法、接口、枚举添加完整 TSDoc 注释
- [x] 注释包含业务规则、业务逻辑、异常处理和使用示例
- [x] 注释包含 @description、@param、@returns、@throws、@example 标记

### 架构原则

- [x] 遵循 Clean Architecture + DDD 充血模型（隔离模块为基础设施层）
- [x] 领域实体和聚合根分离（IsolationContext 作为领域对象）
- [x] 用例在文档和设计中明确提及（上下文提取、权限验证）
- [x] 命令和查询分离（set 为命令，get/check 为查询）
- [x] 事件驱动设计（上下文创建事件、访问拒绝事件）

**说明**: 作为基础设施库，本模块主要提供技术能力，但仍遵循 DDD 充血模型设计隔离相关的领域对象（如 IsolationContext），确保业务规则封装在对象内部。

### Monorepo 组织原则

- [x] 项目结构符合 libs/ 组织（服务端库）
- [x] 作为独立项目开发（libs/nestjs-isolation）
- [x] 使用 pnpm 作为包管理工具
- [x] 模块命名符合规范（nestjs-isolation，无 -service 后缀）

### 质量保证原则

- [x] ESLint 配置继承根目录配置
- [x] TypeScript 配置继承 monorepo 根 tsconfig.json
- [x] 使用 MCP 工具进行代码检查

### 测试架构原则

- [x] 单元测试文件与被测试文件在同一目录（.spec.ts）
- [x] 集成测试放置在 `__tests__/integration/` 目录
- [x] 端到端测试放置在 `__tests__/e2e/` 目录（N/A for library）
- [x] 测试之间相互独立，不依赖执行顺序
- [x] 核心业务逻辑测试覆盖率 ≥ 80%
- [x] 所有公共 API 必须有对应的测试用例

### 数据隔离与共享原则

- [x] 支持 5 层级隔离（平台、租户、组织、部门、用户）
- [x] 自动从请求头提取隔离标识（X-Tenant-Id、X-Organization-Id、X-Department-Id、X-User-Id）
- [x] 基于 nestjs-cls 实现请求级上下文存储
- [x] 支持共享数据和非共享数据的访问控制
- [x] 提供权限验证 API
- [x] 所有上下文操作记录日志
- [x] 访问拒绝触发审计事件

### 统一语言原则（Ubiquitous Language）

- [x] 使用统一术语：Platform、Tenant、Organization、Department、User
- [x] 隔离级别命名遵循层级术语
- [x] 接口和方法命名清晰反映业务语义
- [x] 代码注释使用统一术语描述隔离逻辑
- [x] 技术实现可追溯到多层级隔离业务需求

**宪章合规性评估**: ✅ 全部通过

本项目完全符合宪章要求。作为基础设施库，它采用功能导向设计，遵循 DDD 充血模型设计核心领域对象，使用 NodeNext 模块系统，支持多层级数据隔离，并提供完整的测试覆盖。

## Project Structure

### Documentation (this feature)

```text
specs/001-hl8-nestjs-enhance/
├── isolation-plan.md         # This file
├── isolation-research.md     # Phase 0 output (to be created)
├── isolation-data-model.md   # Phase 1 output (to be created)
├── isolation-quickstart.md   # Phase 1 output (to be created)
└── contracts/
    └── isolation-api.md      # Phase 1 output (to be created)
```

### Source Code (repository root)

```text
# 核心领域模型库（零依赖，纯粹，框架无关）
libs/isolation-model/
├── src/
│   ├── index.ts                          # 主导出文件
│   │
│   ├── entities/                         # 领域实体
│   │   ├── isolation-context.entity.ts   # 隔离上下文实体（核心）
│   │   └── isolation-context.entity.spec.ts
│   │
│   ├── value-objects/                    # 值对象
│   │   ├── tenant-id.vo.ts               # 租户 ID 值对象
│   │   ├── tenant-id.vo.spec.ts
│   │   ├── organization-id.vo.ts         # 组织 ID 值对象
│   │   ├── organization-id.vo.spec.ts
│   │   ├── department-id.vo.ts           # 部门 ID 值对象
│   │   ├── department-id.vo.spec.ts
│   │   ├── user-id.vo.ts                 # 用户 ID 值对象
│   │   └── user-id.vo.spec.ts
│   │
│   ├── enums/                            # 枚举定义
│   │   ├── isolation-level.enum.ts       # 隔离级别
│   │   ├── sharing-level.enum.ts         # 共享级别
│   │   └── index.ts
│   │
│   ├── interfaces/                       # 接口定义
│   │   ├── isolation-context-provider.interface.ts  # 上下文提供者接口
│   │   ├── isolation-validator.interface.ts         # 验证器接口
│   │   ├── data-access-context.interface.ts         # 数据访问上下文
│   │   └── index.ts
│   │
│   └── events/                           # 领域事件（纯定义）
│       ├── context-created.event.ts
│       ├── context-switched.event.ts
│       ├── access-denied.event.ts
│       └── index.ts
│
├── package.json                          # 零依赖配置
├── tsconfig.json                         # TypeScript 配置
├── tsconfig.build.json                   # 构建配置
├── eslint.config.mjs                     # ESLint 配置
└── README.md                             # 说明：这是纯领域模型库

# NestJS 实现库（依赖领域模型库）
libs/nestjs-isolation/
├── src/
│   ├── index.ts                          # 主导出文件
│   ├── isolation.module.ts               # NestJS 模块定义
│   │
│   ├── services/                         # 服务实现
│   │   ├── isolation-context.service.ts  # 上下文管理服务实现
│   │   ├── isolation-context.service.spec.ts
│   │   ├── multi-level-isolation.service.ts  # 多层级隔离服务实现
│   │   └── multi-level-isolation.service.spec.ts
│   │
│   ├── middleware/                       # 中间件
│   │   ├── isolation-extraction.middleware.ts
│   │   └── isolation-extraction.middleware.spec.ts
│   │
│   ├── guards/                           # 守卫
│   │   ├── isolation.guard.ts
│   │   └── isolation.guard.spec.ts
│   │
│   ├── decorators/                       # 装饰器
│   │   ├── require-tenant.decorator.ts
│   │   ├── require-organization.decorator.ts
│   │   ├── require-department.decorator.ts
│   │   └── current-context.decorator.ts
│   │
│   ├── strategies/                       # 提取策略实现
│   │   ├── header-extraction.strategy.ts
│   │   ├── jwt-extraction.strategy.ts
│   │   └── extraction-strategy.interface.ts
│   │
│   └── types/                            # 实现相关的类型
│       ├── module-options.interface.ts
│       └── index.ts
│
├── __tests__/integration/                # 集成测试
│   ├── context-isolation.spec.ts
│   ├── permission-check.spec.ts
│   └── middleware.spec.ts
│
├── package.json                          # 依赖 @hl8/isolation-model
├── tsconfig.json
├── eslint.config.mjs
└── README.md

# 依赖关系示意图
libs/nestjs-caching          → libs/isolation-model (领域模型)
libs/nestjs-logging          → libs/isolation-model (领域模型)
libs/nestjs-isolation        → libs/isolation-model (领域模型)
libs/nestjs-infra            → libs/nestjs-isolation (实现)
```

**Structure Decision**:

采用**分层架构**，遵循**依赖倒置原则**（DIP）：

### 核心设计原则

1. **领域模型库（isolation-model）**:
   - **零依赖**: 不依赖任何外部库，包括 NestJS
   - **纯粹性**: 只包含领域模型、值对象、接口定义
   - **不可变性**: 所有值对象不可变
   - **业务规则**: 业务逻辑封装在领域对象内部
   - **通用性**: 可被任何 TypeScript 项目引用
   - **框架无关**: 命名不含框架标识

2. **实现库（nestjs-isolation）**:
   - **依赖领域模型**: 实现领域模型定义的接口
   - **框架绑定**: 依赖 NestJS、nestjs-cls 等框架
   - **可替换性**: 可以有多种实现（NestJS、Express 等）
   - **功能导向**: 按功能组织代码

3. **依赖方向** (遵循 DIP):

   ```
   高层业务逻辑（caching、logging）
      ↓ 依赖
   领域模型（isolation-model - 框架无关）
      ↑ 实现
   技术实现（nestjs-isolation - 框架绑定）
   ```

### 为什么这样设计？

**问题**: 如果 isolation 模块包含 NestJS 实现，那么：

- ❌ caching 模块依赖 isolation → 也会间接依赖 nestjs-cls
- ❌ logging 模块依赖 isolation → 也会间接依赖 NestJS
- ❌ 增加了不必要的依赖传递
- ❌ 难以在非 NestJS 环境中使用

**解决方案**: 分离领域模型和实现：

- ✅ caching、logging 只依赖纯领域模型（零依赖）
- ✅ NestJS 应用选择性地使用实现库
- ✅ 可以为不同框架提供不同实现
- ✅ 领域模型可以在任何 TypeScript 环境中使用

### 使用场景

**场景 1: Caching 模块使用隔离上下文**

```typescript
// libs/nestjs-caching/src/cache.service.ts
import { IsolationContext } from '@hl8/nestjs-isolation'; // 零依赖！

class CacheService {
  generateKey(namespace: string, key: string, context: IsolationContext) {
    // 使用纯领域模型，无框架依赖
    return context.buildCacheKey(namespace, key);
  }
}
```

**场景 2: Logging 模块使用隔离上下文**

```typescript
// libs/nestjs-logging/src/logger.service.ts
import { IsolationContext } from '@hl8/nestjs-isolation'; // 零依赖！

class LoggerService {
  log(message: string, context: IsolationContext) {
    // 使用纯领域模型记录日志
    return {
      message,
      tenantId: context.tenantId?.value,
      level: context.getIsolationLevel(),
    };
  }
}
```

**场景 3: NestJS 应用使用完整功能**

```typescript
// apps/api/src/app.module.ts
import { IsolationModule } from '@hl8/nestjs-isolation'; // 使用 NestJS 实现

@Module({
  imports: [
    IsolationModule.forRoot({
      autoRegisterMiddleware: true,
    }),
  ],
})
export class AppModule {}
```

**与现有 nestjs-infra 的关系**:

拆分后：

1. `libs/nestjs-infra` 依赖 `libs/nestjs-isolation`（NestJS 实现库）
2. `libs/nestjs-caching` 只依赖 `libs/isolation-model`（领域模型，零依赖）
3. `libs/nestjs-logging` 只依赖 `libs/isolation-model`（领域模型，零依赖）
4. `libs/nestjs-isolation` 依赖 `libs/isolation-model`（领域模型）
5. 兼容层在 `nestjs-infra/src/isolation/` 保持 API 不变

## Complexity Tracking

**Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

**说明**: 本项目无宪章违规，不需要复杂性跟踪。所有设计决策均符合宪章要求。

---

## 后续步骤

1. **Phase 0**: 生成 `isolation-research.md` - 研究隔离策略、性能优化、最佳实践
2. **Phase 1**: 生成设计文档
   - `isolation-data-model.md` - IsolationContext 实体、值对象、事件定义
   - `contracts/isolation-api.md` - 完整 API 合约
   - `isolation-quickstart.md` - 快速开始指南
3. **Phase 2**: 生成 `isolation-tasks.md` - 详细任务清单

**注意**:

- Isolation 模块与 Caching 模块的拆分可以并行进行
- 两个模块都会依赖 `@hl8/platform` 的类型定义
- 拆分完成后，`libs/nestjs-infra` 将同时依赖这两个独立库

---

**实施计划状态**: ✅ 技术上下文和结构已定义，准备进入 Phase 0
**分支**: `001-hl8-nestjs-enhance`  
**相关文档**: [caching-plan.md](./plan.md)
