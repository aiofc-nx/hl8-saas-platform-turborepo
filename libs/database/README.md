# @hl8/database

数据库连接管理模块 - 为 HL8 SAAS 平台提供可靠的数据库访问能力

---

## 📋 概述

`@hl8/database` 是 HL8 SAAS 平台的核心基础设施模块，提供：

- ✅ **数据库连接管理**: 自动建立和维护数据库连接
- ✅ **事务管理**: 声明式和编程式事务支持
- ✅ **多租户数据隔离**: 集成 5 级数据隔离
- ✅ **连接池优化**: 高效的连接复用和资源管理
- ✅ **健康检查和监控**: 实时监控连接状态和性能指标
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **ES Module**: 现代化的模块系统

## 📦 安装

```bash
pnpm add @hl8/database
```

## 🚀 快速开始

### 1. 配置环境变量

```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_saas
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000
DB_SLOW_QUERY_THRESHOLD=1000
```

### 2. 配置模块

```typescript
import { Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from '@hl8/config';
import { DatabaseModule, DatabaseConfig } from '@hl8/database';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
      load: [dotenvLoader()],
    }),
    
    DatabaseModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => ({
        connection: {
          type: 'postgresql',
          host: config.host,
          port: config.port,
          database: config.database,
          username: config.username,
          password: config.password,
        },
        pool: {
          min: config.poolMin,
          max: config.poolMax,
        },
        entities: [User, Tenant],
      }),
      inject: [DatabaseConfig],
    }),
  ],
})
export class AppModule {}
```

### 3. 使用事务

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional } from '@hl8/database';

@Injectable()
export class UserService {
  @Transactional()
  async createUser(data: CreateUserDto): Promise<User> {
    // 自动事务管理
    const user = new User(data);
    await this.em.persistAndFlush(user);
    return user;
  }
}
```

## 📚 文档

- [快速开始指南](../../specs/004-database/quickstart.md)
- [API 文档](../../specs/004-database/contracts/)
- [架构说明](../../specs/004-database/architecture-notes.md)

## ✨ 核心功能

### 1. 数据库连接管理

- 自动建立和维护数据库连接
- 连接健康检查和自动重连
- 连接池统计和监控
- 优雅关闭连接

### 2. 事务管理

**声明式事务**：

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  @Transactional()
  async createUser(data: CreateUserDto): Promise<User> {
    // 自动事务管理
    const user = new User(data);
    await this.em.persistAndFlush(user);
    return user;
  }
}
```

**编程式事务**：

```typescript
const result = await this.transactionService.runInTransaction(async (em) => {
  const user = new User(data);
  await em.persistAndFlush(user);
  return user;
});
```

### 3. 多租户数据隔离

```typescript
@Injectable()
export class UserRepository {
  constructor(
    private readonly isolationService: DatabaseIsolationService,
  ) {}

  @IsolationAware(IsolationLevel.TENANT)
  async findAll(): Promise<User[]> {
    // 自动应用租户隔离
    const filter = this.isolationService.buildIsolationFilter(IsolationLevel.TENANT);
    return this.em.find(User, filter);
  }
}
```

### 4. 健康检查和监控

```typescript
@Injectable()
export class MonitoringController {
  constructor(
    private readonly healthCheck: HealthCheckService,
    private readonly metrics: MetricsService,
  ) {}

  async checkHealth() {
    const result = await this.healthCheck.check();
    return result; // { status: 'healthy', pool: {...}, responseTime: 45 }
  }

  async getSlowQueries() {
    return this.metrics.getSlowQueries(10); // 最近 10 条慢查询
  }
}
```

## 🏗️ 架构特性

- ✅ **ES Module**: 现代化的模块系统
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **零缓存**: 不依赖 @hl8/caching，职责单一
- ✅ **无迁移**: 迁移由独立项目负责
- ✅ **全局日志**: 使用 FastifyLoggerService，自动包含隔离上下文
- ✅ **RFC7807**: 标准异常格式

## 🔗 依赖

- @hl8/nestjs-fastify - 日志服务
- @hl8/config - 配置管理
- @hl8/exceptions - 异常处理
- @hl8/nestjs-isolation - 数据隔离
- @hl8/isolation-model - 隔离领域模型
- @mikro-orm/core - ORM 核心
- nestjs-cls - 上下文管理

## 📊 代码统计

- 源代码：~2000 行
- 核心服务：5 个
- 装饰器：2 个
- 异常类：4 个
- 完整的中文 TSDoc 注释

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
