# Implementation Plan: Database 连接管理模块

**Branch**: `004-database` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-database/spec.md`

## Summary

创建一个现代化的数据库连接管理模块 `@hl8/database`，作为平台的核心基础设施层，提供可靠的数据库访问能力。该模块专注于连接管理、事务管理和多租户隔离集成，与现有基础设施库（@hl8/config、@hl8/exceptions、@hl8/nestjs-isolation）完全兼容，使用 ES Module 格式。

**核心职责**：

- 数据库连接生命周期管理
- 事务管理（声明式和编程式）
- 多租户数据隔离集成
- 连接池优化
- 基础健康检查和性能监控（内存统计）

**明确不包含**：

- ❌ 持久化缓存（由 @hl8/caching 负责）
- ❌ 数据库迁移（由独立迁移项目负责）
- ❌ 业务仓储（由应用层实现）

技术路线：使用 MikroORM 6.x 作为 ORM 层，集成 nestjs-cls 6.0+ 进行上下文管理，支持 PostgreSQL 数据库（MongoDB 作为可选扩展），使用数据库默认事务隔离级别。

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js >= 20  
**Primary Dependencies**: @mikro-orm/core ^6.0+, @nestjs/common ^11.0+, nestjs-cls ^6.0+, @hl8/nestjs-fastify (日志), @hl8/config, @hl8/exceptions, @hl8/nestjs-isolation  
**Storage**: PostgreSQL 主数据库，MongoDB 可选扩展  
**Testing**: Jest 单元测试，集成测试使用 @nestjs/testing + 测试数据库  
**Target Platform**: Linux 服务器（Node.js >= 20）  
**Project Type**: 库（libs/），NestJS 模块，ES Module 格式  
**Performance Goals**:

- 启动连接时间 < 5秒
- 支持 1000+ 并发数据库操作
- 健康检查响应 < 100ms
- 连接池高效复用，空闲连接自动回收

**Constraints**:

- 必须使用 ES Module (type: "module")
- 必须与现有基础设施库 API 兼容
- 多租户数据 100% 隔离，无跨租户泄露
- 事务失败 100% 正确回滚
- 所有异常符合 RFC7807 标准

**Scale/Scope**:

- 服务 10+ 应用模块
- 支持数千租户并发访问
- 管理数十个数据库连接
- 核心模块，约 2000-3000 行代码

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

- [x] 遵循 Clean Architecture 分层（基础设施层）
- [N/A] 领域实体和聚合根分离（本模块作为基础设施层，不涉及业务实体）
- [N/A] 用例在文档和设计中明确提及（本模块作为基础设施层，无业务用例）
- [N/A] 命令和查询分离（本模块提供底层连接管理，不涉及 CQRS）
- [N/A] 事件溯源和事件驱动设计（本模块不涉及事件）

**说明**: 本模块定位为基础设施层的连接管理，不涉及业务逻辑，因此 DDD/CQRS/ES/EDA 相关检查项不适用。上层应用模块使用本模块时再实现这些架构模式。

### Monorepo 组织原则

- [x] 项目结构符合 apps/packages/examples 组织（放置在 libs/ 下）
- [x] 领域模块作为独立项目开发（作为独立的基础设施库）
- [x] 使用 pnpm 作为包管理工具
- [x] 服务模块命名去掉 "-service" 后缀（命名为 database，不是 database-service）

### 质量保证原则

- [x] ESLint 配置继承根目录配置
- [x] TypeScript 配置继承 monorepo 根 tsconfig.json
- [x] 使用 MCP 工具进行代码检查

### TypeScript 配置要求（服务端项目）

- [x] 使用 NodeNext 模块系统（module: "NodeNext"）
- [x] 使用 NodeNext 模块解析（moduleResolution: "NodeNext"）
- [x] 目标 ES2022（target: "ES2022"）
- [x] package.json 声明 type: "module"
- [x] 禁止使用 CommonJS
- [x] 使用 ES 模块导入导出语法

### 编译工具要求

- [x] 联合使用 tsc 和 swc（tsc 类型检查 + swc 快速编译）
- [x] 构建脚本包含 build、build:swc、dev、type-check
- [x] CI/CD 独立执行类型检查步骤

### 测试架构原则

- [x] 单元测试文件与被测试文件在同一目录（.spec.ts）
- [x] 集成测试放置在 `__tests__/integration/` 目录
- [N/A] 端到端测试放置在 `__tests__/e2e/` 目录（基础设施模块无 E2E 测试）
- [x] 测试之间相互独立，不依赖执行顺序
- [x] 核心业务逻辑测试覆盖率 ≥ 80%
- [x] 所有公共 API 必须有对应的测试用例

### 数据隔离与共享原则

- [x] 所有数据访问支持多层级隔离（平台、租户、组织、部门、用户）
- [x] 集成 @hl8/nestjs-isolation 的 IsolationContext
- [x] 系统自动根据隔离上下文过滤数据
- [x] API 操作携带完整的隔离标识
- [x] 所有数据访问记录审计日志
- [N/A] 缓存功能（如需缓存数据库相关数据，应用层使用 @hl8/caching 模块）

**说明**: 本模块负责集成和传递隔离上下文到数据访问层，具体的隔离字段由上层应用的业务模型定义。

### 统一语言原则（Ubiquitous Language）

- [x] 所有文档和代码使用 `docs/definition-of-terms.mdc` 中定义的统一术语
- [x] 核心概念命名符合术语定义（使用 Tenant、Organization、Department、User）
- [x] 接口和方法命名使用统一术语，确保语义清晰
- [x] 代码注释中使用统一术语描述逻辑

## Project Structure

### Documentation (this feature)

```text
specs/004-database/
├── spec.md                 # 需求规范（已完成）
├── plan.md                 # 本文件：实现计划
├── research.md             # Phase 0 输出：技术研究
├── data-model.md           # Phase 1 输出：数据模型设计
├── quickstart.md           # Phase 1 输出：快速开始指南
├── contracts/              # Phase 1 输出：API 契约
│   ├── module-api.md       # 模块接口定义
│   ├── service-api.md      # 服务接口定义
│   └── types-api.md        # 类型定义接口
├── checklists/             # 质量检查清单
│   └── requirements.md     # 需求质量检查清单（已完成）
└── tasks.md                # Phase 2 输出：实现任务（/speckit.tasks 命令）
```

### Source Code (repository root)

```text
libs/database/
├── package.json                    # 包配置（type: "module"）
├── tsconfig.json                   # TypeScript 配置（继承根配置）
├── tsconfig.build.json             # 构建配置
├── eslint.config.mjs               # ESLint 配置（继承根配置）
├── jest.config.ts                  # Jest 测试配置
├── README.md                       # 模块说明文档
├── CHANGELOG.md                    # 变更日志
│
├── src/
│   ├── index.ts                    # 主导出文件
│   │
│   ├── config/                     # 配置管理
│   │   ├── index.ts
│   │   ├── database.config.ts      # 数据库配置类（集成 @hl8/config）
│   │   └── database.config.spec.ts
│   │
│   ├── constants/                  # 常量定义
│   │   ├── index.ts
│   │   ├── tokens.ts               # 依赖注入令牌
│   │   ├── defaults.ts             # 默认配置值
│   │   └── error-codes.ts          # 错误代码
│   │
│   ├── types/                      # 类型定义
│   │   ├── index.ts
│   │   ├── connection.types.ts     # 连接相关类型
│   │   ├── transaction.types.ts    # 事务相关类型
│   │   ├── migration.types.ts      # 迁移相关类型
│   │   ├── monitoring.types.ts     # 监控相关类型
│   │   └── module.types.ts         # 模块配置类型
│   │
│   ├── exceptions/                 # 异常定义
│   │   ├── index.ts
│   │   ├── database-connection.exception.ts
│   │   ├── database-query.exception.ts
│   │   ├── database-transaction.exception.ts
│   │   ├── database-migration.exception.ts
│   │   └── exceptions.spec.ts
│   │
│   ├── connection/                 # 连接管理
│   │   ├── index.ts
│   │   ├── connection.manager.ts   # 连接管理器
│   │   ├── connection.manager.spec.ts
│   │   ├── connection-pool.ts      # 连接池管理
│   │   └── connection-pool.spec.ts
│   │
│   ├── transaction/                # 事务管理
│   │   ├── index.ts
│   │   ├── transaction.service.ts  # 事务服务
│   │   ├── transaction.service.spec.ts
│   │   ├── transactional.decorator.ts  # 事务装饰器
│   │   └── transactional.decorator.spec.ts
│   │
│   ├── isolation/                  # 多租户隔离
│   │   ├── index.ts
│   │   ├── isolation.service.ts    # 隔离服务（集成 @hl8/nestjs-isolation）
│   │   ├── isolation.service.spec.ts
│   │   ├── isolation-aware.decorator.ts  # 隔离装饰器
│   │   └── isolation-aware.decorator.spec.ts
│   │
│   ├── monitoring/                 # 监控和健康检查
│   │   ├── index.ts
│   │   ├── health-check.service.ts # 健康检查服务
│   │   ├── health-check.service.spec.ts
│   │   ├── metrics.service.ts      # 性能指标服务
│   │   └── metrics.service.spec.ts
│   │
│   └── database.module.ts          # NestJS 模块定义
│   └── database.module.spec.ts
│
├── __tests__/                      # 集成测试
│   ├── integration/
│   │   ├── connection.integration.spec.ts
│   │   ├── transaction.integration.spec.ts
│   │   ├── isolation.integration.spec.ts
│   │   └── health-check.integration.spec.ts
│   │
│   └── fixtures/                   # 测试夹具
│       ├── test-config.ts
│       └── test-entities.ts
│
└── dist/                           # 构建输出（.gitignore）
    ├── index.js
    ├── index.d.ts
    └── ...
```

**Structure Decision**:

- 采用单一库项目结构（libs/database/）
- 按功能模块组织代码（connection/、transaction/、isolation/ 等）
- 单元测试与源代码同目录（.spec.ts）
- 集成测试集中在 **tests**/integration/
- 使用 src/ 作为源代码目录，dist/ 作为构建输出
- 遵循 NestJS 最佳实践的模块化组织

## Complexity Tracking

本模块完全符合宪章要求，无需违规豁免。

| 检查项                      | 状态    | 说明                                                           |
| --------------------------- | ------- | -------------------------------------------------------------- |
| 架构原则（DDD/CQRS/ES/EDA） | ✅ N/A  | 本模块作为基础设施层，不涉及业务逻辑，上述架构模式由使用方实现 |
| 模块系统                    | ✅ 符合 | 使用 ES Module，完全符合宪章要求                               |
| TypeScript 配置             | ✅ 符合 | 使用 NodeNext 模块系统，完全符合宪章要求                       |
| 编译工具                    | ✅ 符合 | 使用 tsc + swc，完全符合宪章要求                               |
| 测试架构                    | ✅ 符合 | 单元测试就近原则，集成测试集中管理                             |
| 数据隔离                    | ✅ 符合 | 集成 @hl8/nestjs-isolation，支持多层级隔离                     |
| 统一语言                    | ✅ 符合 | 使用统一术语（Tenant、Organization、Department、User）         |

**无复杂度违规，无需特殊豁免。**
