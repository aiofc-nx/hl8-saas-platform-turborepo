# Data Model: Database 连接管理模块

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 定义数据库模块的核心数据模型和关系

---

## 概述

作为基础设施模块，@hl8/database 本身不定义业务数据模型，而是提供用于管理数据库连接、事务、迁移和监控的内部数据结构。本文档描述模块内部使用的核心数据模型。

---

## 核心数据模型

### 1. ConnectionConfig（连接配置）

**用途**: 数据库连接的配置信息

```typescript
interface ConnectionConfig {
  /** 数据库类型 */
  type: "postgresql" | "mongodb";

  /** 主机地址 */
  host: string;

  /** 端口号 */
  port: number;

  /** 数据库名称 */
  database: string;

  /** 用户名 */
  username: string;

  /** 密码（敏感信息） */
  password: string;

  /** 连接池配置 */
  pool: PoolConfig;

  /** SSL 配置（可选） */
  ssl?: SSLConfig;
}
```

---

### 2. PoolConfig（连接池配置）

**用途**: 连接池行为配置

```typescript
interface PoolConfig {
  /** 最小连接数 */
  min: number;

  /** 最大连接数 */
  max: number;

  /** 空闲超时（毫秒） */
  idleTimeoutMillis: number;

  /** 获取连接超时（毫秒） */
  acquireTimeoutMillis: number;

  /** 创建连接超时（毫秒） */
  createTimeoutMillis: number;
}
```

**默认值**:

- min: 5
- max: 20
- idleTimeoutMillis: 600000 (10 分钟)
- acquireTimeoutMillis: 10000 (10 秒)
- createTimeoutMillis: 5000 (5 秒)

---

### 3. ConnectionStatus（连接状态）

**用途**: 表示数据库连接的当前状态

```typescript
enum ConnectionStatus {
  /** 未连接 */
  DISCONNECTED = "disconnected",

  /** 连接中 */
  CONNECTING = "connecting",

  /** 已连接 */
  CONNECTED = "connected",

  /** 连接失败 */
  FAILED = "failed",

  /** 重连中 */
  RECONNECTING = "reconnecting",
}
```

---

### 4. ConnectionInfo（连接信息）

**用途**: 连接的详细信息（用于监控和诊断）

```typescript
interface ConnectionInfo {
  /** 连接状态 */
  status: ConnectionStatus;

  /** 数据库类型 */
  type: string;

  /** 主机地址 */
  host: string;

  /** 端口号 */
  port: number;

  /** 数据库名称 */
  database: string;

  /** 连接建立时间 */
  connectedAt?: Date;

  /** 最后活动时间 */
  lastActivityAt?: Date;

  /** 连接池统计 */
  poolStats: PoolStats;
}
```

---

### 5. PoolStats（连接池统计）

**用途**: 连接池的实时统计信息

```typescript
interface PoolStats {
  /** 总连接数 */
  total: number;

  /** 活动连接数 */
  active: number;

  /** 空闲连接数 */
  idle: number;

  /** 等待中的请求数 */
  waiting: number;

  /** 最大连接数限制 */
  max: number;

  /** 最小连接数限制 */
  min: number;
}
```

---

### 6. TransactionOptions（事务选项）

**用途**: 事务的配置选项

```typescript
interface TransactionOptions {
  /** 事务隔离级别（使用数据库默认） */
  isolationLevel?: "read committed" | "repeatable read" | "serializable";

  /** 是否只读事务 */
  readOnly?: boolean;

  /** 事务超时（毫秒） */
  timeout?: number;
}
```

---

### 7. TransactionContext（事务上下文）

**用途**: 存储在 CLS 中的事务上下文信息

```typescript
interface TransactionContext {
  /** 事务 ID（用于追踪） */
  transactionId: string;

  /** 事务 EntityManager */
  entityManager: EntityManager;

  /** 事务开始时间 */
  startedAt: Date;

  /** 事务选项 */
  options?: TransactionOptions;

  /** 是否嵌套事务 */
  isNested: boolean;
}
```

---

### 8. IsolationContext（隔离上下文）

**用途**: 多租户数据隔离的上下文信息（来自 @hl8/isolation-model）

```typescript
interface IsolationContext {
  /** 平台 ID */
  platformId: string;

  /** 租户 ID */
  tenantId?: string;

  /** 组织 ID */
  organizationId?: string;

  /** 部门 ID */
  departmentId?: string;

  /** 用户 ID */
  userId?: string;

  /** 隔离级别 */
  level: IsolationLevel;

  /** 获取租户 ID */
  getTenantId(): string | undefined;

  /** 获取组织 ID */
  getOrganizationId(): string | undefined;

  /** 获取部门 ID */
  getDepartmentId(): string | undefined;

  /** 获取用户 ID */
  getUserId(): string | undefined;
}
```

**说明**: 此模型由 @hl8/isolation-model 提供，database 模块集成使用。

---

### 9. MigrationInfo（迁移信息）

**用途**: 数据库迁移的元数据

```typescript
interface MigrationInfo {
  /** 迁移名称 */
  name: string;

  /** 迁移执行时间 */
  executedAt: Date | null;

  /** 迁移状态 */
  status: "executed" | "pending" | "failed";

  /** 迁移文件路径 */
  path?: string;
}
```

---

### 10. MigrationResult（迁移结果）

**用途**: 迁移执行的结果信息

```typescript
interface MigrationResult {
  /** 成功执行的迁移 */
  executed: string[];

  /** 失败的迁移 */
  failed: string[];

  /** 执行时间（毫秒） */
  duration: number;

  /** 错误信息（如果有） */
  error?: string;
}
```

---

### 11. HealthCheckResult（健康检查结果）

**用途**: 数据库健康检查的结果

```typescript
interface HealthCheckResult {
  /** 健康状态 */
  status: "healthy" | "unhealthy" | "degraded";

  /** 检查时间 */
  checkedAt: Date;

  /** 响应时间（毫秒） */
  responseTime: number;

  /** 连接状态 */
  connection: {
    isConnected: boolean;
    error?: string;
  };

  /** 连接池状态 */
  pool: PoolStats;

  /** 详细信息 */
  details?: Record<string, any>;
}
```

---

### 12. QueryMetrics（查询性能指标）

**用途**: 查询执行的性能指标

```typescript
interface QueryMetrics {
  /** 查询 SQL */
  query: string;

  /** 执行时间（毫秒） */
  duration: number;

  /** 执行时间戳 */
  executedAt: Date;

  /** 是否为慢查询 */
  isSlow: boolean;

  /** 查询参数（脱敏） */
  params?: any[];

  /** 隔离上下文 */
  isolationContext?: {
    tenantId?: string;
    organizationId?: string;
    departmentId?: string;
  };

  /** 请求 ID（用于追踪） */
  requestId?: string;
}
```

---

### 13. SlowQueryLog（慢查询日志）

**用途**: 记录慢查询的详细信息

```typescript
interface SlowQueryLog {
  /** 日志 ID */
  id: string;

  /** 查询 SQL */
  query: string;

  /** 执行时间（毫秒） */
  duration: number;

  /** 执行时间戳 */
  timestamp: Date;

  /** 查询参数（脱敏） */
  params?: any[];

  /** 租户 ID */
  tenantId?: string;

  /** 请求 ID */
  requestId?: string;

  /** 堆栈跟踪 */
  stackTrace?: string;
}
```

---

### 14. DatabaseMetrics（数据库整体指标）

**用途**: 数据库的整体性能和资源使用指标

```typescript
interface DatabaseMetrics {
  /** 采集时间 */
  timestamp: Date;

  /** 连接池指标 */
  pool: PoolStats;

  /** 查询统计 */
  queries: {
    /** 总查询数 */
    total: number;

    /** 平均执行时间（毫秒） */
    avgDuration: number;

    /** 最大执行时间（毫秒） */
    maxDuration: number;

    /** 慢查询数量 */
    slowCount: number;
  };

  /** 事务统计 */
  transactions: {
    /** 活动事务数 */
    active: number;

    /** 提交成功数 */
    committed: number;

    /** 回滚数 */
    rolledBack: number;
  };

  /** 资源使用 */
  resources?: {
    /** 内存使用（字节） */
    memoryUsage?: number;

    /** CPU 使用率（百分比） */
    cpuUsage?: number;

    /** 磁盘使用（字节） */
    diskUsage?: number;
  };
}
```

---

## 数据关系图

```text
┌─────────────────────┐
│  ConnectionConfig   │
│  (配置信息)          │
└──────────┬──────────┘
           │
           │ 1:1
           ↓
┌─────────────────────┐         ┌─────────────────────┐
│  ConnectionInfo     │────1:1──│    PoolStats        │
│  (连接信息)          │         │  (连接池统计)        │
└─────────────────────┘         └─────────────────────┘
           │
           │ 1:N
           ↓
┌─────────────────────┐
│  TransactionContext │
│  (事务上下文)        │
└──────────┬──────────┘
           │
           │ 1:1
           ↓
┌─────────────────────┐
│  IsolationContext   │
│  (隔离上下文)        │
└─────────────────────┘


┌─────────────────────┐         ┌─────────────────────┐
│  HealthCheckResult  │────1:1──│    PoolStats        │
│  (健康检查结果)      │         │  (连接池统计)        │
└─────────────────────┘         └─────────────────────┘


┌─────────────────────┐         ┌─────────────────────┐
│   QueryMetrics      │────N:1──│  IsolationContext   │
│   (查询指标)         │         │  (隔离上下文)        │
└─────────────────────┘         └─────────────────────┘


┌─────────────────────┐         ┌─────────────────────┐
│  DatabaseMetrics    │────1:1──│    PoolStats        │
│  (数据库整体指标)    │         │  (连接池统计)        │
└─────────────────────┘         └─────────────────────┘
           │
           │ 1:1
           ↓
┌─────────────────────┐
│  TransactionStats   │
│  (事务统计)          │
└─────────────────────┘
```

---

## 数据状态机

### ConnectionStatus 状态转换

```text
  [DISCONNECTED]
       │
       │ connect()
       ↓
  [CONNECTING]
       │
       ├─ success ──→ [CONNECTED]
       │
       └─ failure ──→ [FAILED]
                          │
                          │ retry
                          ↓
                     [RECONNECTING]
                          │
                          ├─ success ──→ [CONNECTED]
                          │
                          └─ give up ──→ [FAILED]


  [CONNECTED]
       │
       │ disconnect() / error
       ↓
  [DISCONNECTED]
```

### Transaction 生命周期

```text
  [开始]
     │
     │ @Transactional() / beginTransaction()
     ↓
  [事务进行中]
     │
     ├─ 操作成功 ──→ [提交中] ──→ [已提交] ──→ [结束]
     │
     └─ 操作失败 ──→ [回滚中] ──→ [已回滚] ──→ [结束]
```

### Migration 执行流程

```text
  [pending]
     │
     │ up()
     ↓
  [executing]
     │
     ├─ success ──→ [executed]
     │
     └─ failure ──→ [failed]
                       │
                       │ down()
                       ↓
                   [rolled back] ──→ [pending]
```

---

## 数据验证规则

### ConnectionConfig 验证

- `host`: 非空字符串
- `port`: 1-65535 之间的整数
- `database`: 非空字符串
- `username`: 非空字符串
- `password`: 非空字符串
- `pool.min`: >= 0
- `pool.max`: >= pool.min
- `pool.idleTimeoutMillis`: >= 1000

### PoolConfig 验证

- `min >= 0`
- `max >= min`
- `max <= 100` (建议上限)
- `idleTimeoutMillis >= 1000` (至少 1 秒)
- `acquireTimeoutMillis >= 1000` (至少 1 秒)

### TransactionOptions 验证

- `isolationLevel`: 可选，仅支持指定的枚举值
- `readOnly`: 布尔值
- `timeout`: 如果指定，>= 1000 (至少 1 秒)

---

## 运行时内存数据

**说明**：database 模块不实现持久化缓存功能。以下数据仅在内存中维护，用于实时监控和诊断。如果应用层需要缓存数据库相关数据，应使用 @hl8/caching 模块。

### 慢查询日志（内存队列）

保留最近 N 条慢查询记录在内存中：

```typescript
interface SlowQueryMemoryCache {
  /** 最大保留数量（默认 100） */
  maxSize: number;

  /** 慢查询列表（FIFO 队列） */
  queries: SlowQueryLog[];
}
```

**特点**：

- 使用 FIFO（先进先出）策略
- 超过 maxSize 时自动移除最旧的记录
- 重启后数据丢失（这是预期行为）
- 不涉及 Redis 或其他持久化存储

**使用场景**：

- 实时查看最近的慢查询
- 临时性能分析
- 健康检查端点返回慢查询数量

**持久化建议**：

- 如需长期保存慢查询日志，应用层可以监听慢查询事件
- 使用专门的日志系统或 APM 工具（如 Elastic APM）
- 或使用 @hl8/caching 模块存储到 Redis

### 连接池统计（实时计算）

```typescript
interface PoolStats {
  total: number; // 当前总连接数
  active: number; // 活动连接数
  idle: number; // 空闲连接数
  waiting: number; // 等待连接的请求数
  max: number; // 最大连接数限制
  min: number; // 最小连接数限制
}
```

**特点**：

- 实时从连接池获取
- 不需要缓存或持久化
- 每次调用都返回最新状态

### 查询性能指标（滑动窗口）

可选的内存统计（用于监控接口）：

```typescript
interface QueryMetricsMemory {
  /** 滑动窗口大小（如最近 1000 次查询） */
  windowSize: number;

  /** 最近的查询执行时间 */
  recentDurations: number[];

  /** 统计信息 */
  stats: {
    total: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
  };
}
```

**特点**：

- 使用滑动窗口算法
- 仅保留最近 N 次查询的统计
- 不持久化

---

## 数据持久化

### 迁移历史表

虽然 database 模块主要在内存中管理数据，但 MikroORM 会在数据库中创建迁移历史表：

```sql
CREATE TABLE mikro_orm_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

### 审计日志（可选）

如果启用审计功能，可以记录所有数据库操作：

```sql
CREATE TABLE database_audit_log (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(255),
  operation_type VARCHAR(50) NOT NULL,
  query TEXT,
  duration INTEGER,
  timestamp TIMESTAMP NOT NULL,
  request_id VARCHAR(255),
  user_id VARCHAR(255),
  metadata JSONB
);
```

---

## 内存管理

**说明**：以下是 database 模块的内存使用估算，所有数据都在内存中维护，不涉及持久化缓存。

### ConnectionPool 内存占用

- 每个数据库连接: ~1-2MB
- 最大连接数 20: ~20-40MB
- 连接池元数据（统计、配置）: ~100KB

**特点**：

- 由 MikroORM 和数据库驱动管理
- 内存占用相对固定，受最大连接数限制

### QueryMetrics 内存占用（可选功能）

- 每个查询指标: ~500 bytes
- 保留最近 1000 条（滑动窗口）: ~500KB
- 超过窗口大小的记录自动丢弃

**特点**：

- 仅用于实时监控
- 重启后数据丢失
- 如需长期保存，应用层应使用 @hl8/caching 或专门的 APM 系统

### SlowQueryLog 内存占用

- 每个慢查询日志: ~1KB
- 保留最近 100 条（FIFO 队列）: ~100KB
- 超过队列大小的记录自动丢弃

**特点**：

- 仅用于快速诊断
- 重启后数据丢失
- 如需持久化慢查询日志，应用层应：
  - 使用 @hl8/caching 模块存储到 Redis
  - 或使用专门的日志系统（如 ELK、Datadog）
  - 或使用 APM 工具（如 Elastic APM、New Relic）

### 总内存估算

```
基础设施（必需）:
  - 连接池: ~20-40MB

可选监控数据（如启用）:
  - 查询指标: ~500KB
  - 慢查询日志: ~100KB

总计: ~20-50MB（根据配置）
```

---

## 索引策略

虽然 database 模块本身不创建业务表，但建议使用方在业务表上创建以下索引：

### 隔离字段索引

```sql
-- 租户级隔离
CREATE INDEX idx_tenant_id ON table_name(tenant_id);

-- 组织级隔离
CREATE INDEX idx_organization_id ON table_name(organization_id);

-- 部门级隔离
CREATE INDEX idx_department_id ON table_name(department_id);

-- 用户级隔离
CREATE INDEX idx_user_id ON table_name(user_id);

-- 复合索引（常用查询模式）
CREATE INDEX idx_tenant_org ON table_name(tenant_id, organization_id);
CREATE INDEX idx_tenant_dept ON table_name(tenant_id, department_id);
```

---

## 数据安全

### 敏感数据处理

- **密码**: 不记录到日志，不缓存，不传输到前端
- **查询参数**: 脱敏后记录（隐藏密码、邮箱等）
- **连接字符串**: 屏蔽密码字段

### 数据隔离保证

- 所有查询自动应用隔离过滤器
- 跨租户访问触发异常
- 记录审计日志

---

## 扩展性考虑

### 支持多数据库类型

模型设计支持扩展到其他数据库类型：

```typescript
type DatabaseType = "postgresql" | "mongodb" | "mysql" | "sqlite";
```

### 支持分片

为未来的数据库分片预留字段：

```typescript
interface ConnectionConfig {
  // ...其他字段

  /** 分片键（可选） */
  shardKey?: string;

  /** 分片数量（可选） */
  shardCount?: number;
}
```

### 支持读写分离

为未来的读写分离预留配置：

```typescript
interface ConnectionConfig {
  // ...其他字段

  /** 读库配置（可选） */
  replicas?: {
    host: string;
    port: number;
    weight?: number;
  }[];
}
```

---

## 总结

本文档定义了 @hl8/database 模块的核心数据模型，包括：

1. ✅ 连接配置和状态管理
2. ✅ 连接池监控和统计
3. ✅ 事务上下文管理
4. ✅ 多租户隔离上下文集成
5. ✅ 迁移元数据管理
6. ✅ 健康检查和性能指标
7. ✅ 查询监控和慢查询日志
8. ✅ 数据验证和安全策略

这些数据模型为模块的实现提供了清晰的结构和约束，确保类型安全和业务逻辑的一致性。

---

**完成时间**: 2025-10-13  
**下一步**: 定义 API 契约（contracts/）
