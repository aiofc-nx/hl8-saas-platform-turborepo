# Architecture Notes: Database 模块架构说明

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 阐述 database 模块的架构定位、职责边界和最佳实践

---

## 模块定位

### @hl8/database 是什么？

**一个专注于数据库连接管理的基础设施模块**

- ✅ 管理数据库连接的生命周期
- ✅ 提供事务管理能力
- ✅ 集成多租户数据隔离
- ✅ 提供连接池优化
- ✅ 提供健康检查和基础监控

### @hl8/database 不是什么？

- ❌ 不是 ORM（ORM 是 MikroORM，database 模块只是封装和集成）
- ❌ 不是缓存系统（缓存由 @hl8/caching 负责）
- ❌ 不是迁移工具（迁移由独立项目负责）
- ❌ 不是业务仓储（Repository 由应用层实现）
- ❌ 不是监控系统（只提供基础数据，完整监控由 APM 工具负责）

---

## 职责边界

### ✅ Database 模块的职责

#### 1. 连接生命周期管理

```typescript
// database 模块负责
✅ 建立连接
✅ 连接池管理
✅ 健康检查
✅ 连接复用
✅ 优雅关闭
```

#### 2. 事务管理

```typescript
// database 模块负责
✅ 开启事务
✅ 提交事务
✅ 回滚事务
✅ 嵌套事务支持
✅ 事务上下文传递（通过 nestjs-cls）
```

#### 3. 隔离上下文集成

```typescript
// database 模块负责
✅ 集成 @hl8/nestjs-isolation
✅ 在查询中应用隔离过滤
✅ 验证隔离上下文完整性
✅ 提供隔离装饰器
```

#### 4. 基础监控数据

```typescript
// database 模块负责
✅ 连接池实时统计（total、active、idle、waiting）
✅ 慢查询内存队列（最近 100 条，FIFO）
✅ 健康检查接口（connection status、response time）
```

---

### ❌ Database 模块不负责的功能

#### 1. 持久化缓存 → @hl8/caching

```typescript
// ❌ database 模块不应该做
class DatabaseService {
  async getUser(id: string): Promise<User> {
    // 不应该在这里实现 Redis 缓存逻辑
    const cached = await this.redis.get(`user:${id}`);
    if (cached) return cached;

    const user = await this.em.findOne(User, { id });
    await this.redis.set(`user:${id}`, user);
    return user;
  }
}

// ✅ 应该在应用层做
class UserService {
  constructor(
    private readonly database: DatabaseService,
    private readonly cache: CacheService, // 来自 @hl8/caching
  ) {}

  async getUser(id: string): Promise<User> {
    // 应用层决定缓存策略
    return this.cache.wrap(`user:${id}`, async () => {
      return this.database.executeQuery(/* ... */);
    });
  }
}
```

**理由**：

- 缓存策略是应用层关注点，不是基础设施层
- @hl8/caching 已经提供了完整的缓存能力
- 避免功能重复和依赖混乱

#### 2. 数据库迁移 → 独立迁移项目

```typescript
// ❌ database 模块不提供
- migration:create
- migration:up
- migration:down
- MigrationService

// ✅ 由独立的迁移项目提供
// 例如：apps/database-migration 或独立的 CLI 工具
```

**理由**：

- 迁移是运维操作，不是运行时功能
- 独立项目便于版本控制和部署
- 避免 database 模块过于臃肿

#### 3. 业务仓储 → 应用层

```typescript
// ❌ database 模块不应该提供
class UserRepository {
  async findByEmail(email: string): Promise<User> {
    // 业务逻辑
  }
}

// ✅ 应该在应用层实现
// apps/your-app/src/repositories/user.repository.ts
```

**理由**：

- 仓储包含业务逻辑，属于应用层
- database 模块应保持通用性
- 不应该知道具体的业务实体

#### 4. ORM 实体定义 → 应用层

```typescript
// ❌ database 模块不定义业务实体
@Entity()
class User {
  @PrimaryKey()
  id: string;

  @Property()
  name: string;
}

// ✅ 应用层定义自己的实体
// apps/your-app/src/entities/user.entity.ts
```

**理由**：

- 实体是业务模型，属于应用层
- database 模块只负责连接管理，不涉及业务

---

## 与其他模块的协作

### 与 @hl8/caching 的协作

```typescript
// 应用层同时使用 database 和 caching

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager, // 来自 @hl8/database

    private readonly cache: CacheService, // 来自 @hl8/caching
  ) {}

  async getUser(id: string): Promise<User> {
    // 1. 先查缓存（@hl8/caching）
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    // 2. 查数据库（@hl8/database）
    const user = await this.em.findOne(User, { id });

    // 3. 写入缓存（@hl8/caching）
    if (user) {
      await this.cache.set(cacheKey, user, { ttl: 300 });
    }

    return user;
  }
}
```

**职责分工**：

- **@hl8/database**: 提供 EntityManager，执行查询
- **@hl8/caching**: 提供 Redis 缓存，管理缓存键和 TTL
- **应用层**: 决定缓存策略和业务逻辑

---

### 与 @hl8/nestjs-isolation 的协作

```typescript
// database 模块集成 isolation

@Injectable()
export class DatabaseIsolationService {
  constructor(
    private readonly isolationService: IsolationService, // 来自 @hl8/nestjs-isolation
    private readonly cls: ClsService,
  ) {}

  applyIsolationFilter<T>(qb: QueryBuilder<T>): QueryBuilder<T> {
    // 从 isolation 模块获取上下文
    const context = this.isolationService.getContext();

    // 应用隔离过滤
    if (context.getTenantId()) {
      qb.andWhere({ tenantId: context.getTenantId() });
    }

    return qb;
  }
}
```

**职责分工**：

- **@hl8/nestjs-isolation**: 提供 IsolationContext，管理隔离上下文
- **@hl8/database**: 在数据查询中应用隔离过滤

---

### 与 @hl8/config 的协作

```typescript
// database 模块使用 config

import { DatabaseConfig } from '@hl8/database';
import { TypedConfigModule } from '@hl8/config';

@Module({
  imports: [
    // 1. 加载配置（@hl8/config）
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
      load: [dotenvLoader()],
    }),

    // 2. 注入配置到 database 模块
    DatabaseModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => ({
        connection: config.getConnectionConfig(),
      }),
      inject: [DatabaseConfig],
    }),
  ],
})
export class AppModule {}
```

**职责分工**：

- **@hl8/config**: 加载、验证、提供配置
- **@hl8/database**: 使用配置建立连接

---

### 与 @hl8/nestjs-fastify 的协作（日志）

```typescript
// database 模块使用全局日志服务

import { Injectable } from '@nestjs/common';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';

@Injectable()
export class ConnectionManager {
  constructor(
    private readonly logger: FastifyLoggerService, // 注入全局日志服务
  ) {}

  async connect(): Promise<void> {
    // 日志自动包含隔离上下文（租户、组织、部门、用户）
    this.logger.log('正在连接数据库...', {
      host: this.config.host,
      port: this.config.port,
    });

    try {
      await this.orm.connect();
      this.logger.log('数据库连接成功');
    } catch (error) {
      this.logger.error('数据库连接失败', error.stack);
      throw new DatabaseConnectionException('无法连接到数据库服务器');
    }
  }
}
```

**职责分工**：

- **@hl8/nestjs-fastify**: 提供全局日志服务（FastifyLoggerService），自动包含隔离上下文和请求 ID
- **@hl8/database**: 记录数据库操作相关的日志

**日志自动增强**：

```json
{
  "level": "info",
  "time": 1697123456789,
  "msg": "正在连接数据库...",
  "context": "ConnectionManager",
  "tenantId": "tenant-123", // 自动添加
  "organizationId": "org-456", // 自动添加
  "userId": "user-001", // 自动添加
  "requestId": "req-abc-123", // 自动添加
  "host": "localhost",
  "port": 5432
}
```

**优势**：

- ✅ 零开销（复用 Fastify Pino）
- ✅ 10-20x 性能提升
- ✅ 自动包含上下文信息
- ✅ 无需手动传递租户 ID 等信息

---

### 与 @hl8/exceptions 的协作

```typescript
// database 模块使用统一的异常类型

import { AbstractHttpException } from '@hl8/exceptions';

export class DatabaseConnectionException extends AbstractHttpException {
  constructor(detail: string, data?: Record<string, any>) {
    super(
      'DATABASE_CONNECTION_ERROR', // errorCode
      '数据库连接错误', // title
      detail, // detail
      503, // status
      data, // data (可选)
    );
  }
}
```

**职责分工**：

- **@hl8/exceptions**: 提供异常基类（AbstractHttpException）和标准格式
- **@hl8/database**: 定义数据库特定的异常类型

---

## 架构原则遵循

### 单一职责原则 (SRP)

**@hl8/database** 只负责一件事：**数据库连接管理**

```
✅ 连接管理 - database 模块的职责
❌ 缓存管理 - caching 模块的职责
❌ 迁移管理 - 独立迁移项目的职责
❌ 业务逻辑 - 应用层的职责
```

### 依赖倒置原则 (DIP)

```
高层模块（应用层）
  ↓ 依赖
抽象接口（IDatabase、ICache）
  ↑ 实现
低层模块（@hl8/database、@hl8/caching）
```

### 开闭原则 (OCP)

```
database 模块对扩展开放：
  ✅ 可以通过配置扩展功能
  ✅ 可以通过装饰器扩展行为

database 模块对修改封闭：
  ✅ 核心连接管理逻辑稳定
  ✅ 不需要频繁修改
```

---

## 实际项目架构

### 当前项目的基础设施布局

```
libs/
├── config/              # 配置管理（独立）
├── exceptions/          # 异常处理（独立）
├── caching/             # Redis 缓存（独立）
├── nestjs-isolation/    # 数据隔离实现（独立）
├── isolation-model/     # 隔离领域模型（独立，零依赖）
├── nestjs-fastify/      # Fastify 专用层（独立）
└── database/            # 数据库连接管理（新增，独立）
```

### 模块依赖图

```
应用层 (apps/fastify-api)
  │
  ├─ @hl8/database         (数据库连接)
  ├─ @hl8/caching          (Redis 缓存)
  ├─ @hl8/nestjs-isolation (数据隔离)
  ├─ @hl8/config           (配置管理)
  ├─ @hl8/exceptions       (异常处理)
  └─ @hl8/nestjs-fastify   (Fastify 适配)
       │
       ├─ @hl8/config
       └─ @hl8/exceptions

@hl8/database
  │
  ├─ @hl8/nestjs-fastify       (日志服务)
  ├─ @hl8/config               (配置管理)
  ├─ @hl8/exceptions           (异常处理)
  ├─ @hl8/nestjs-isolation     (数据隔离)
  └─ @hl8/isolation-model      (隔离领域模型)

@hl8/caching
  │
  ├─ @hl8/config
  ├─ @hl8/exceptions
  ├─ @hl8/nestjs-isolation
  └─ @hl8/isolation-model

@hl8/nestjs-isolation
  │
  └─ @hl8/isolation-model

@hl8/isolation-model
  │
  └─ (零依赖)
```

**关键原则**：

- 每个模块都是独立的
- 模块间通过明确的接口协作
- 避免功能重复和职责混淆

---

## 最佳实践

### 1. 不要在 database 模块中实现缓存

**❌ 错误做法**：

```typescript
// libs/database/src/monitoring/metrics.service.ts
@Injectable()
export class MetricsService {
  constructor(
    private readonly redis: RedisService, // ❌ 不应该依赖 Redis
  ) {}

  async getQueryMetrics(): Promise<QueryMetrics> {
    // ❌ 不应该在 database 模块中使用 Redis
    const cached = await this.redis.get('db:metrics');
    if (cached) return cached;

    const metrics = this.calculateMetrics();
    await this.redis.set('db:metrics', metrics, 60);
    return metrics;
  }
}
```

**✅ 正确做法**：

```typescript
// libs/database/src/monitoring/metrics.service.ts
@Injectable()
export class MetricsService {
  private queryWindow: number[] = []; // 内存滑动窗口
  private readonly maxWindowSize = 1000;

  async getQueryMetrics(): Promise<QueryMetrics> {
    // ✅ 直接从内存计算，不使用 Redis
    return {
      total: this.queryWindow.length,
      avgDuration: this.calculateAverage(),
      maxDuration: Math.max(...this.queryWindow),
    };
  }

  recordQuery(duration: number): void {
    // ✅ 保存到内存队列
    this.queryWindow.push(duration);
    if (this.queryWindow.length > this.maxWindowSize) {
      this.queryWindow.shift(); // FIFO
    }
  }
}
```

### 2. 应用层决定缓存策略

**✅ 正确的架构**：

```typescript
// apps/your-app/src/services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager, // 来自 @hl8/database

    private readonly cache: CacheService, // 来自 @hl8/caching
  ) {}

  @Transactional() // 来自 @hl8/database
  async createUser(data: CreateUserDto): Promise<User> {
    // 1. 创建用户（使用 database）
    const user = new User(data);
    await this.em.persistAndFlush(user);

    // 2. 清除相关缓存（使用 caching）
    await this.cache.del(`users:list:${user.tenantId}`);

    return user;
  }

  async getUser(id: string): Promise<User> {
    // 缓存策略由应用层决定
    return this.cache.wrap(
      `user:${id}`,
      async () => {
        return this.em.findOne(User, { id });
      },
      { ttl: 300 },
    );
  }
}
```

### 3. 监控数据的正确处理

**内存监控数据** (database 模块提供)：

```typescript
// 实时监控，用于健康检查
const poolStats = await healthCheckService.getPoolStats();
// -> { total: 10, active: 3, idle: 7, waiting: 0 }
```

**持久化监控数据** (应用层处理)：

```typescript
// 如需长期保存监控数据
@Cron('*/5 * * * *')  // 每 5 分钟
async collectMetrics() {
  const stats = await this.healthCheckService.getPoolStats();

  // 存储到 Redis（使用 @hl8/caching）
  await this.cache.set(`metrics:db:pool:${Date.now()}`, stats, { ttl: 86400 });

  // 或发送到监控系统
  await this.monitoringService.sendMetrics('database.pool', stats);
}
```

---

## 模块边界示例

### 场景 1：查询用户列表并缓存

**职责分工**：

| 步骤              | 模块                  | 职责                             |
| ----------------- | --------------------- | -------------------------------- |
| 1. 获取隔离上下文 | @hl8/nestjs-isolation | 从请求中提取租户 ID              |
| 2. 查询数据库     | @hl8/database         | 提供 EntityManager，应用隔离过滤 |
| 3. 缓存结果       | @hl8/caching          | 存储到 Redis                     |
| 4. 返回数据       | 应用层                | 编排上述步骤                     |

**代码示例**：

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager, // @hl8/database
    private readonly cache: CacheService, // @hl8/caching
    private readonly isolation: IsolationService, // @hl8/nestjs-isolation
  ) {}

  async getUserList(): Promise<User[]> {
    const tenantId = this.isolation.getContext().getTenantId();
    const cacheKey = `users:list:${tenantId}`;

    // 先查缓存
    const cached = await this.cache.get<User[]>(cacheKey);
    if (cached) return cached;

    // 查数据库（隔离过滤自动应用）
    const users = await this.em.find(User, { tenantId });

    // 写入缓存
    await this.cache.set(cacheKey, users, { ttl: 300 });

    return users;
  }
}
```

### 场景 2：执行事务并清除缓存

```typescript
@Injectable()
export class UserService {
  @Transactional() // @hl8/database 提供
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    // 1. 数据库操作（@hl8/database）
    const user = await this.em.findOneOrFail(User, { id });
    Object.assign(user, data);
    await this.em.flush();

    // 2. 清除缓存（@hl8/caching）
    await this.cache.del(`user:${id}`);
    await this.cache.del(`users:list:${user.tenantId}`);

    return user;
  }
}
```

---

## 依赖关系约束

### @hl8/database 的依赖

**可以依赖**：

- ✅ @hl8/nestjs-fastify - 日志服务（FastifyLoggerService）
- ✅ @hl8/config - 配置管理
- ✅ @hl8/exceptions - 异常处理
- ✅ @hl8/nestjs-isolation - 数据隔离
- ✅ @hl8/isolation-model - 隔离领域模型
- ✅ @mikro-orm/\* - ORM 核心
- ✅ @nestjs/\* - NestJS 框架
- ✅ nestjs-cls - 上下文管理

**不应该依赖**：

- ❌ @hl8/caching - 避免职责混淆（缓存由应用层决定）
- ❌ 业务模块 - 保持通用性
- ❌ 应用特定的库 - 保持独立性

---

## 设计原则总结

### 1. 职责分离

```
@hl8/database         -> 连接管理、事务、隔离集成、基础监控
@hl8/nestjs-fastify   -> 日志服务（FastifyLoggerService）
@hl8/caching          -> Redis 缓存
@hl8/exceptions       -> 异常处理
@hl8/nestjs-isolation -> 数据隔离
独立迁移项目           -> 数据库 schema 变更
应用层                -> 业务逻辑、缓存策略、仓储实现
```

### 2. 关注点分离

```
基础设施层关注：
  - 如何连接数据库？
  - 如何管理事务？
  - 如何应用隔离？
  - 如何监控连接？

应用层关注：
  - 缓存什么数据？
  - 缓存多长时间？
  - 什么时候失效缓存？
  - 业务逻辑如何实现？
```

### 3. 最小依赖

```
database 模块应该：
  ✅ 只依赖必需的基础设施模块
  ✅ 不依赖业务模块
  ✅ 不依赖可选的基础设施模块（如 caching）
```

---

## 总结

### ✅ Database 模块应该做什么

1. **连接管理** - 连接池、健康检查、生命周期
2. **事务管理** - 声明式和编程式事务
3. **隔离集成** - 应用隔离过滤，验证上下文
4. **基础监控** - 内存中的实时统计（连接池、慢查询队列）

### ❌ Database 模块不应该做什么

1. **持久化缓存** - 使用 @hl8/caching
2. **数据库迁移** - 使用独立迁移项目
3. **业务仓储** - 在应用层实现
4. **实体定义** - 在应用层定义

### 🎯 架构清晰度

通过明确的职责边界：

- ✅ 避免功能重复
- ✅ 减少依赖耦合
- ✅ 提高可维护性
- ✅ 便于独立测试和部署

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-13  
**状态**: ✅ 架构边界已明确
