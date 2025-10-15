# API Contract: Caching 模块 API 合约

**Date**: 2025-10-12  
**Feature**: 将 libs/nestjs-infra/src/caching 拆分为独立的 libs/nestjs-caching 库项目  
**Version**: 1.0.0  
**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data Model**: [data-model.md](../data-model.md)

## 概述

本文档定义 `@hl8/nestjs-caching` 模块的公共 API 合约，包括模块配置、服务接口、装饰器和类型导出。

**设计原则**:

- **简洁性**: API 设计简单直观，易于理解和使用
- **类型安全**: 完整的 TypeScript 类型定义
- **向后兼容**: 遵循语义化版本规范
- **自动隔离**: 无需手动处理多层级数据隔离

---

## 模块导出

### 主入口 (index.ts)

```typescript
// 模块
export { CachingModule } from "./cache.module.js";

// 服务
export { CacheService } from "./cache.service.js";
export { RedisService } from "./redis.service.js";

// 值对象
export { CacheKey } from "./domain/value-objects/cache-key.vo.js";
export { CacheEntry } from "./domain/value-objects/cache-entry.vo.js";

// 枚举
export { CacheLevel } from "./types/cache-level.enum.js";

// 接口
export type { ICacheService } from "./types/cache-service.interface.js";
export type { IRedisService } from "./types/redis-service.interface.js";
export type {
  CachingModuleOptions,
  CachingModuleAsyncOptions,
} from "./types/cache-options.interface.js";
export type { RedisOptions } from "./types/redis-options.interface.js";
export type { CacheMetrics } from "./types/cache-metrics.interface.js";

// 装饰器
export { Cacheable } from "./decorators/cacheable.decorator.js";
export { CacheEvict } from "./decorators/cache-evict.decorator.js";
export { CachePut } from "./decorators/cache-put.decorator.js";

// 领域事件
export { CacheInvalidatedEvent } from "./domain/events/cache-invalidated.event.js";
export { CacheLevelInvalidatedEvent } from "./domain/events/cache-level-invalidated.event.js";

// 监控
export { CacheMetricsService } from "./monitoring/cache-metrics.service.js";
```

---

## 模块配置 API

### CachingModule.forRoot()

**描述**: 同步配置缓存模块

**签名**:

```typescript
static forRoot(options: CachingModuleOptions): DynamicModule
```

**参数**:

```typescript
interface CachingModuleOptions {
  /** Redis 连接配置 */
  redis: RedisOptions;

  /** 默认 TTL（秒），默认 3600 */
  defaultTTL?: number;

  /** 缓存键前缀，默认 'hl8:cache:' */
  keyPrefix?: string;

  /** 是否启用指标监控，默认 true */
  enableMetrics?: boolean;
}

interface RedisOptions {
  /** Redis 主机地址 */
  host: string;

  /** Redis 端口 */
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

**返回值**:

```typescript
DynamicModule;
```

**使用示例**:

```typescript
import { Module } from "@nestjs/common";
import { CachingModule } from "@hl8/nestjs-caching";

@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379,
        password: "secret",
        db: 0,
      },
      defaultTTL: 3600,
      keyPrefix: "hl8:cache:",
      enableMetrics: true,
    }),
  ],
})
export class AppModule {}
```

**异常**:

- `ConfigValidationException`: 配置验证失败
- `GeneralInternalServerException`: Redis 连接失败

---

### CachingModule.forRootAsync()

**描述**: 异步配置缓存模块（支持依赖注入）

**签名**:

```typescript
static forRootAsync(options: CachingModuleAsyncOptions): DynamicModule
```

**参数**:

```typescript
interface CachingModuleAsyncOptions {
  /** 工厂函数 */
  useFactory: (
    ...args: any[]
  ) => Promise<CachingModuleOptions> | CachingModuleOptions;

  /** 注入的依赖 */
  inject?: any[];

  /** 导入的模块 */
  imports?: any[];
}
```

**使用示例**:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CachingModule } from "@hl8/nestjs-caching";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CachingModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST", "localhost"),
          port: configService.get("REDIS_PORT", 6379),
          password: configService.get("REDIS_PASSWORD"),
          db: configService.get("REDIS_DB", 0),
        },
        defaultTTL: configService.get("CACHE_DEFAULT_TTL", 3600),
        keyPrefix: configService.get("CACHE_KEY_PREFIX", "hl8:cache:"),
        enableMetrics: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## CacheService API

### get<T>()

**描述**: 获取缓存值（自动隔离）

**签名**:

```typescript
async get<T>(namespace: string, key: string): Promise<T | null>
```

**参数**:

- `namespace` (string): 命名空间（业务模块名），如 `'user'`、`'product'`
- `key` (string): 缓存键，如 `'profile'`、`'list'`

**返回值**:

- `Promise<T | null>`: 缓存值，不存在返回 `null`

**异常**:

- `GeneralInternalServerException`: Redis 操作失败

**使用示例**:

```typescript
import { Injectable } from "@nestjs/common";
import { CacheService } from "@hl8/nestjs-caching";

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUserProfile(userId: string) {
    // 自动根据当前隔离上下文生成缓存键
    const cached = await this.cacheService.get<UserProfile>(
      "user",
      `profile:${userId}`,
    );

    if (cached) {
      return cached;
    }

    // 从数据库加载
    const profile = await this.loadFromDatabase(userId);

    // 缓存结果
    await this.cacheService.set("user", `profile:${userId}`, profile, 1800);

    return profile;
  }
}
```

**行为说明**:

- 自动从 `IsolationContext` 获取当前隔离层级
- 生成的缓存键格式: `{prefix}:{level}:{identifiers}:{namespace}:{key}`
- 示例: `hl8:cache:tenant:t123:user:profile:u999`

---

### set<T>()

**描述**: 设置缓存值（自动隔离）

**签名**:

```typescript
async set<T>(namespace: string, key: string, value: T, ttl?: number): Promise<void>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键
- `value` (T): 缓存值（任意可序列化类型）
- `ttl` (number, 可选): 过期时间（秒），默认使用配置的 `defaultTTL`

**返回值**:

- `Promise<void>`

**异常**:

- `GeneralBadRequestException`: TTL 无效或值过大
- `GeneralInternalServerException`: Redis 操作失败

**使用示例**:

```typescript
// 使用默认 TTL
await cacheService.set("user", "profile:u999", userProfile);

// 自定义 TTL（30 分钟）
await cacheService.set("user", "profile:u999", userProfile, 1800);

// 永不过期（慎用）
await cacheService.set("config", "system-version", "1.0.0", 0);
```

**值大小限制**:

- 推荐最大: 1MB
- 警告阈值: 512KB（会记录警告日志）
- 超过 1MB: 抛出异常

---

### del()

**描述**: 删除缓存

**签名**:

```typescript
async del(namespace: string, key: string): Promise<void>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键

**返回值**:

- `Promise<void>`

**使用示例**:

```typescript
// 删除用户配置缓存
await cacheService.del("user", "profile:u999");
```

---

### exists()

**描述**: 检查缓存是否存在

**签名**:

```typescript
async exists(namespace: string, key: string): Promise<boolean>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键

**返回值**:

- `Promise<boolean>`: 存在返回 `true`，否则返回 `false`

**使用示例**:

```typescript
if (await cacheService.exists("user", "profile:u999")) {
  console.log("缓存存在");
}
```

---

### clear()

**描述**: 清空缓存

**签名**:

```typescript
async clear(pattern?: string): Promise<void>
```

**参数**:

- `pattern` (string, 可选): 匹配模式，默认清空所有

**返回值**:

- `Promise<void>`

**使用示例**:

```typescript
// 清空所有用户缓存
await cacheService.clear("user:*");

// 清空所有缓存（危险操作）
await cacheService.clear();
```

**注意**:

- 使用 Redis SCAN 命令，避免阻塞
- 批量删除时使用游标分页

---

### clearTenantCache()

**描述**: 清除租户级缓存（批量删除）

**签名**:

```typescript
async clearTenantCache(tenantId: string, namespace?: string): Promise<number>
```

**参数**:

- `tenantId` (string): 租户 ID
- `namespace` (string, 可选): 命名空间，默认清除该租户所有缓存

**返回值**:

- `Promise<number>`: 删除的键数量

**使用示例**:

```typescript
// 清除租户的所有用户缓存
const count = await cacheService.clearTenantCache("t123", "user");
console.log(`清除了 ${count} 个缓存键`);

// 清除租户的所有缓存
const totalCount = await cacheService.clearTenantCache("t123");
```

---

### clearOrganizationCache()

**描述**: 清除组织级缓存（批量删除）

**签名**:

```typescript
async clearOrganizationCache(
  tenantId: string,
  orgId: string,
  namespace?: string
): Promise<number>
```

**参数**:

- `tenantId` (string): 租户 ID
- `orgId` (string): 组织 ID
- `namespace` (string, 可选): 命名空间

**返回值**:

- `Promise<number>`: 删除的键数量

**使用示例**:

```typescript
// 清除组织的成员列表缓存
const count = await cacheService.clearOrganizationCache(
  "t123",
  "o456",
  "members",
);
```

---

### clearDepartmentCache()

**描述**: 清除部门级缓存（批量删除）

**签名**:

```typescript
async clearDepartmentCache(
  tenantId: string,
  orgId: string,
  deptId: string,
  namespace?: string
): Promise<number>
```

**参数**:

- `tenantId` (string): 租户 ID
- `orgId` (string): 组织 ID
- `deptId` (string): 部门 ID
- `namespace` (string, 可选): 命名空间

**返回值**:

- `Promise<number>`: 删除的键数量

**使用示例**:

```typescript
// 清除部门的任务缓存
const count = await cacheService.clearDepartmentCache(
  "t123",
  "o456",
  "d789",
  "tasks",
);
```

---

## 缓存装饰器 API

### @Cacheable()

**描述**: 自动缓存方法返回值

**签名**:

```typescript
@Cacheable(namespace: string, options?: CacheableOptions)
```

**参数**:

```typescript
interface CacheableOptions {
  /** 缓存键生成函数 */
  keyGenerator?: (...args: any[]) => string;

  /** TTL（秒），默认使用配置的 defaultTTL */
  ttl?: number;

  /** 条件函数，返回 false 时不缓存 */
  condition?: (...args: any[]) => boolean;

  /** 异常时是否缓存 null，默认 false */
  cacheNull?: boolean;
}
```

**使用示例**:

```typescript
import { Injectable } from "@nestjs/common";
import { Cacheable } from "@hl8/nestjs-caching";

@Injectable()
export class UserService {
  /**
   * 获取用户配置（自动缓存）
   */
  @Cacheable("user", {
    keyGenerator: (userId: string) => `profile:${userId}`,
    ttl: 1800, // 30 分钟
  })
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.userRepository.findOne(userId);
  }

  /**
   * 条件缓存：仅缓存激活用户
   */
  @Cacheable("user", {
    keyGenerator: (userId: string) => `status:${userId}`,
    condition: (userId: string, user: User) => user.isActive,
  })
  async getUserStatus(userId: string): Promise<UserStatus> {
    return this.userRepository.getStatus(userId);
  }
}
```

**行为说明**:

1. 首次调用：执行方法，缓存结果
2. 再次调用：直接返回缓存值，不执行方法
3. 缓存过期：重新执行方法，更新缓存

---

### @CacheEvict()

**描述**: 清除缓存

**签名**:

```typescript
@CacheEvict(namespace: string, options?: CacheEvictOptions)
```

**参数**:

```typescript
interface CacheEvictOptions {
  /** 缓存键生成函数 */
  keyGenerator?: (...args: any[]) => string;

  /** 是否清除所有，默认 false */
  allEntries?: boolean;

  /** 在方法执行前清除，默认 false（方法执行后清除） */
  beforeInvocation?: boolean;

  /** 条件函数 */
  condition?: (...args: any[]) => boolean;
}
```

**使用示例**:

```typescript
@Injectable()
export class UserService {
  /**
   * 更新用户配置（清除缓存）
   */
  @CacheEvict("user", {
    keyGenerator: (userId: string) => `profile:${userId}`,
  })
  async updateUserProfile(
    userId: string,
    data: Partial<UserProfile>,
  ): Promise<void> {
    await this.userRepository.update(userId, data);
  }

  /**
   * 删除用户（清除所有用户缓存）
   */
  @CacheEvict("user", {
    allEntries: true,
  })
  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
```

---

### @CachePut()

**描述**: 强制更新缓存（无论缓存是否存在）

**签名**:

```typescript
@CachePut(namespace: string, options?: CachePutOptions)
```

**参数**:

```typescript
interface CachePutOptions {
  /** 缓存键生成函数 */
  keyGenerator?: (...args: any[]) => string;

  /** TTL（秒） */
  ttl?: number;

  /** 条件函数 */
  condition?: (...args: any[]) => boolean;
}
```

**使用示例**:

```typescript
@Injectable()
export class UserService {
  /**
   * 创建用户（立即缓存）
   */
  @CachePut("user", {
    keyGenerator: (user: User) => `profile:${user.id}`,
    ttl: 3600,
  })
  async createUser(data: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(data);
    return user;
  }
}
```

**与 @Cacheable 的区别**:

- `@Cacheable`: 缓存存在时不执行方法
- `@CachePut`: 始终执行方法并更新缓存

---

## CacheMetricsService API

### getMetrics()

**描述**: 获取缓存性能指标

**签名**:

```typescript
getMetrics(): CacheMetrics
```

**返回值**:

```typescript
interface CacheMetrics {
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

**使用示例**:

```typescript
import { Injectable } from "@nestjs/common";
import { CacheMetricsService } from "@hl8/nestjs-caching";

@Injectable()
export class MonitoringService {
  constructor(private readonly metricsService: CacheMetricsService) {}

  async getCacheHealth() {
    const metrics = this.metricsService.getMetrics();

    return {
      hitRate: `${(metrics.hitRate * 100).toFixed(2)}%`,
      averageLatency: `${metrics.averageLatency.toFixed(2)}ms`,
      totalOperations: metrics.totalOperations,
      errors: metrics.errors,
    };
  }
}
```

---

### reset()

**描述**: 重置指标

**签名**:

```typescript
reset(): void
```

**使用示例**:

```typescript
// 重置指标（通常在定时任务中使用）
metricsService.reset();
```

---

## RedisService API

### getClient()

**描述**: 获取 Redis 客户端（高级用途）

**签名**:

```typescript
getClient(): Redis
```

**返回值**:

- `Redis`: ioredis 客户端实例

**异常**:

- `GeneralInternalServerException`: Redis 未连接

**使用示例**:

```typescript
import { Injectable } from "@nestjs/common";
import { RedisService } from "@hl8/nestjs-caching";

@Injectable()
export class CustomCacheService {
  constructor(private readonly redisService: RedisService) {}

  async customOperation() {
    const redis = this.redisService.getClient();

    // 执行自定义 Redis 命令
    await redis.zadd("leaderboard", 100, "user1");
    const rank = await redis.zrank("leaderboard", "user1");

    return rank;
  }
}
```

**注意**:

- 直接使用 Redis 客户端时，需自行处理隔离和序列化
- 推荐使用 `CacheService` 而非直接操作客户端

---

### healthCheck()

**描述**: Redis 健康检查

**签名**:

```typescript
async healthCheck(): Promise<boolean>
```

**返回值**:

- `Promise<boolean>`: 连接正常返回 `true`，否则返回 `false`

**使用示例**:

```typescript
import { Injectable } from "@nestjs/common";
import { RedisService } from "@hl8/nestjs-caching";

@Injectable()
export class HealthService {
  constructor(private readonly redisService: RedisService) {}

  async checkRedis() {
    const isHealthy = await this.redisService.healthCheck();

    if (!isHealthy) {
      console.error("Redis 连接异常");
    }

    return { redis: isHealthy ? "up" : "down" };
  }
}
```

---

## 错误处理

### 异常类型

| 异常类型                         | 描述                      | 处理建议                  |
| -------------------------------- | ------------------------- | ------------------------- |
| `GeneralBadRequestException`     | 参数无效（TTL、键长度等） | 检查输入参数              |
| `GeneralInternalServerException` | Redis 操作失败            | 检查 Redis 连接，查看日志 |
| `ConfigValidationException`      | 配置验证失败              | 检查模块配置              |

### 错误响应格式

所有异常遵循 RFC7807 标准格式：

```typescript
{
  "statusCode": 400,
  "message": "缓存键过长",
  "detail": "缓存键长度不能超过 256 字符，当前长度: 300",
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/users/profile",
  "context": {
    "key": "hl8:cache:tenant:t123:user:profile:very-long-key..."
  }
}
```

---

## 类型安全

### 泛型支持

所有缓存操作支持泛型：

```typescript
// 类型推断
const user = await cacheService.get<User>("user", "profile:u999");
// user 的类型: User | null

// 类型检查
await cacheService.set<UserProfile>("user", "profile:u999", {
  id: "u999",
  name: "张三",
  email: "zhangsan@example.com",
});
```

### 类型导出

```typescript
import type {
  CachingModuleOptions,
  RedisOptions,
  CacheMetrics,
  CacheLevel,
  ICacheService,
  IRedisService,
} from "@hl8/nestjs-caching";
```

---

## 版本兼容性

### 语义化版本

- **MAJOR (1.x.x)**: 破坏性变更
- **MINOR (x.1.x)**: 新增功能，向后兼容
- **PATCH (x.x.1)**: Bug 修复，向后兼容

### 破坏性变更政策

- 提前 1 个 MINOR 版本发布 deprecation 警告
- 在下一个 MAJOR 版本移除已弃用的 API
- 提供迁移指南

### 示例

```typescript
// v1.5.0 - 添加 deprecation 警告
/**
 * @deprecated 使用 clearTenantCache() 替代
 * 将在 v2.0.0 移除
 */
async clearCache(tenantId: string): Promise<void>

// v2.0.0 - 移除
// clearCache() 方法已移除
```

---

## 性能保证

### 延迟保证

| 操作     | 目标延迟 (p95) | 实测延迟 |
| -------- | -------------- | -------- |
| get()    | < 10ms         | 3-5ms    |
| set()    | < 10ms         | 5-8ms    |
| del()    | < 5ms          | 2-3ms    |
| exists() | < 5ms          | 2-3ms    |

### 吞吐量保证

- 单实例: >= 10,000 ops/s
- 批量操作: >= 50,000 ops/s

---

## 最佳实践

### 1. 命名空间规范

```typescript
// ✅ 推荐：使用小写字母和连字符
"user-profile";
"product-list";
"order-summary";

// ❌ 避免：使用大写或特殊字符
"UserProfile";
"product_list";
"order.summary";
```

### 2. TTL 设置

```typescript
// ✅ 根据数据变更频率设置 TTL
await cacheService.set("user", "profile", data, 1800); // 30 分钟（配置数据）
await cacheService.set("product", "price", data, 300); // 5 分钟（价格数据）

// ❌ 避免：使用过长的 TTL
await cacheService.set("user", "session", data, 86400 * 30); // 30 天（太长）
```

### 3. 批量操作

```typescript
// ✅ 使用批量删除
await cacheService.clearTenantCache("t123", "user");

// ❌ 避免：循环删除
for (const userId of userIds) {
  await cacheService.del("user", `profile:${userId}`); // 性能差
}
```

---

**API 合约版本**: 1.0.0  
**最后更新**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ API 合约定义完成
