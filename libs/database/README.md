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

## 🔗 依赖

- @hl8/nestjs-fastify - 日志服务
- @hl8/config - 配置管理
- @hl8/exceptions - 异常处理
- @hl8/nestjs-isolation - 数据隔离
- @mikro-orm/core - ORM 核心

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
