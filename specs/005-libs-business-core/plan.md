# Implementation Plan: SAAS平台核心业务模块扩展

**Branch**: `005-libs-business-core` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-libs-business-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

基于现有的libs/business-core混合架构框架，扩展SAAS平台核心业务模块，实现Platform、Tenant、Organization、Department、User等核心领域实体，为未来的进销存、人力资源管理、财务管理、客户关系管理等业务系统提供统一的架构基础和通用功能组件。采用Clean Architecture + DDD + CQRS + 事件溯源（ES）+ 事件驱动架构（EDA）的混合架构模式，确保多租户数据隔离、权限控制和事件驱动设计。

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js >=20  
**Primary Dependencies**: NestJS 11.1.6, @hl8/business-core, @hl8/isolation-model, @hl8/database, @hl8/messaging, @casl/ability  
**Storage**: PostgreSQL with multi-tenant isolation, Redis for caching  
**Testing**: Jest 30.2.0, ts-jest 29.4.5, NODE_OPTIONS=--experimental-vm-modules  
**Target Platform**: Linux server, cloud deployment  
**Project Type**: Monorepo library module (libs/business-core extension)  
**Performance Goals**: 5秒内创建租户，支持1000并发租户，事件处理延迟<100ms  
**Constraints**: 多租户数据隔离100%，基于CASL的权限控制准确率99.9%，组件复用率80%+  
**Scale/Scope**: 支持10000个实体实例，8层部门嵌套，用户兼职最多10个组织

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

- [x] 遵循 Clean Architecture + DDD + CQRS + ES + EDA 架构模式
- [x] 领域实体和聚合根分离
- [x] 用例在文档和设计中明确提及
- [x] 命令和查询分离
- [x] 事件溯源和事件驱动设计
- [x] 充血模型：领域对象包含业务逻辑，禁止贫血模型
- [x] 业务规则在领域对象内部实现，而非服务层
- [x] 对象状态变更通过业务方法，确保业务规则执行
- [x] 值对象表示无标识的不可变概念
- [x] 领域服务处理跨实体的领域逻辑
- [x] 仓储负责聚合的持久化
- [x] 规格模式封装复杂的业务规则
- [x] 领域事件记录领域内发生的重要事实

### Monorepo 组织原则

- [x] 项目结构符合 apps/packages/examples 组织
- [x] 领域模块作为独立项目开发
- [x] 使用 pnpm 作为包管理工具
- [x] 服务模块命名去掉 "-service" 后缀

### 质量保证原则

- [x] ESLint 配置继承根目录配置
- [x] TypeScript 配置继承 monorepo 根 tsconfig.json
- [x] 使用 MCP 工具进行代码检查

### 测试架构原则

- [x] 单元测试文件与被测试文件在同一目录（.spec.ts）
- [x] 集成测试放置在 `__tests__/integration/` 目录
- [x] 端到端测试放置在 `__tests__/e2e/` 目录
- [x] 测试之间相互独立，不依赖执行顺序
- [x] 核心业务逻辑测试覆盖率 ≥ 80%
- [x] 所有公共 API 必须有对应的测试用例

### 数据隔离与共享原则

- [x] 所有业务数据支持多层级隔离（平台、租户、组织、部门、用户）
- [x] 数据模型包含必需的隔离字段（tenantId、organizationId、departmentId、userId）
- [x] 为隔离字段创建数据库索引以优化查询性能
- [x] 数据明确分类为共享数据或非共享数据
- [x] 共享数据定义了明确的共享级别（平台/租户/组织/部门）
- [x] API请求携带完整的隔离标识（X-Tenant-Id、X-Organization-Id、X-Department-Id、X-User-Id）
- [x] 系统自动根据隔离上下文过滤数据，无需手动处理
- [x] 缓存键包含完整的隔离层级信息
- [x] 所有数据访问记录完整的隔离上下文到日志
- [x] 跨层级数据访问触发审计事件

### 统一语言原则（Ubiquitous Language）

- [x] 所有文档和代码使用 `docs/definition-of-terms.mdc` 中定义的统一术语
- [x] 核心业务实体命名符合术语定义（Platform、Tenant、Organization、Department、User）
- [x] 接口和方法命名使用统一术语，确保业务语义清晰
- [x] 代码注释中使用统一术语描述业务逻辑
- [x] 技术实现能够追溯到业务术语和领域模型

### TypeScript 配置原则

- [x] 使用 TypeScript 5.9.3 和 Node.js >=20
- [x] 配置继承 monorepo 根 tsconfig.json
- [x] 使用 NodeNext 模块解析
- [x] 启用严格类型检查
- [x] 禁止使用 any 类型（除特殊情况）
- [x] 使用 tsc + swc 构建策略
- [x] 独立的类型检查步骤

### 错误处理与日志记录原则

- [x] 异常优先，日志辅助的错误处理模式
- [x] 业务异常用于业务逻辑，日志用于监控调试
- [x] 结构化日志记录，包含完整的隔离上下文
- [x] 敏感信息保护，不记录密码等敏感数据
- [x] 异常层次结构清晰，业务异常与系统异常分离
- [x] 禁止用日志替代异常处理
- [x] 异常测试覆盖率要求
- [x] 错误监控和告警机制

### 性能和可扩展性原则

- [x] 支持水平扩展的架构设计
- [x] 合理的缓存策略提升性能
- [x] 支持读写分离和分库分表
- [x] 使用消息队列实现异步处理和解耦
- [x] 数据库索引优化查询性能
- [x] 事件处理性能优化

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

```text
libs/business-core/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── platform/
│   │   │   │   ├── platform.entity.ts
│   │   │   │   └── platform.entity.spec.ts
│   │   │   ├── tenant/
│   │   │   │   ├── tenant.entity.ts
│   │   │   │   ├── enterprise-tenant.entity.ts
│   │   │   │   ├── community-tenant.entity.ts
│   │   │   │   ├── team-tenant.entity.ts
│   │   │   │   ├── personal-tenant.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── organization/
│   │   │   │   ├── organization.entity.ts
│   │   │   │   ├── committee.entity.ts
│   │   │   │   ├── project-team.entity.ts
│   │   │   │   ├── quality-group.entity.ts
│   │   │   │   ├── performance-group.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── department/
│   │   │   │   ├── department.entity.ts
│   │   │   │   ├── level1-department.entity.ts
│   │   │   │   ├── level2-department.entity.ts
│   │   │   │   ├── level3-department.entity.ts
│   │   │   │   ├── level4-department.entity.ts
│   │   │   │   ├── level5-department.entity.ts
│   │   │   │   ├── level6-department.entity.ts
│   │   │   │   ├── level7-department.entity.ts
│   │   │   │   ├── level8-department.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── user/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── platform-user.entity.ts
│   │   │   │   ├── tenant-user.entity.ts
│   │   │   │   ├── organization-user.entity.ts
│   │   │   │   ├── department-user.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── authentication/
│   │   │   │   ├── authentication.entity.ts
│   │   │   │   ├── auth-credentials.entity.ts
│   │   │   │   ├── auth-session.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── permission/
│   │   │   │   ├── permission.entity.ts
│   │   │   │   ├── permission-scope.entity.ts
│   │   │   │   ├── permission-status.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── role/
│   │   │   │   ├── role.entity.ts
│   │   │   │   ├── role-type.entity.ts
│   │   │   │   ├── role-level.entity.ts
│   │   │   │   ├── role-status.entity.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── user-role.ts
│   │   │   ├── user-status.ts
│   │   │   ├── user-permission.ts
│   │   │   ├── tenant-type.ts
│   │   │   ├── organization-type.ts
│   │   │   ├── department-level.ts
│   │   │   ├── auth-type.ts
│   │   │   ├── auth-status.ts
│   │   │   ├── session-status.ts
│   │   │   ├── device-info.ts
│   │   │   ├── oauth-provider.ts
│   │   │   ├── permission-scope.ts
│   │   │   ├── permission-status.ts
│   │   │   ├── role-type.ts
│   │   │   ├── role-level.ts
│   │   │   ├── role-status.ts
│   │   │   └── *.spec.ts
│   │   ├── aggregates/
│   │   │   ├── platform-aggregate.ts
│   │   │   ├── tenant-aggregate.ts
│   │   │   ├── organization-aggregate.ts
│   │   │   ├── department-aggregate.ts
│   │   │   ├── user-aggregate.ts
│   │   │   ├── authentication-aggregate.ts
│   │   │   ├── session-aggregate.ts
│   │   │   ├── permission-aggregate.ts
│   │   │   ├── role-aggregate.ts
│   │   │   └── *.spec.ts
│   │   ├── repositories/
│   │   │   ├── platform.repository.ts
│   │   │   ├── tenant.repository.ts
│   │   │   ├── organization.repository.ts
│   │   │   ├── department.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── authentication.repository.ts
│   │   │   ├── session.repository.ts
│   │   │   ├── permission.repository.ts
│   │   │   ├── role.repository.ts
│   │   │   └── *.spec.ts
│   │   ├── services/
│   │   │   ├── platform.service.ts
│   │   │   ├── tenant.service.ts
│   │   │   ├── organization.service.ts
│   │   │   ├── department.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── authentication.service.ts
│   │   │   ├── session.service.ts
│   │   │   ├── password.service.ts
│   │   │   ├── mfa.service.ts
│   │   │   ├── oauth.service.ts
│   │   │   ├── permission.service.ts
│   │   │   ├── role.service.ts
│   │   │   ├── permission-merge.service.ts
│   │   │   ├── permission-inheritance.service.ts
│   │   │   └── *.spec.ts
│   │   ├── events/
│   │   │   ├── platform-events.ts
│   │   │   ├── tenant-events.ts
│   │   │   ├── organization-events.ts
│   │   │   ├── department-events.ts
│   │   │   ├── user-events.ts
│   │   │   ├── authentication-events.ts
│   │   │   ├── session-events.ts
│   │   │   ├── permission-events.ts
│   │   │   ├── role-events.ts
│   │   │   └── *.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── platform/
│   │   │   │   ├── create-platform.use-case.ts
│   │   │   │   ├── update-platform.use-case.ts
│   │   │   │   ├── delete-platform.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── tenant/
│   │   │   │   ├── create-tenant.use-case.ts
│   │   │   │   ├── update-tenant.use-case.ts
│   │   │   │   ├── delete-tenant.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── organization/
│   │   │   │   ├── create-organization.use-case.ts
│   │   │   │   ├── update-organization.use-case.ts
│   │   │   │   ├── delete-organization.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── department/
│   │   │   │   ├── create-department.use-case.ts
│   │   │   │   ├── update-department.use-case.ts
│   │   │   │   ├── delete-department.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── user/
│   │   │   │   ├── create-user.use-case.ts
│   │   │   │   ├── update-user.use-case.ts
│   │   │   │   ├── delete-user.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── authentication/
│   │   │   │   ├── authenticate-user.use-case.ts
│   │   │   │   ├── logout-user.use-case.ts
│   │   │   │   ├── refresh-token.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── session/
│   │   │   │   ├── create-session.use-case.ts
│   │   │   │   ├── validate-session.use-case.ts
│   │   │   │   ├── revoke-session.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── permission/
│   │   │   │   ├── create-permission.use-case.ts
│   │   │   │   ├── update-permission.use-case.ts
│   │   │   │   ├── delete-permission.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── role/
│   │   │   │   ├── create-role.use-case.ts
│   │   │   │   ├── update-role.use-case.ts
│   │   │   │   ├── delete-role.use-case.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── index.ts
│   │   ├── commands/
│   │   │   ├── platform-commands.ts
│   │   │   ├── tenant-commands.ts
│   │   │   ├── organization-commands.ts
│   │   │   ├── department-commands.ts
│   │   │   ├── user-commands.ts
│   │   │   ├── authentication-commands.ts
│   │   │   ├── session-commands.ts
│   │   │   ├── permission-commands.ts
│   │   │   ├── role-commands.ts
│   │   │   └── *.spec.ts
│   │   ├── queries/
│   │   │   ├── platform-queries.ts
│   │   │   ├── tenant-queries.ts
│   │   │   ├── organization-queries.ts
│   │   │   ├── department-queries.ts
│   │   │   ├── user-queries.ts
│   │   │   ├── authentication-queries.ts
│   │   │   ├── session-queries.ts
│   │   │   ├── permission-queries.ts
│   │   │   ├── role-queries.ts
│   │   │   └── *.spec.ts
│   │   ├── handlers/
│   │   │   ├── command-handlers/
│   │   │   ├── query-handlers/
│   │   │   ├── event-handlers/
│   │   │   └── *.spec.ts
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── repository-adapters/
│   │   │   │   ├── platform.repository.adapter.ts
│   │   │   │   ├── tenant.repository.adapter.ts
│   │   │   │   ├── organization.repository.adapter.ts
│   │   │   │   ├── department.repository.adapter.ts
│   │   │   │   ├── user.repository.adapter.ts
│   │   │   │   ├── authentication.repository.adapter.ts
│   │   │   │   ├── session.repository.adapter.ts
│   │   │   │   ├── permission.repository.adapter.ts
│   │   │   │   ├── role.repository.adapter.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── service-adapters/
│   │   │   │   ├── email.service.adapter.ts
│   │   │   │   ├── sms.service.adapter.ts
│   │   │   │   ├── notification.service.adapter.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── event-store-adapters/
│   │   │   │   ├── postgresql.event-store.adapter.ts
│   │   │   │   ├── mongodb.event-store.adapter.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── port-adapters/
│   │   │       ├── http.port.adapter.ts
│   │   │       ├── grpc.port.adapter.ts
│   │   │       └── *.spec.ts
│   │   ├── event-sourcing/
│   │   │   ├── event-store/
│   │   │   │   ├── postgresql.event-store.ts
│   │   │   │   ├── mongodb.event-store.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── snapshot-store/
│   │   │   │   ├── redis.snapshot-store.ts
│   │   │   │   ├── memory.snapshot-store.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── event-migration/
│   │   │       ├── event-migrator.ts
│   │   │       ├── version-handler.ts
│   │   │       └── *.spec.ts
│   │   ├── event-driven/
│   │   │   ├── message-queue/
│   │   │   │   ├── rabbitmq.message-queue.ts
│   │   │   │   ├── kafka.message-queue.ts
│   │   │   │   └── *.spec.ts
│   │   │   ├── dead-letter-queue/
│   │   │   │   ├── dlq.handler.ts
│   │   │   │   ├── retry.handler.ts
│   │   │   │   └── *.spec.ts
│   │   │   └── event-monitor/
│   │   │       ├── event.monitor.ts
│   │   │       ├── metrics.collector.ts
│   │   │       └── *.spec.ts
│   │   ├── factories/
│   │   │   ├── infrastructure.factory.ts
│   │   │   ├── infrastructure.manager.ts
│   │   │   └── *.spec.ts
│   │   ├── mappers/
│   │   │   ├── domain.mappers.ts
│   │   │   ├── dto.mappers.ts
│   │   │   └── *.spec.ts
│   │   └── index.ts
│   └── index.ts
├── __tests__/
│   ├── integration/
│   │   ├── platform.integration.spec.ts
│   │   ├── tenant.integration.spec.ts
│   │   ├── organization.integration.spec.ts
│   │   ├── department.integration.spec.ts
│   │   ├── user.integration.spec.ts
│   │   ├── authentication.integration.spec.ts
│   │   ├── session.integration.spec.ts
│   │   ├── permission.integration.spec.ts
│   │   └── role.integration.spec.ts
│   └── e2e/
│       ├── platform.e2e.spec.ts
│       ├── tenant.e2e.spec.ts
│       ├── organization.e2e.spec.ts
│       ├── department.e2e.spec.ts
│       ├── user.e2e.spec.ts
│       ├── authentication.e2e.spec.ts
│       ├── session.e2e.spec.ts
│       ├── permission.e2e.spec.ts
│       └── role.e2e.spec.ts
└── package.json
```

**Structure Decision**: 基于现有的libs/business-core架构，扩展领域实体、值对象、聚合根、仓储、服务、事件等核心组件，遵循Clean Architecture分层原则，支持多租户数据隔离和事件驱动架构。

## Complexity Tracking

**Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
