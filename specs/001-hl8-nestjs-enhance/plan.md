# Implementation Plan: NestJS 基础设施模块

**Branch**: `001-hl8-nestjs-enhance` | **Date**: 2025-10-11 | **Spec**: [spec.md](./spec.md)
**Package Name**: `@hl8/nestjs-infra` | **Project Path**: `libs/nestjs-infra`
**Input**: Feature specification from `/specs/001-hl8-nestjs-enhance/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**主要需求**：整合5个分散的基础设施包（@hl8/cache、@hl8/config、@hl8/logger、@hl8/isolation、@hl8/fastify-pro）到一个统一的 `@hl8/nestjs-infra` 包，降低依赖复杂度、简化使用方式、统一版本管理。

**技术方法**：

1. 采用功能导向设计（非 Clean Architecture 分层），每个功能模块独立组织
2. 从 CommonJS 迁移到 NodeNext ES 模块系统
3. 应用 TypeScript 严格模式和宪章要求的所有技术标准
4. `shared/` 目录用于存放过渡性的领域模型（实体、值对象、事件），便于后续迁移
5. 分3个阶段实施（核心功能 → 完整功能 → 优化完善）

**整合优势**：

- 依赖复杂度：5个独立包 → 1个统一包
- 使用简化：统一的导入路径和配置方式
- 技术升级：CommonJS → NodeNext、启用严格模式、充血模型
- 质量提升：测试覆盖率 ≥ 80%、完整 TSDoc 注释

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js ≥ 20  
**Primary Dependencies**:

- NestJS ≥ 11
- nestjs-cls (上下文管理)
- ioredis (Redis 缓存)
- pino (日志)
- fastify ≥ 5.6 (HTTP 服务器)
- class-validator, class-transformer (配置验证)
- dotenv, js-yaml (配置加载)

**Storage**: Redis (缓存)、无持久化存储（基础设施库）  
**Testing**: Jest、单元测试（.spec.ts 同目录）、集成测试（**tests**/）  
**Target Platform**: Linux server (Node.js ≥ 20)、生产环境支持 Docker 容器化
**Project Type**: 库项目（libs/nestjs-infra），功能导向设计，不遵循 Clean Architecture 分层  
**Performance Goals**:

- 缓存响应时间 < 5ms
- 日志写入不阻塞主线程
- Fastify 适配器支持 10k+ req/s
- 配置加载时间 < 100ms

**Constraints**:

- 必须兼容 NestJS 模块系统
- 每个功能模块可独立导入使用
- 零运行时依赖冲突
- 向后兼容旧包的核心 API

**Scale/Scope**:

- ~3400 行代码（从6个包整合）
- 6个核心功能模块（**exceptions**、**isolation**、caching、configuration、logging、fastify）
- ~40+ 个公共 API
- 支持平台内所有服务端应用使用

**关键模块**：

- ⭐ **exceptions**（P0 - CRITICAL）：统一异常处理，RFC7807 标准，所有模块的基础依赖
- ⭐ **isolation**（P1）：5层级数据隔离（平台/租户/组织/部门/用户），支持共享控制

## Constitution Check

**GATE**: Must pass before Phase 0 research. Re-check after Phase 1 design.

### 中文优先原则 (NON-NEGOTIABLE)

- [ ] 所有代码注释使用中文，遵循 TSDoc 规范
- [ ] 技术文档使用中文编写
- [ ] 错误消息和日志使用中文
- [ ] API 文档和接口说明使用中文

### 代码即文档原则

- [ ] 所有公共 API、类、方法、接口、枚举添加完整 TSDoc 注释
- [ ] 注释包含业务规则、业务逻辑、异常处理和使用示例
- [ ] 注释包含 @description、@param、@returns、@throws、@example 标记

### 架构原则

**特别说明**：本项目是基础设施库，不遵循 Clean Architecture 分层（详见 Complexity Tracking）

- [x] ~~遵循 Clean Architecture + CQRS + ES + EDA 架构模式~~ - **不适用**：基础设施库采用功能导向设计
- [x] ~~领域实体和聚合根分离~~ - **部分适用**：shared/ 目录中的领域模型遵循 DDD，但其他模块采用功能导向
- [x] ~~用例在文档和设计中明确提及~~ - **不适用**：基础设施库无业务用例
- [x] ~~命令和查询分离~~ - **不适用**：基础设施库提供技术服务，非业务逻辑
- [x] 事件驱动设计 - **适用**：支持事件总线和发布订阅机制

**适用的架构原则**：

- [x] 功能模块化：按功能组织代码（caching、configuration、logging、isolation、fastify）
- [x] 高内聚低耦合：每个功能模块独立，最小化模块间依赖
- [x] 可复用性优先：设计为可被任何 NestJS 应用使用
- [x] 领域模型分离：shared/ 目录存放过渡性领域模型

### Monorepo 组织原则

- [x] 项目结构符合 apps/packages/examples 组织 - **符合**：位于 libs/nestjs-enhance
- [x] 领域模块作为独立项目开发 - **符合**：作为独立的基础设施库
- [x] 使用 pnpm 作为包管理工具
- [x] 服务模块命名去掉 "-service" 后缀 - **符合**：命名为 nestjs-enhance 而非 nestjs-enhance-service

### 质量保证原则

- [x] ESLint 配置继承根目录配置 - **计划中**：Phase 1 创建 eslint.config.mjs
- [x] TypeScript 配置继承 monorepo 根 tsconfig.json - **计划中**：Phase 1 创建 tsconfig.json
- [x] 使用 MCP 工具进行代码检查 - **计划中**：开发过程中持续使用

### 测试架构原则

- [x] 单元测试文件与被测试文件在同一目录（.spec.ts）
- [x] 集成测试放置在 `__tests__/integration/` 目录
- [x] 端到端测试放置在 `__tests__/e2e/` 目录 - **不适用**：基础设施库无 e2e 测试
- [x] 测试之间相互独立，不依赖执行顺序
- [x] 核心业务逻辑测试覆盖率 ≥ 80% - **目标**：所有功能模块覆盖率 ≥ 80%
- [x] 所有公共 API 必须有对应的测试用例

### 数据隔离与共享原则

**特别说明**：本项目提供多租户隔离的基础设施支持，而非实现业务数据隔离

- [x] ~~所有业务数据支持多层级隔离~~ - **不适用**：基础设施库无业务数据
- [x] ~~数据模型包含必需的隔离字段~~ - **不适用**：基础设施库无业务数据模型
- [x] ~~为隔离字段创建数据库索引~~ - **不适用**：基础设施库无数据库
- [x] 数据明确分类为共享数据或非共享数据 - **适用**：shared/ 目录中的领域模型定义隔离概念
- [x] ~~共享数据定义了明确的共享级别~~ - **不适用**：由业务应用定义
- [x] API请求携带完整的隔离标识 - **适用**：isolation 模块提供隔离标识提取
- [x] 系统自动根据隔离上下文过滤数据 - **适用**：提供上下文管理服务
- [x] 缓存键包含完整的隔离层级信息 - **适用**：caching 模块支持租户隔离缓存
- [x] 所有数据访问记录完整的隔离上下文到日志 - **适用**：logging 模块支持上下文日志
- [x] ~~跨层级数据访问触发审计事件~~ - **不适用**：由业务应用实现

**本模块提供的隔离支持**：

- [x] IsolationContextService：租户上下文管理
- [x] MultiLevelIsolationService：多层级隔离服务
- [x] 租户隔离的缓存命名空间
- [x] 上下文感知的日志记录

### 统一语言原则（Ubiquitous Language）

- [x] 所有文档和代码使用 `docs/definition-of-terms.mdc` 中定义的统一术语
- [x] 核心业务实体命名符合术语定义（Platform、Tenant、Organization、Department、User） - **适用于 shared/ 目录**
- [x] 接口和方法命名使用统一术语，确保业务语义清晰
- [x] 代码注释中使用统一术语描述业务逻辑
- [x] 技术实现能够追溯到业务术语和领域模型 - **适用于 isolation 模块**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**项目类型**：库项目（libs/nestjs-infra），功能导向设计

```text
libs/nestjs-infra/
├── src/
│   ├── index.ts                      # 主入口，导出所有公共 API
│   │
│   ├── exceptions/                   # ⭐ 统一异常处理（来自 @hl8/common）P0
│   │   ├── exception.module.ts      # NestJS 模块
│   │   ├── exception.module.spec.ts
│   │   ├── core/                    # 核心异常类
│   │   │   ├── abstract-http.exception.ts
│   │   │   ├── abstract-http.exception.spec.ts
│   │   │   ├── general-not-found.exception.ts
│   │   │   ├── general-bad-request.exception.ts
│   │   │   └── general-internal-server.exception.ts
│   │   ├── filters/                 # 异常过滤器
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── http-exception.filter.spec.ts
│   │   │   ├── any-exception.filter.ts
│   │   │   └── any-exception.filter.spec.ts
│   │   ├── providers/               # 消息提供者
│   │   │   ├── exception-message.provider.ts
│   │   │   └── exception-message.provider.spec.ts
│   │   ├── config/                  # 配置
│   │   │   └── exception.config.ts
│   │   ├── types/                   # 类型定义
│   │   │   └── exception.types.ts
│   │   └── utils/                   # 工具函数
│   │
│   ├── shared/                       # 共享领域模型（过渡性设计）
│   │   │                            # 注意：仅包含领域概念，技术实现放在功能模块
│   │   ├── entities/                # 领域实体
│   │   │   └── isolation-context.entity.ts
│   │   ├── value-objects/           # 值对象
│   │   │   ├── entity-id.vo.ts      # 来自 @hl8/common
│   │   │   ├── tenant-id.vo.ts
│   │   │   ├── organization-id.vo.ts
│   │   │   ├── department-id.vo.ts
│   │   │   └── user-id.vo.ts
│   │   ├── events/                  # 领域事件
│   │   │   ├── isolation-context-created.event.ts
│   │   │   ├── isolation-context-switched.event.ts
│   │   │   └── cache-invalidated.event.ts
│   │   ├── types/                   # 领域类型定义
│   │   │   ├── shared.types.ts      # 来自 @hl8/common
│   │   │   ├── tenant.types.ts
│   │   │   ├── organization.types.ts
│   │   │   └── isolation.types.ts
│   │   ├── enums/                   # 领域枚举（来自 @hl8/common）
│   │   ├── constants.ts             # 领域常量（来自 @hl8/common）
│   │   └── exceptions/              # 业务异常（隔离相关）
│   │       ├── tenant-not-found.exception.ts
│   │       └── isolation.exceptions.ts
│   │
│   ├── common/                      # 通用技术组件（来自 @hl8/common）
│   │   ├── decorators/              # 通用装饰器
│   │   │   ├── public.decorator.ts  # 标记公开路由
│   │   │   └── public.decorator.spec.ts
│   │   └── guards/                  # 通用守卫（暂时为空）
│   │
│   ├── caching/                     # 缓存功能（来自 @hl8/cache）
│   │   ├── cache.module.ts         # NestJS 模块
│   │   ├── cache.service.ts        # 缓存服务
│   │   ├── cache.service.spec.ts   # 单元测试
│   │   ├── redis.service.ts        # Redis 服务
│   │   ├── redis.service.spec.ts
│   │   ├── decorators/             # 装饰器
│   │   │   ├── cacheable.decorator.ts
│   │   │   ├── cache-evict.decorator.ts
│   │   │   └── cache-put.decorator.ts
│   │   ├── monitoring/             # 监控
│   │   │   ├── cache-monitor.service.ts
│   │   │   ├── cache-stats.service.ts
│   │   │   └── health-check.service.ts
│   │   ├── types/                  # 类型定义
│   │   │   └── cache.types.ts
│   │   └── utils/                  # 工具函数
│   │       ├── key-generator.util.ts
│   │       └── serializer.util.ts
│   │
│   ├── configuration/               # 配置管理（来自 @hl8/config）
│   │   ├── typed-config.module.ts  # NestJS 模块
│   │   ├── loader/                 # 配置加载器
│   │   │   ├── file.loader.ts
│   │   │   ├── dotenv.loader.ts
│   │   │   ├── remote.loader.ts
│   │   │   └── directory.loader.ts
│   │   ├── validators/             # 配置验证
│   │   ├── cache/                  # 配置缓存
│   │   ├── types/                  # 类型定义
│   │   ├── errors/                 # 错误处理
│   │   └── utils/                  # 工具函数
│   │
│   ├── logging/                     # 日志功能（来自 @hl8/logger）
│   │   ├── logger.module.ts        # NestJS 模块
│   │   ├── logger.service.ts       # 日志服务
│   │   ├── logger.service.spec.ts
│   │   ├── formatters/             # 日志格式化
│   │   ├── transports/             # 日志传输
│   │   └── types/                  # 类型定义
│   │
│   ├── isolation/               # 多租户功能（来自 @hl8/isolation）
│   │   ├── isolation.module.ts # NestJS 模块
│   │   ├── services/               # 服务
│   │   │   ├── tenant-context.service.ts
│   │   │   ├── tenant-context.service.spec.ts
│   │   │   ├── isolation.service.ts
│   │   │   ├── isolation.service.spec.ts
│   │   │   ├── multi-level-isolation.service.ts
│   │   │   └── multi-level-isolation.service.spec.ts
│   │   ├── strategies/             # 策略接口
│   │   │   ├── isolation-strategy.interface.ts
│   │   │   └── validation-strategy.interface.ts
│   │   ├── middleware/             # 中间件
│   │   │   └── tenant-extraction.middleware.ts
│   │   ├── decorators/             # 装饰器
│   │   │   ├── tenant.decorator.ts
│   │   │   └── current-tenant.decorator.ts
│   │   ├── guards/                 # 守卫（租户相关的守卫放这里）
│   │   │   ├── tenant.guard.ts
│   │   │   └── tenant.guard.spec.ts
│   │   └── types/                  # 类型定义
│   │
│   ├── fastify/                     # Fastify 适配器（来自 @hl8/fastify-pro）
│   │   ├── fastify.module.ts       # NestJS 模块
│   │   ├── enterprise-fastify.adapter.ts  # 企业级适配器（整合所有功能）
│   │   ├── enterprise-fastify.adapter.spec.ts
│   │   ├── middleware/             # 中间件
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── circuit-breaker.middleware.ts
│   │   │   └── security.middleware.ts
│   │   ├── monitoring/             # 监控
│   │   │   ├── health-check.service.ts
│   │   │   └── performance-monitor.service.ts
│   │   ├── config/                 # 配置
│   │   │   └── fastify.config.ts
│   │   └── types/                  # 类型定义
│   │
│   └── utils/                       # 通用工具（来自 @hl8/utils）
│       ├── key-generator.util.ts
│       ├── serializer.util.ts
│       └── ...
│
├── __tests__/                       # 集成测试
│   ├── caching/
│   │   └── cache-integration.spec.ts
│   ├── configuration/
│   │   └── config-integration.spec.ts
│   ├── isolation/
│   │   └── isolation-integration.spec.ts
│   └── fastify/
│       └── adapter-integration.spec.ts
│
├── package.json
├── tsconfig.json                    # 扩展 @repo/ts-config/nestjs.json
├── tsconfig.build.json
├── eslint.config.mjs                # 扩展根目录 ESLint 配置
├── .swcrc                           # SWC 配置（快速编译）
└── README.md
```

**Structure Decision**:

- 功能导向设计，每个功能模块独立组织
- 单元测试与源代码同目录（.spec.ts）
- 集成测试放在 `__tests__/` 目录
- `shared/` 目录存放过渡性领域模型，便于后续迁移
- `common/` 目录存放通用技术组件（decorators、guards），不是领域概念

**关于 guards 和 decorators 的归属说明**：

1. **guards 不放在 shared/**：
   - ❌ Guards 是 NestJS 技术实现（路由守卫），不是领域模型
   - ✅ 功能相关的守卫放在对应模块（如 `TenantGuard` → `isolation/guards/`）
   - ✅ 通用守卫放在 `common/guards/`（目前 backup/common/src/guards/ 为空，暂无）

2. **decorators 按用途分配**：
   - ✅ 功能相关：`@Cacheable` → `caching/decorators/`，`@Tenant` → `isolation/decorators/`
   - ✅ 通用装饰器：`@Public` → `common/decorators/`（临时存放，未来迁移到认证模块）

3. **shared/ 目录严格限定为领域概念**：
   - ✅ entities/、value-objects/、events/（DDD 核心概念）
   - ✅ types/、enums/、constants.ts、exceptions/（领域定义）
   - ❌ decorators/、guards/（技术实现，不是领域概念）

## Complexity Tracking

**项目类型特殊性说明**：本项目是基础设施库，并非业务应用，因此部分宪章原则不适用或需要调整

| 宪章原则 | 调整说明 | 理由 |
| -------- | -------- | ---- |
| Clean Architecture 分层 | 不遵循四层架构，采用功能导向设计 | 基础设施库本身就是业务应用的"基础设施层"，无需再分层。功能导向设计更符合基础设施库的特点，参考 @nestjs/* 系列库的做法 |
| DDD 领域模型 | 仅 shared/ 目录遵循 DDD，其他模块功能导向 | shared/ 目录的领域模型（实体、值对象、事件）是过渡性设计，便于后续迁移到业务模块或 shared-kernel。其他模块（caching、configuration 等）是纯技术实现，无需 DDD |
| CQRS、用例分离 | 不适用 | 基础设施库提供技术服务，无业务用例，无需 CQRS 模式 |
| 数据隔离 | 提供隔离支持，而非实现业务数据隔离 | 本模块提供多租户隔离的基础设施能力（上下文管理、隔离缓存、上下文日志），由业务应用使用这些能力实现业务数据隔离 |

**简化选择的合理性**：

1. **功能导向 vs Clean Architecture**：
   - ✅ 功能导向：每个功能模块独立、高内聚、低耦合，便于按需导入
   - ❌ Clean Architecture：会增加不必要的抽象层，违背"简单性优先"原则
   - 业界对比：@nestjs/common、@nestjs/core、express、fastify 都采用功能导向

2. **shared/ 目录的过渡性设计**：
   - ✅ 当前方案：快速整合，明确标识为过渡性设计，有清晰的迁移路径
   - ❌ 立即分离：会延长整合时间，且迁移目标（shared-kernel vs 业务模块）尚未确定
   - 迁移路径：Phase 1-2 暂时保留，Phase 3 评估迁移时机

3. **技术服务 vs 业务逻辑**：
   - 本模块定位：为业务应用提供技术能力（缓存、配置、日志、多租户、Fastify）
   - 不包含：业务规则、业务逻辑、业务数据模型
   - 对比：类似于 Spring Boot Starter、Django Extensions

4. **Fastify 适配器简化**：
   - ✅ 只保留一个企业级适配器（enterprise-fastify.adapter.ts）
   - ❌ 移除 core-fastify.adapter.ts（冗余）
   - ❌ 移除独立的 plugins/ 目录（CORS 等功能直接集成到适配器）
   - 原因：
     - 简化设计，减少文件数量
     - 企业级适配器已包含所有功能（CORS、监控、健康检查）
     - 用户只需要使用一个适配器，无需选择基础版或企业版
     - 所有功能都默认启用，可通过配置禁用

**命名说明**：

- 包名 `@hl8/nestjs-infra` 中的 `infra` 是 infrastructure（基础设施）的标准缩写
- 准确描述包的定位：基础设施能力集合
- 业界常用命名方式（如 aws-infra、k8s-infra）
