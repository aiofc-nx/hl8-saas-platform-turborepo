# Data Model: Caching 模块数据模型

**Date**: 2025-10-12  
**Feature**: 将 libs/nestjs-infra/src/caching 拆分为独立的 libs/nestjs-caching 库项目  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## 概述

本文档定义 Caching 模块的核心数据模型，包括值对象（Value Objects）、领域事件（Domain Events）、配置类型（Configuration Types）和接口定义（Interfaces）。

根据 DDD 充血模型原则，所有业务规则和验证逻辑都封装在领域对象内部，而非散落在服务层。

---

## 核心概念

### 数据模型分层

```text
┌─────────────────────────────────────────────────┐
│  Domain Layer（领域层）                          │
│  - Value Objects（值对象）                       │
│  - Domain Events（领域事件）                     │
│  - Business Rules（业务规则）                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Application Layer（应用层）                     │
│  - Services（服务）                              │
│  - Interfaces（接口）                            │
│  - DTOs（数据传输对象）                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Infrastructure Layer（基础设施层）               │
│  - Redis Client（Redis 客户端）                  │
│  - Serialization（序列化）                       │
│  - Monitoring（监控）                            │
└─────────────────────────────────────────────────┘
```

---

## 值对象（Value Objects）

### CacheKey (缓存键值对象)

**职责**: 封装缓存键的生成逻辑和验证规则

#### 属性

| 属性               | 类型                | 描述                      | 必需 |
| ------------------ | ------------------- | ------------------------- | ---- |
| `fullKey`          | `string`            | 完整的缓存键（只读）      | ✅   |
| `prefix`           | `string`            | 键前缀（如 `hl8:cache:`） | ✅   |
| `level`            | `CacheLevel`        | 缓存层级（枚举）          | ✅   |
| `namespace`        | `string`            | 命名空间（业务模块名）    | ✅   |
| `key`              | `string`            | 原始键名                  | ✅   |
| `isolationContext` | `IsolationContext?` | 隔离上下文（可选）        | ❌   |

#### 业务规则

**键格式规则**:

- 格式: `{prefix}:{level}:{identifiers}:{namespace}:{key}`
- 示例:
  - 平台级: `hl8:cache:platform:user-settings:theme`
  - 租户级: `hl8:cache:tenant:t123:config:feature-flags`
  - 组织级: `hl8:cache:tenant:t123:org:o456:members:list`
  - 部门级: `hl8:cache:tenant:t123:org:o456:dept:d789:tasks:active`
  - 用户级: `hl8:cache:user:u999:preferences:language`

**长度限制**:

- 最大长度: 256 字符
- 原因: Redis 键长度限制和性能考虑

**字符限制**:

- 允许: 字母、数字、冒号（:）、下划线（\_）、连字符（-）
- 禁止: 空格、特殊字符（!@#$%^&\*等）
- 原因: 避免键冲突和编码问题

**层级验证**:

- 平台级: 无需隔离上下文
- 租户级: 必需 `tenantId`
- 组织级: 必需 `tenantId` + `organizationId`
- 部门级: 必需 `tenantId` + `organizationId` + `departmentId`
- 用户级: 必需 `userId`

#### 静态工厂方法

```typescript
// 平台级缓存键
CacheKey.forPlatform(namespace: string, key: string, prefix: string): CacheKey

// 租户级缓存键
CacheKey.forTenant(
  namespace: string,
  key: string,
  prefix: string,
  context: IsolationContext
): CacheKey

// 组织级缓存键
CacheKey.forOrganization(
  namespace: string,
  key: string,
  prefix: string,
  context: IsolationContext
): CacheKey

// 部门级缓存键
CacheKey.forDepartment(
  namespace: string,
  key: string,
  prefix: string,
  context: IsolationContext
): CacheKey

// 用户级缓存键
CacheKey.forUser(
  namespace: string,
  key: string,
  prefix: string,
  context: IsolationContext
): CacheKey

// 自动判断层级（推荐）
CacheKey.fromContext(
  namespace: string,
  key: string,
  prefix: string,
  context: IsolationContext
): CacheKey
```

#### 实例方法

```typescript
// 获取完整键
toString(): string

// 获取缓存层级
getLevel(): CacheLevel

// 生成匹配模式（用于批量删除）
toPattern(): string

// 值对象相等性比较
equals(other: CacheKey): boolean
```

#### 使用示例

```typescript
// 示例 1: 平台级缓存键
const platformKey = CacheKey.forPlatform('system', 'version', 'hl8:cache:');
console.log(platformKey.toString());
// 输出: hl8:cache:platform:system:version

// 示例 2: 租户级缓存键
const context = { tenantId: 't123' };
const tenantKey = CacheKey.forTenant(
  'config',
  'feature-flags',
  'hl8:cache:',
  context,
);
console.log(tenantKey.toString());
// 输出: hl8:cache:tenant:t123:config:feature-flags

// 示例 3: 自动判断层级
const autoKey = CacheKey.fromContext('user-list', 'active', 'hl8:cache:', {
  tenantId: 't123',
  organizationId: 'o456',
  departmentId: 'd789',
});
console.log(autoKey.toString());
// 输出: hl8:cache:tenant:t123:org:o456:dept:d789:user-list:active
```

---

### CacheEntry (缓存条目值对象)

**职责**: 封装缓存条目的验证、序列化和反序列化逻辑

#### 属性

| 属性              | 类型       | 描述                 | 必需 |
| ----------------- | ---------- | -------------------- | ---- |
| `key`             | `CacheKey` | 缓存键（值对象）     | ✅   |
| `value`           | `T`        | 缓存值（泛型）       | ✅   |
| `ttl`             | `number`   | 过期时间（秒）       | ✅   |
| `createdAt`       | `Date`     | 创建时间             | ✅   |
| `serializedValue` | `string`   | 序列化后的值（只读） | ✅   |
| `size`            | `number`   | 值大小（字节，只读） | ✅   |

#### 业务规则

**TTL 规则**:

- 最小值: 1 秒
- 最大值: 2,592,000 秒（30 天）
- 0 表示永不过期（慎用）
- 负数无效，抛出异常
- 原因: 避免缓存无限增长，确保数据时效性

**值大小规则**:

- 推荐最大: 1MB（1,048,576 字节）
- 警告阈值: 512KB（524,288 字节）
- 超过警告阈值会记录日志
- 超过最大值会抛出异常
- 原因: Redis 内存优化，避免大值影响性能

**序列化规则**:

- 格式: JSON
- 特殊类型处理:
  - `Date` → `{ __type: 'Date', value: ISOString }`
  - `Set` → `{ __type: 'Set', value: Array }`
  - `Map` → `{ __type: 'Map', value: Array<[key, value]> }`
  - `Buffer` → `{ __type: 'Buffer', value: base64 }`
- 循环引用处理: 替换为 `"[Circular]"`
- 原因: 支持复杂对象，确保序列化可逆

#### 静态工厂方法

```typescript
// 创建缓存条目
CacheEntry.create<T>(
  key: CacheKey,
  value: T,
  ttl: number = 3600,
  logger?: ILoggerService,
): CacheEntry<T>
```

#### 实例方法

```typescript
// 获取序列化后的值
getSerializedValue(): string

// 获取原始值
getValue(): T

// 获取 TTL
getTTL(): number

// 获取缓存键
getKey(): CacheKey

// 获取值大小（字节）
getSize(): number

// 获取创建时间
getCreatedAt(): Date

// 检查是否即将过期（剩余时间 < 10%）
isExpiringSoon(currentTime?: Date): boolean

// 检查是否已过期
isExpired(currentTime?: Date): boolean
```

#### 使用示例

```typescript
// 示例 1: 创建缓存条目
const key = CacheKey.forTenant('user', 'profile', 'hl8:cache:', {
  tenantId: 't123',
});
const value = { id: 'u999', name: '张三', email: 'zhangsan@example.com' };
const entry = CacheEntry.create(key, value, 3600, logger);

console.log(entry.getSize()); // 输出: 值的字节大小
console.log(entry.getTTL()); // 输出: 3600

// 示例 2: 序列化和反序列化
const serialized = entry.getSerializedValue();
// serialized: '{"id":"u999","name":"张三","email":"zhangsan@example.com"}'

// 示例 3: 检查过期状态
if (entry.isExpiringSoon()) {
  console.log('缓存即将过期，考虑刷新');
}

if (entry.isExpired()) {
  console.log('缓存已过期，需要删除');
}

// 示例 4: 处理特殊类型
const complexValue = {
  date: new Date('2025-10-12'),
  tags: new Set(['tag1', 'tag2']),
  metadata: new Map([
    ['key1', 'value1'],
    ['key2', 'value2'],
  ]),
};
const complexEntry = CacheEntry.create(key, complexValue, 1800);
// 序列化后自动处理 Date、Set、Map 类型
```

---

## 枚举类型

### CacheLevel (缓存层级)

**描述**: 定义缓存的 5 个隔离层级

```typescript
/**
 * 缓存层级枚举
 *
 * @description 定义缓存的 5 个隔离层级
 *
 * ## 层级说明
 *
 * - PLATFORM: 平台级缓存，跨租户共享
 * - TENANT: 租户级缓存，租户内共享
 * - ORGANIZATION: 组织级缓存，组织内共享
 * - DEPARTMENT: 部门级缓存，部门内共享
 * - USER: 用户级缓存，用户私有
 *
 * @since 1.0.0
 */
export enum CacheLevel {
  /** 平台级缓存 */
  PLATFORM = 'platform',

  /** 租户级缓存 */
  TENANT = 'tenant',

  /** 组织级缓存 */
  ORGANIZATION = 'organization',

  /** 部门级缓存 */
  DEPARTMENT = 'department',

  /** 用户级缓存 */
  USER = 'user',
}
```

#### 使用示例

```typescript
// 判断缓存层级
if (key.getLevel() === CacheLevel.TENANT) {
  console.log('这是租户级缓存');
}

// 根据层级生成键
switch (level) {
  case CacheLevel.PLATFORM:
    return CacheKey.forPlatform(namespace, key, prefix);
  case CacheLevel.TENANT:
    return CacheKey.forTenant(namespace, key, prefix, context);
  // ... 其他层级
}
```

---

## 接口定义

### ICacheService (缓存服务接口)

**描述**: 定义缓存服务的核心操作

```typescript
/**
 * 缓存服务接口
 *
 * @description 定义缓存的基本 CRUD 操作
 *
 * @since 1.0.0
 */
export interface ICacheService {
  /**
   * 获取缓存值
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 缓存值，不存在返回 null
   */
  get<T>(namespace: string, key: string): Promise<T | null>;

  /**
   * 设置缓存值
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（秒），可选
   */
  set<T>(namespace: string, key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 删除缓存
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   */
  del(namespace: string, key: string): Promise<void>;

  /**
   * 检查缓存是否存在
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 存在返回 true，否则返回 false
   */
  exists(namespace: string, key: string): Promise<boolean>;

  /**
   * 清空缓存
   *
   * @param pattern - 匹配模式（可选），默认清空所有
   */
  clear(pattern?: string): Promise<void>;
}
```

---

### IRedisService (Redis 服务接口)

**描述**: 定义 Redis 连接管理接口

```typescript
/**
 * Redis 服务接口
 *
 * @description 管理 Redis 连接和基础操作
 *
 * @since 1.0.0
 */
export interface IRedisService {
  /**
   * 连接 Redis
   */
  connect(): Promise<void>;

  /**
   * 断开 Redis 连接
   */
  disconnect(): Promise<void>;

  /**
   * 获取 Redis 客户端
   *
   * @returns Redis 客户端实例
   * @throws {GeneralInternalServerException} Redis 未连接
   */
  getClient(): Redis;

  /**
   * 健康检查
   *
   * @returns 连接状态
   */
  healthCheck(): Promise<boolean>;
}
```

---

## 配置类型

### CachingModuleOptions (模块配置)

**描述**: 缓存模块的配置选项

```typescript
/**
 * 缓存模块配置选项
 *
 * @since 1.0.0
 */
export interface CachingModuleOptions {
  /** Redis 连接配置 */
  redis: RedisOptions;

  /** 默认 TTL（秒），默认 3600 */
  defaultTTL?: number;

  /** 缓存键前缀，默认 'hl8:cache:' */
  keyPrefix?: string;

  /** 是否启用指标监控，默认 true */
  enableMetrics?: boolean;
}
```

---

### RedisOptions (Redis 连接配置)

**描述**: Redis 连接的配置选项

```typescript
/**
 * Redis 连接配置
 *
 * @since 1.0.0
 */
export interface RedisOptions {
  /** Redis 主机地址 */
  host: string;

  /** Redis 端口，默认 6379 */
  port: number;

  /** Redis 密码（可选） */
  password?: string;

  /** Redis 数据库索引，默认 0 */
  db?: number;

  /** 连接超时（毫秒），默认 10000 */
  connectTimeout?: number;

  /** 重试策略（可选） */
  retryStrategy?: (times: number) => number | void;
}
```

---

## 领域事件

### CacheInvalidatedEvent (缓存失效事件)

**描述**: 当缓存被删除或过期时触发

```typescript
/**
 * 缓存失效事件
 *
 * @description 记录单个缓存键的失效
 *
 * @since 1.0.0
 */
export class CacheInvalidatedEvent {
  constructor(
    /** 缓存键 */
    public readonly key: string,

    /** 缓存层级 */
    public readonly level: CacheLevel,

    /** 失效原因 */
    public readonly reason: 'expired' | 'deleted' | 'evicted',

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

#### 使用场景

- 监控缓存失效率
- 调试缓存问题
- 触发缓存预热

---

### CacheLevelInvalidatedEvent (缓存层级失效事件)

**描述**: 当整个层级的缓存被批量清除时触发

```typescript
/**
 * 缓存层级失效事件
 *
 * @description 记录整个层级的缓存失效
 *
 * @since 1.0.0
 */
export class CacheLevelInvalidatedEvent {
  constructor(
    /** 失效的层级类型 */
    public readonly level: CacheLevel,

    /** 层级标识符（如 tenantId、orgId） */
    public readonly identifier: string,

    /** 删除的键数量 */
    public readonly deletedCount: number,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

#### 使用场景

- 监控批量缓存清除
- 性能分析
- 审计追踪

---

## 性能指标

### CacheMetrics (缓存指标)

**描述**: 缓存性能指标数据

```typescript
/**
 * 缓存指标
 *
 * @since 1.0.0
 */
export interface CacheMetrics {
  /** 缓存命中次数 */
  hits: number;

  /** 缓存未命中次数 */
  misses: number;

  /** 错误次数 */
  errors: number;

  /** 缓存命中率（0-1） */
  hitRate: number;

  /** 平均延迟（毫秒） */
  averageLatency: number;

  /** 总操作次数 */
  totalOperations: number;
}
```

#### 使用示例

```typescript
// 获取缓存指标
const metrics = await cacheMetricsService.getMetrics();

console.log(`命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
console.log(`总操作: ${metrics.totalOperations}`);
```

---

## 数据模型关系图

```text
┌─────────────────┐
│  IsolationContext│ (来自 @hl8/platform)
└────────┬────────┘
         │
         │ 1:N
         ↓
┌─────────────────┐         ┌──────────────┐
│    CacheKey     │────────>│  CacheLevel  │ (枚举)
│  (值对象)        │         └──────────────┘
└────────┬────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐
│   CacheEntry    │
│  (值对象)        │
└────────┬────────┘
         │
         │ 发布
         ↓
┌─────────────────────────┐
│  CacheInvalidatedEvent  │ (领域事件)
│  CacheLevelInvalidated  │
└─────────────────────────┘
```

---

## 数据验证规则汇总

| 数据类型   | 验证规则                   | 错误类型                   |
| ---------- | -------------------------- | -------------------------- |
| CacheKey   | 长度 ≤ 256 字符            | GeneralBadRequestException |
| CacheKey   | 仅允许字母、数字、:、\_、- | GeneralBadRequestException |
| CacheKey   | 层级标识符必需             | GeneralBadRequestException |
| CacheEntry | TTL ≥ 0                    | GeneralBadRequestException |
| CacheEntry | TTL ≤ 2,592,000 秒         | GeneralBadRequestException |
| CacheEntry | 值大小 ≤ 1MB               | GeneralBadRequestException |
| Redis配置  | host 必需                  | ConfigValidationException  |
| Redis配置  | port 在 1-65535 范围内     | ConfigValidationException  |

---

## 类型导出结构

```typescript
// src/types/index.ts

// 值对象
export { CacheKey } from '../domain/value-objects/cache-key.vo.js';
export { CacheEntry } from '../domain/value-objects/cache-entry.vo.js';

// 枚举
export { CacheLevel } from './cache-level.enum.js';

// 接口
export type { ICacheService } from './cache-service.interface.js';
export type { IRedisService } from './redis-service.interface.js';

// 配置
export type {
  CachingModuleOptions,
  CachingModuleAsyncOptions,
} from './cache-options.interface.js';
export type { RedisOptions } from './redis-options.interface.js';

// 领域事件
export { CacheInvalidatedEvent } from '../domain/events/cache-invalidated.event.js';
export { CacheLevelInvalidatedEvent } from '../domain/events/cache-level-invalidated.event.js';

// 指标
export type { CacheMetrics } from './cache-metrics.interface.js';
```

---

## 数据模型设计原则

### 1. 不可变性（Immutability）

所有值对象（CacheKey、CacheEntry）创建后不可修改：

- 所有属性为 `readonly`
- 无 setter 方法
- 修改需要创建新实例

### 2. 业务规则封装

所有验证和业务逻辑封装在值对象内部：

- 构造函数私有，通过静态工厂方法创建
- 验证失败立即抛出异常
- 不允许创建无效对象

### 3. 类型安全

使用 TypeScript 类型系统确保安全：

- 泛型支持任意缓存值类型
- 接口定义清晰的契约
- 枚举限制有效选项

### 4. 可测试性

设计便于单元测试：

- 值对象无外部依赖
- 静态工厂方法易于 mock
- 领域事件可独立验证

### 5. 扩展性

预留扩展点：

- 接口定义核心操作
- 实现类可替换
- 配置可热更新

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 数据模型设计完成
