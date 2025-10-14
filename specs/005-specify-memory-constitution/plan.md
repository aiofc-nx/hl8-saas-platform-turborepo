# Implementation Plan: SAAS 平台核心模块重构

**Branch**: `005-specify-memory-constitution` | **Date**: 2025-01-27 | **Spec**: `/specs/005-specify-memory-constitution/spec.md`
**Input**: Feature specification from `/specs/005-specify-memory-constitution/spec.md`

**Note**: 基于用户关键事项补充完善的实施计划

## Summary

本次重构的核心目标是清理和重构 SAAS 平台的核心模块，确保架构的纯粹性和现代化。主要技术路径包括：1) 将旧代码从 CommonJS 迁移到 NodeNext 模块系统；2) 替换旧的基础设施模块为新的基础设施模块；3) 保持重构后的代码目录结构与混合架构要求一致；4) 严格执行领域层实体与聚合根分离、应用层以用例为核心的原则。

## Technical Context

### 语言/版本

- **TypeScript**: 5.9.2（严格模式）
- **Node.js**: >= 20
- **模块系统**: NodeNext（ES 模块）
- **ESLint**: 最新版本
- **Prettier**: 最新版本

### 主要依赖

- **NestJS**: 企业级 Node.js 框架
- **Turborepo**: Monorepo 管理工具
- **pnpm**: 包管理工具
- **Jest**: 测试框架
- **SWC**: 快速编译工具

### 存储

- **PostgreSQL**: 主数据库
- **Redis**: 缓存和会话存储
- **Event Store**: 事件溯源存储

### 测试

- **Jest**: 单元测试和集成测试
- **NestJS Testing Module**: 应用层测试
- **分层测试**: 单元测试、集成测试、E2E 测试

### 目标平台

- **Linux 服务器**: 生产环境
- **Docker 容器**: 部署环境
- **云原生**: 支持 Kubernetes

### 项目类型

- **Monorepo**: 基于 Turborepo 的多项目管理
- **企业级 SAAS**: 多租户平台

### 性能目标

- **API 响应时间**: < 200ms (p95)
- **并发用户**: 10,000+ 并发
- **数据处理**: 支持大规模多租户数据隔离

### 约束

- **模块系统迁移**: 必须从 CommonJS 迁移到 NodeNext
- **架构一致性**: 必须保持混合架构的目录结构
- **向后兼容**: 重构过程中保持功能完整性
- **测试覆盖率**: 核心业务逻辑 ≥ 80%

### 规模/范围

- **代码规模**: 重构 2 个核心模块（hybrid-archi, saas-core）
- **用户规模**: 支持企业级多租户场景
- **功能范围**: SAAS 平台核心业务功能

## Constitution Check

**GATE**: ✅ 已通过 - 所有宪章检查项均符合要求

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

- [x] 遵循 Clean Architecture + CQRS + ES + EDA 架构模式
- [x] 领域实体和聚合根分离
- [x] 用例在文档和设计中明确提及
- [x] 命令和查询分离
- [x] 事件溯源和事件驱动设计

### Monorepo 组织原则

- [x] 项目结构符合 apps/libs/packages 组织
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

### CommonJS 到 NodeNext 迁移原则

- [x] 所有旧代码必须从 CommonJS 迁移到 NodeNext 模块系统
- [x] 更新 package.json 配置 type: "module"
- [x] 更新 tsconfig.json 配置 NodeNext 模块系统
- [x] 将所有 require()/module.exports 更新为 import/export 语法
- [x] 确保所有模块能够正常编译和运行

## Project Structure

### Documentation (this feature)

```text
specs/005-specify-memory-constitution/
├── plan.md              # 实施计划 (本文件)
├── research.md          # Phase 0 输出 - 研究文档
├── data-model.md        # Phase 1 输出 - 数据模型设计
├── quickstart.md        # Phase 1 输出 - 快速开始指南
├── contracts/           # Phase 1 输出 - API 合约
│   └── module-refactoring-api.yaml
├── checklists/          # 检查清单
│   └── requirements.md
├── constitution-compliance-report.md  # 宪章合规性报告
└── compliance-summary.md             # 合规性总结
```

### Source Code (repository root)

```text
# Monorepo 结构 (基于 Turborepo)
├── apps/                          # 应用程序项目
│   └── fastify-api/              # 主API服务
├── libs/                         # 服务端业务库和领域模块
│   ├── hybrid-archi/             # 架构基础库 (重构目标)
│   │   ├── src/
│   │   │   ├── domain/           # 领域层 - 实体与聚合根分离
│   │   │   │   ├── entities/     # 领域实体
│   │   │   │   ├── aggregates/   # 聚合根
│   │   │   │   ├── value-objects/ # 值对象
│   │   │   │   └── events/       # 领域事件
│   │   │   ├── application/      # 应用层 - 以用例为核心
│   │   │   │   ├── use-cases/    # 用例实现
│   │   │   │   ├── commands/     # 命令
│   │   │   │   ├── queries/      # 查询
│   │   │   │   └── handlers/     # 命令/查询处理器
│   │   │   ├── infrastructure/   # 基础设施层
│   │   │   └── interface/        # 接口层
│   │   ├── package.json          # NodeNext 模块系统配置
│   │   └── tsconfig.json         # TypeScript NodeNext 配置
│   ├── saas-core/                # SAAS核心业务模块 (重构目标)
│   │   ├── src/
│   │   │   ├── domain/           # 领域层 - 业务实体和聚合根
│   │   │   │   ├── tenant/       # 租户领域
│   │   │   │   │   ├── entities/
│   │   │   │   │   └── aggregates/
│   │   │   │   ├── user/         # 用户领域
│   │   │   │   ├── organization/ # 组织领域
│   │   │   │   └── department/   # 部门领域
│   │   │   ├── application/      # 应用层 - 业务用例
│   │   │   │   ├── use-cases/    # 业务用例
│   │   │   │   ├── commands/     # 业务命令
│   │   │   │   └── queries/      # 业务查询
│   │   │   ├── infrastructure/   # 基础设施层
│   │   │   └── interface/        # 接口层
│   │   ├── package.json          # 新基础设施模块依赖
│   │   └── tsconfig.json         # NodeNext 配置
│   ├── isolation-model/          # 隔离模型模块 (重叠内容处理)
│   ├── database/                 # 数据库基础设施
│   ├── caching/                  # 缓存基础设施
│   ├── nestjs-fastify/           # NestJS + Fastify 集成
│   │   └── logging/              # 日志服务
│   ├── nestjs-isolation/         # 多租户隔离服务
│   └── exceptions/               # 异常处理服务
├── packages/                     # 前端业务库和共享工具包
│   ├── eslint-config/            # ESLint 配置
│   └── ts-config/                # TypeScript 配置
├── examples/                     # 示例和演示项目
├── docs/                         # 项目文档
│   ├── guides/                   # 开发指南
│   └── definition-of-terms.mdc   # 统一术语定义
├── specs/                        # 功能规范文档
│   └── 005-specify-memory-constitution/
├── .specify/                     # 规范工具配置
└── pnpm-workspace.yaml           # 工作区配置
```

**Structure Decision**: 采用现有的 Turborepo monorepo 结构，符合宪章的 Monorepo 组织原则。重构主要涉及 `libs/` 目录下的三个核心模块：`hybrid-archi`（架构基础库）、`saas-core`（业务模块）、`isolation-model`（新增隔离模型）。基础设施模块位于 `libs/` 目录下，支持模块间的清晰依赖关系。

### 重构关键事项

1. **CommonJS 到 NodeNext 迁移**: 所有模块的 package.json 配置 `"type": "module"`，tsconfig.json 使用 NodeNext 模块系统
2. **基础设施模块替换**: 将旧的基础设施模块替换为新的基础设施模块
3. **目录结构保持**: 重构后的代码目录结构与混合架构要求一致
4. **领域层分离**: 严格执行实体与聚合根分离原则
5. **应用层用例**: 应用层以用例为核心进行组织

## Complexity Tracking

**无违规情况** - 所有宪章检查项均通过，无需额外的复杂性说明。

## 实施阶段状态

### Phase 0: 研究阶段 ✅ 已完成

- **研究文档**: `research.md` - 技术决策汇总和风险评估
- **技术决策**: 分离重构策略、重叠内容处理方案、基础设施模块迁移方案、CommonJS 到 NodeNext 迁移方案
- **风险缓解**: 详细的重叠内容分析、渐进式迁移、完整测试覆盖、模块系统迁移验证

### Phase 1: 设计和合约 ✅ 已完成

- **数据模型**: `data-model.md` - 核心实体模型、数据关系模型、验证规则
- **API 合约**: `contracts/module-refactoring-api.yaml` - 完整的 OpenAPI 3.0 规范
- **快速开始**: `quickstart.md` - 使用指南、代码示例、测试指南、CommonJS 到 NodeNext 迁移示例
- **宪章合规性**: `constitution-compliance-report.md` - 全面的宪章合规性检查报告

### Phase 2: 任务规划 ⏳ 待执行

- **任务分解**: 基于用户关键事项制定详细的任务规划
- **实施顺序**: 确定重构的优先级和执行顺序
- **资源分配**: 规划开发资源和时间安排

## 下一步行动

基于用户提供的关键事项，下一步需要：

1. **执行 `/speckit.tasks` 命令** - 创建详细的任务规划
2. **制定实施顺序** - 按照关键事项确定重构优先级
3. **开始实际重构** - 按照任务规划执行重构工作
