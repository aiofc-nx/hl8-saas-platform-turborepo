# Tasks: Database 连接管理模块

**Input**: Design documents from `/specs/004-database/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

<!--
  重要提示：在编写任务描述时，请使用 `docs/definition-of-terms.mdc` 中定义的统一术语，
  确保任务描述、文件命名、代码实现使用相同的领域语言（Ubiquitous Language）。
  核心术语包括：Platform（平台）、Tenant（租户）、Organization（组织）、Department（部门）、User（用户）等。
-->

**Tests**: 本模块需要完整的测试覆盖（目标 ≥ 80%），所有任务包含测试编写

**Organization**: 任务按用户故事组织，每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4, US5）
- 包含精确的文件路径

## Path Conventions

本项目是库项目（libs/database/），路径约定：

- 源代码：`libs/database/src/`
- 单元测试：与源代码同目录（.spec.ts）
- 集成测试：`libs/database/__tests__/integration/`
- 配置文件：`libs/database/`（根目录）

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建项目结构和基础配置

- [ ] **T001** [P] 创建项目目录结构 `libs/database/`
- [ ] **T002** [P] 创建 `libs/database/package.json`（type: "module"，配置依赖）
- [ ] **T003** [P] 创建 `libs/database/tsconfig.json`（继承根配置，NodeNext 模块系统）
- [ ] **T004** [P] 创建 `libs/database/tsconfig.build.json`（构建配置）
- [ ] **T005** [P] 创建 `libs/database/eslint.config.mjs`（继承根 ESLint 配置）
- [ ] **T006** [P] 创建 `libs/database/jest.config.ts`（Jest 测试配置）
- [ ] **T007** [P] 创建 `libs/database/README.md`（模块说明文档）
- [ ] **T008** [P] 创建 `libs/database/CHANGELOG.md`（变更日志）
- [ ] **T009** 在根目录 `pnpm-workspace.yaml` 中注册 `libs/database`
- [ ] **T010** 运行 `pnpm install` 安装依赖

**Checkpoint**: 项目结构就绪，可以开始编码

---

## Phase 2: Foundational (基础设施)

**Purpose**: 核心基础设施，所有用户故事的前置依赖

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事

### 常量和类型定义

- [ ] **T011** [P] 创建 `libs/database/src/constants/tokens.ts`（依赖注入令牌）
- [ ] **T012** [P] 创建 `libs/database/src/constants/tokens.spec.ts`
- [ ] **T013** [P] 创建 `libs/database/src/constants/defaults.ts`（默认配置值）
- [ ] **T014** [P] 创建 `libs/database/src/constants/defaults.spec.ts`
- [ ] **T015** [P] 创建 `libs/database/src/constants/error-codes.ts`（错误代码常量）
- [ ] **T016** [P] 创建 `libs/database/src/constants/index.ts`（常量导出）

### 类型定义

- [ ] **T017** [P] 创建 `libs/database/src/types/connection.types.ts`（连接相关类型）
- [ ] **T018** [P] 创建 `libs/database/src/types/transaction.types.ts`（事务相关类型）
- [ ] **T019** [P] 创建 `libs/database/src/types/monitoring.types.ts`（监控相关类型）
- [ ] **T020** [P] 创建 `libs/database/src/types/module.types.ts`（模块配置类型）
- [ ] **T021** [P] 创建 `libs/database/src/types/index.ts`（类型导出）

### 异常定义

- [ ] **T022** [P] 创建 `libs/database/src/exceptions/database-connection.exception.ts`
- [ ] **T023** [P] 创建 `libs/database/src/exceptions/database-connection.exception.spec.ts`
- [ ] **T024** [P] 创建 `libs/database/src/exceptions/database-query.exception.ts`
- [ ] **T025** [P] 创建 `libs/database/src/exceptions/database-query.exception.spec.ts`
- [ ] **T026** [P] 创建 `libs/database/src/exceptions/database-transaction.exception.ts`
- [ ] **T027** [P] 创建 `libs/database/src/exceptions/database-transaction.exception.spec.ts`
- [ ] **T028** [P] 创建 `libs/database/src/exceptions/isolation-context-missing.exception.ts`
- [ ] **T029** [P] 创建 `libs/database/src/exceptions/isolation-context-missing.exception.spec.ts`
- [ ] **T030** 创建 `libs/database/src/exceptions/index.ts`（异常导出）

### 配置管理

- [ ] **T031** 创建 `libs/database/src/config/database.config.ts`（集成 @hl8/config）
- [ ] **T032** 创建 `libs/database/src/config/database.config.spec.ts`
- [ ] **T033** 创建 `libs/database/src/config/index.ts`（配置导出）

**Checkpoint**: 基础设施就绪，所有用户故事可以开始

---

## Phase 3: User Story 1 - 应用启动建立数据库连接 (Priority: P1) 🎯 MVP

**Goal**: 实现数据库连接的自动建立和生命周期管理

**Independent Test**: 启动一个最小化的 NestJS 应用，导入 database 模块，验证连接是否成功建立

### 单元测试（User Story 1）

- [ ] **T034** [P] [US1] 创建 `libs/database/src/connection/connection.manager.spec.ts`（连接管理器测试）
- [ ] **T035** [P] [US1] 创建 `libs/database/src/connection/connection-pool.spec.ts`（连接池测试）
- [ ] **T036** [P] [US1] 创建 `libs/database/src/database.module.spec.ts`（模块测试）

### 实现（User Story 1）

- [ ] **T037** [P] [US1] 创建 `libs/database/src/connection/connection.manager.ts`（连接管理器实现）
  - 实现 connect() 方法
  - 实现 disconnect() 方法
  - 实现 getConnection() 方法
  - 实现连接健康检查
  - 实现自动重连机制
  - 注入 FastifyLoggerService 记录日志
- [ ] **T038** [P] [US1] 创建 `libs/database/src/connection/connection-pool.ts`（连接池管理）
  - 配置连接池参数
  - 实现连接复用逻辑
  - 实现空闲连接回收
  - 实现不健康连接检测
- [ ] **T039** [US1] 创建 `libs/database/src/connection/index.ts`（连接模块导出）

- [ ] **T040** [US1] 创建 `libs/database/src/database.module.ts`（NestJS 模块定义）
  - 实现 forRoot() 同步配置方法
  - 实现 forRootAsync() 异步配置方法
  - 集成 MikroOrmModule
  - 集成 ClsModule
  - 注册 ConnectionManager 提供者
  - 实现 onModuleInit 生命周期钩子
  - 实现 onModuleDestroy 生命周期钩子
- [ ] **T041** [US1] 创建 `libs/database/src/index.ts`（主导出文件）
  - 导出常量
  - 导出类型
  - 导出配置
  - 导出异常
  - 导出连接管理
  - 导出模块
  - 重新导出 MikroORM 常用类型和装饰器

### 集成测试（User Story 1）

- [ ] **T042** [US1] 创建 `libs/database/__tests__/fixtures/test-config.ts`（测试配置）
- [ ] **T043** [US1] 创建 `libs/database/__tests__/fixtures/test-entities.ts`（测试实体）
- [ ] **T044** [US1] 创建 `libs/database/__tests__/integration/connection.integration.spec.ts`
  - 测试应用启动时自动建立连接
  - 测试连接失败时抛出异常
  - 测试连接断开时自动重连
  - 测试应用关闭时优雅关闭连接

**Checkpoint**: User Story 1 完成 - 数据库连接管理功能可独立使用和测试

---

## Phase 4: User Story 2 - 多租户数据隔离 (Priority: P2)

**Goal**: 实现多租户数据隔离，确保租户数据完全隔离

**Independent Test**: 创建两个租户，在各自的隔离上下文中执行数据操作，验证租户 A 无法访问租户 B 的数据

### 单元测试（User Story 2）

- [ ] **T045** [P] [US2] 创建 `libs/database/src/isolation/isolation.service.spec.ts`
- [ ] **T046** [P] [US2] 创建 `libs/database/src/isolation/isolation-aware.decorator.spec.ts`

### 实现（User Story 2）

- [ ] **T047** [P] [US2] 创建 `libs/database/src/isolation/isolation.service.ts`
  - 集成 @hl8/nestjs-isolation 的 IsolationService
  - 实现 applyIsolationFilter() 方法（自动应用隔离过滤）
  - 实现 validateIsolationContext() 方法
  - 实现 getRequiredContext() 方法
  - 注入 FastifyLoggerService 记录隔离日志
- [ ] **T048** [P] [US2] 创建 `libs/database/src/isolation/isolation-aware.decorator.ts`
  - 实现 @IsolationAware() 装饰器
  - 支持配置隔离级别（TENANT/ORGANIZATION/DEPARTMENT/USER）
  - 在方法执行前验证隔离上下文
  - 缺少上下文时抛出 IsolationContextMissingException
- [ ] **T049** [US2] 创建 `libs/database/src/isolation/index.ts`（隔离模块导出）

- [ ] **T050** [US2] 更新 `libs/database/src/database.module.ts`
  - 注册 IsolationService 提供者
  - 导出 IsolationService

- [ ] **T051** [US2] 更新 `libs/database/src/index.ts`
  - 导出 isolation 模块

### 集成测试（User Story 2）

- [ ] **T052** [US2] 创建 `libs/database/__tests__/integration/isolation.integration.spec.ts`
  - 测试租户 A 只能访问自己的数据
  - 测试缺少隔离上下文时拒绝访问
  - 测试 @IsolationAware 装饰器正确验证上下文
  - 测试多级隔离（租户/组织/部门/用户）

**Checkpoint**: User Story 2 完成 - 多租户数据隔离功能可独立使用和测试

---

## Phase 5: User Story 3 - 事务管理 (Priority: P2)

**Goal**: 实现简便的事务管理机制，确保数据操作的原子性

**Independent Test**: 编写包含多个数据库操作的业务逻辑，在中途抛出异常，验证所有操作都被回滚

### 单元测试（User Story 3）

- [ ] **T053** [P] [US3] 创建 `libs/database/src/transaction/transaction.service.spec.ts`
- [ ] **T054** [P] [US3] 创建 `libs/database/src/transaction/transactional.decorator.spec.ts`

### 实现（User Story 3）

- [ ] **T055** [P] [US3] 创建 `libs/database/src/transaction/transaction.service.ts`
  - 实现 runInTransaction() 方法（编程式事务）
  - 实现 beginTransaction() 方法
  - 实现 commitTransaction() 方法
  - 实现 rollbackTransaction() 方法
  - 集成 nestjs-cls 存储事务上下文
  - 注入 FastifyLoggerService 记录事务日志
- [ ] **T056** [P] [US3] 创建 `libs/database/src/transaction/transactional.decorator.ts`
  - 实现 @Transactional() 装饰器
  - 支持嵌套事务检测
  - 自动提交成功的事务
  - 自动回滚失败的事务
  - 将事务 EntityManager 存储到 CLS 上下文
  - 事务结束后清理上下文
- [ ] **T057** [US3] 创建 `libs/database/src/transaction/index.ts`（事务模块导出）

- [ ] **T058** [US3] 更新 `libs/database/src/database.module.ts`
  - 注册 TransactionService 提供者
  - 导出 TransactionService

- [ ] **T059** [US3] 更新 `libs/database/src/index.ts`
  - 导出 transaction 模块
  - 导出 @Transactional 装饰器

### 集成测试（User Story 3）

- [ ] **T060** [US3] 创建 `libs/database/__tests__/integration/transaction.integration.spec.ts`
  - 测试事务成功时自动提交
  - 测试事务失败时自动回滚
  - 测试嵌套事务支持
  - 测试 @Transactional 装饰器
  - 测试手动管理事务

**Checkpoint**: User Story 3 完成 - 事务管理功能可独立使用和测试

---

## Phase 6: User Story 4 - 连接池管理 (Priority: P3)

**Goal**: 实现连接池优化，确保高并发场景下连接得到有效利用

**Independent Test**: 模拟大量并发请求，监控连接池使用情况，验证连接复用和释放

### 单元测试（User Story 4）

- [ ] **T061** [P] [US4] 更新 `libs/database/src/connection/connection-pool.spec.ts`
  - 添加连接池配置测试
  - 添加连接复用测试
  - 添加空闲超时测试
  - 添加不健康连接检测测试

### 实现（User Story 4）

- [ ] **T062** [US4] 增强 `libs/database/src/connection/connection-pool.ts`
  - 实现连接池满时的等待队列
  - 实现定期清理空闲连接
  - 实现连接健康检查
  - 实现连接池统计收集
  - 添加连接池状态日志

- [ ] **T063** [US4] 增强 `libs/database/src/config/database.config.ts`
  - 添加连接池配置选项（poolMin、poolMax、idleTimeout）
  - 添加连接超时配置
  - 添加配置验证规则

### 集成测试（User Story 4）

- [ ] **T064** [US4] 创建 `libs/database/__tests__/integration/connection-pool.integration.spec.ts`
  - 测试并发请求下的连接复用
  - 测试连接池满时的排队机制
  - 测试空闲连接自动回收
  - 测试连接池统计准确性

**Checkpoint**: User Story 4 完成 - 连接池优化功能可独立使用和测试

---

## Phase 7: User Story 5 - 监控和健康检查 (Priority: P4)

**Goal**: 实现实时监控数据库连接状态和性能指标

**Independent Test**: 调用健康检查端点，验证返回的监控数据是否准确

### 单元测试（User Story 5）

- [ ] **T065** [P] [US5] 创建 `libs/database/src/monitoring/health-check.service.spec.ts`
- [ ] **T066** [P] [US5] 创建 `libs/database/src/monitoring/metrics.service.spec.ts`

### 实现（User Story 5）

- [ ] **T067** [P] [US5] 创建 `libs/database/src/monitoring/health-check.service.ts`
  - 实现 check() 方法（返回连接状态）
  - 实现 getPoolStats() 方法（返回连接池统计）
  - 实现 checkConnectivity() 方法（测试数据库连通性）
  - 注入 FastifyLoggerService 记录健康检查日志
- [ ] **T068** [P] [US5] 创建 `libs/database/src/monitoring/metrics.service.ts`
  - 实现慢查询内存队列（FIFO，最近 100 条）
  - 实现 recordQuery() 方法（记录查询执行时间）
  - 实现 getSlowQueries() 方法（返回慢查询列表）
  - 实现 getDatabaseMetrics() 方法（返回整体指标）
  - 实现查询性能统计（滑动窗口，最近 1000 次）
  - 注入 FastifyLoggerService 记录监控日志
- [ ] **T069** [US5] 创建 `libs/database/src/monitoring/index.ts`（监控模块导出）

- [ ] **T070** [US5] 更新 `libs/database/src/database.module.ts`
  - 注册 HealthCheckService 提供者
  - 注册 MetricsService 提供者
  - 导出监控服务

- [ ] **T071** [US5] 更新 `libs/database/src/index.ts`
  - 导出 monitoring 模块

### 集成测试（User Story 5）

- [ ] **T072** [US5] 创建 `libs/database/__tests__/integration/health-check.integration.spec.ts`
  - 测试健康检查返回正确状态
  - 测试连接池统计准确性
  - 测试慢查询记录功能
  - 测试多租户环境下的独立统计

**Checkpoint**: User Story 5 完成 - 监控和健康检查功能可独立使用和测试

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 完善整体质量，跨用户故事的改进

### 文档完善

- [ ] **T073** [P] 完善 `libs/database/README.md`
  - 添加快速开始指南
  - 添加完整的 API 文档
  - 添加使用示例
  - 添加常见问题解答
- [ ] **T074** [P] 创建 `libs/database/docs/API.md`（详细 API 文档）

- [ ] **T075** [P] 创建 `libs/database/docs/INTEGRATION.md`（集成指南）

### 代码质量

- [ ] **T076** 运行 ESLint 检查所有代码：`pnpm --filter @hl8/database lint`
- [ ] **T077** 运行 TypeScript 类型检查：`pnpm --filter @hl8/database type-check`
- [ ] **T078** 运行所有测试：`pnpm --filter @hl8/database test`
- [ ] **T079** 生成测试覆盖率报告：`pnpm --filter @hl8/database test:cov`
- [ ] **T080** 验证测试覆盖率 ≥ 80%

### 构建验证

- [ ] **T081** 执行生产构建：`pnpm --filter @hl8/database build:swc`
- [ ] **T082** 验证构建产物（dist/ 目录结构正确）
- [ ] **T083** 验证类型定义文件（.d.ts 文件完整）

### 示例应用

- [ ] **T084** 创建 `examples/database-usage/` 示例应用
  - 演示基本连接
  - 演示事务使用
  - 演示多租户隔离
  - 演示健康检查

### 最终验证

- [ ] **T085** 运行 `specs/004-database/quickstart.md` 中的所有示例代码
- [ ] **T086** 验证所有功能需求（FR-001 到 FR-039）都已实现
- [ ] **T087** 验证所有成功标准（SC-001 到 SC-009）都已达成
- [ ] **T088** 更新 `libs/database/CHANGELOG.md`

**Checkpoint**: 所有功能完成，模块生产就绪

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
   ↓
Phase 2: Foundational (基础设施) ← BLOCKS 所有用户故事
   ↓
   ├─→ Phase 3: User Story 1 (P1) - 数据库连接 🎯 MVP
   │
   ├─→ Phase 4: User Story 2 (P2) - 多租户隔离
   │
   ├─→ Phase 5: User Story 3 (P2) - 事务管理
   │
   ├─→ Phase 6: User Story 4 (P3) - 连接池管理
   │
   └─→ Phase 7: User Story 5 (P4) - 监控和健康检查

所有用户故事完成后
   ↓
Phase 8: Polish & Cross-Cutting Concerns
```

### User Story Dependencies

| User Story          | 依赖         | 可以并行？ | 说明                       |
| ------------------- | ------------ | ---------- | -------------------------- |
| US1 (P1) 数据库连接 | Phase 2      | -          | 最高优先级，MVP 核心       |
| US2 (P2) 多租户隔离 | Phase 2, US1 | 部分       | 依赖基础连接，但可独立实现 |
| US3 (P2) 事务管理   | Phase 2, US1 | 部分       | 依赖基础连接，但可独立实现 |
| US4 (P3) 连接池管理 | Phase 2, US1 | 部分       | 增强 US1 的连接池功能      |
| US5 (P4) 监控检查   | Phase 2, US1 | 部分       | 监控所有功能，但可独立实现 |

**说明**：

- US2 和 US3 可以并行开发（不同的服务，不同的文件）
- US4 会增强 US1 的连接池功能（需要修改同一文件）
- US5 可以独立开发，但监控数据来自其他故事

### Within Each Phase

#### Phase 3 (US1) 内部顺序

```
T034-T036 (单元测试) → 可并行
   ↓
T037-T038 (核心实现) → 可并行
   ↓
T039 (导出) → T040 (模块) → T041 (主导出)
   ↓
T042-T044 (集成测试) → 可并行
```

#### Phase 4 (US2) 内部顺序

```
T045-T046 (单元测试) → 可并行
   ↓
T047-T048 (实现) → 可并行
   ↓
T049 (导出) → T050 (更新模块) → T051 (更新主导出)
   ↓
T052 (集成测试)
```

#### Phase 5 (US3) 内部顺序

```
T053-T054 (单元测试) → 可并行
   ↓
T055-T056 (实现) → 可并行
   ↓
T057 (导出) → T058 (更新模块) → T059 (更新主导出)
   ↓
T060 (集成测试)
```

### Parallel Opportunities

#### 跨 Phase 并行（推荐）

```bash
# 如果团队有 3 个开发者
开发者 A: Phase 3 (US1) - 数据库连接
开发者 B: Phase 4 (US2) - 多租户隔离  # 等 Phase 3 基础连接完成后开始
开发者 C: Phase 5 (US3) - 事务管理    # 等 Phase 3 基础连接完成后开始
```

#### Phase 内并行

```bash
# Phase 2 (Foundational) 内的并行任务
并行执行: T011-T021 (所有常量和类型定义)
并行执行: T022-T029 (所有异常类定义)

# Phase 3 (US1) 内的并行任务
并行执行: T034-T036 (所有单元测试)
并行执行: T037-T038 (连接管理器和连接池)
并行执行: T042-T044 (集成测试的测试夹具和测试用例)
```

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 同时启动所有类型定义任务
Task T017: "创建 connection.types.ts"
Task T018: "创建 transaction.types.ts"
Task T019: "创建 monitoring.types.ts"
Task T020: "创建 module.types.ts"

# 同时启动所有异常类任务
Task T022: "创建 database-connection.exception.ts"
Task T024: "创建 database-query.exception.ts"
Task T026: "创建 database-transaction.exception.ts"
Task T028: "创建 isolation-context-missing.exception.ts"
```

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# 单元测试可以并行编写
Task T034: "创建 connection.manager.spec.ts"
Task T035: "创建 connection-pool.spec.ts"
Task T036: "创建 database.module.spec.ts"

# 核心实现可以并行开发
Task T037: "创建 connection.manager.ts"
Task T038: "创建 connection-pool.ts"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

**最小可用产品**：

```
Phase 1: Setup (T001-T010)
   ↓
Phase 2: Foundational (T011-T033)
   ↓
Phase 3: User Story 1 (T034-T044)
   ↓
验证并部署 MVP
```

**MVP 功能**：

- ✅ 数据库连接管理
- ✅ 连接健康检查
- ✅ 基本的连接池
- ✅ 异常处理
- ✅ 配置管理

**工作量估算**: 3-4 天

---

### Incremental Delivery (渐进交付)

**第一轮**: Setup + Foundational + US1

- 交付时间：3-4 天
- 价值：基础数据库连接能力
- 测试：可独立测试连接功能

**第二轮**: + US2 (多租户隔离)

- 增量时间：2-3 天
- 价值：多租户数据安全
- 测试：可独立测试隔离功能

**第三轮**: + US3 (事务管理)

- 增量时间：2-3 天
- 价值：数据一致性保证
- 测试：可独立测试事务功能

**第四轮**: + US4 (连接池优化)

- 增量时间：1-2 天
- 价值：高并发性能提升
- 测试：可独立测试连接池

**第五轮**: + US5 (监控检查)

- 增量时间：2-3 天
- 价值：运维可观测性
- 测试：可独立测试监控接口

**总工作量**: 10-15 天（全功能）

---

### Parallel Team Strategy

**3 个开发者并行工作**：

#### 第一周

```
所有人: Phase 1 + Phase 2 (2 天)
   ↓
开发者 A: Phase 3 (US1) - 数据库连接 (2-3 天)
开发者 B: Phase 4 (US2) - 多租户隔离 (2-3 天，等 US1 基础连接完成)
开发者 C: Phase 5 (US3) - 事务管理 (2-3 天，等 US1 基础连接完成)
```

#### 第二周

```
开发者 A: Phase 6 (US4) - 连接池管理 (1-2 天)
开发者 B: Phase 7 (US5) - 监控检查 (2-3 天)
开发者 C: Phase 8 - 文档和示例 (2-3 天)
```

**总时间**: 1.5-2 周（并行开发）

---

## Task Summary

### 总览

| Phase                 | 任务数 | 预估时间     | 可并行任务             |
| --------------------- | ------ | ------------ | ---------------------- |
| Phase 1: Setup        | 10     | 0.5 天       | T001-T008 (8个)        |
| Phase 2: Foundational | 23     | 1.5 天       | 大部分可并行           |
| Phase 3: US1          | 11     | 3-4 天       | T034-T038, T042-T044   |
| Phase 4: US2          | 8      | 2-3 天       | T045-T048              |
| Phase 5: US3          | 8      | 2-3 天       | T053-T056              |
| Phase 6: US4          | 4      | 1-2 天       | T061-T064 (部分)       |
| Phase 7: US5          | 8      | 2-3 天       | T065-T068, T072 (部分) |
| Phase 8: Polish       | 16     | 2-3 天       | T073-T075 (部分)       |
| **总计**              | **88** | **10-15 天** | **~40 个可并行**       |

### 按用户故事统计

| User Story       | 任务数 | 核心文件数 | 测试文件数 |
| ---------------- | ------ | ---------- | ---------- |
| US1 - 数据库连接 | 11     | 5          | 6          |
| US2 - 多租户隔离 | 8      | 3          | 3          |
| US3 - 事务管理   | 8      | 3          | 3          |
| US4 - 连接池管理 | 4      | 2          | 2          |
| US5 - 监控检查   | 8      | 3          | 3          |

### MVP 范围（推荐）

**仅实现 User Story 1**：

- 任务范围：T001-T044（44 个任务）
- 工作量：3-4 天
- 交付价值：可用的数据库连接管理模块

---

## Notes

### 任务执行原则

- ✅ 按 Phase 顺序执行（Setup → Foundational → User Stories → Polish）
- ✅ Phase 2 必须完全完成才能开始任何用户故事
- ✅ 每个用户故事完成后验证独立性
- ✅ [P] 标记的任务可以并行执行
- ✅ 单元测试在实现前编写（TDD）
- ✅ 每个 Checkpoint 后验证功能

### 代码规范

- ✅ 所有代码注释使用中文，遵循 TSDoc 规范
- ✅ 使用统一术语（Tenant、Organization、Department、User）
- ✅ 所有异常继承自 AbstractHttpException
- ✅ 所有服务注入 FastifyLoggerService
- ✅ ES Module 格式（import/export）
- ✅ NodeNext 模块系统

### 测试要求

- ✅ 单元测试与源代码同目录（.spec.ts）
- ✅ 集成测试放在 `__tests__/integration/`
- ✅ 测试覆盖率目标 ≥ 80%
- ✅ 所有公共 API 必须有测试
- ✅ 每个用户故事的独立性必须通过测试验证

### 提交策略

- 提交粒度：每完成 2-3 个相关任务提交一次
- 提交信息：使用中文，格式 `feat(database): 实现连接管理器`
- Checkpoint 后强制提交
- 每个用户故事完成后打 tag

---

**任务清单生成时间**: 2025-10-13  
**Feature Branch**: 004-database  
**总任务数**: 88  
**预估总工作量**: 10-15 天（单人），1.5-2 周（3 人并行）  
**MVP 任务数**: 44（仅 US1）  
**MVP 工作量**: 3-4 天
