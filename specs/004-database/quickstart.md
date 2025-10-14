# Quick Start: @hl8/database 快速开始指南

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 快速上手使用 @hl8/database 模块

---

## 前置要求

- Node.js >= 20
- pnpm 10.11.0+
- PostgreSQL 数据库
- 已安装 @hl8/config、@hl8/exceptions、@hl8/nestjs-isolation

---

## 安装

```bash
cd /home/arligle/hl8/hl8-saas-platform-turborepo
pnpm add @hl8/database --filter your-app
```

---

## 基础配置

### 1. 环境变量

创建 `.env` 文件：

```env
# 数据库连接
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_saas
DB_USERNAME=postgres
DB_PASSWORD=your_password

# 连接池
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000

# 监控
DB_SLOW_QUERY_THRESHOLD=1000
```

---

### 2. 配置类

创建或更新应用配置类：

```typescript
// src/config/app.config.ts
import { DatabaseConfig } from '@hl8/database';
import { IsString } from 'class-validator';

export class AppConfig {
  /**
   * 应用配置
   */
  @IsString()
  appName: string = 'HL8 SAAS';

  /**
   * 数据库配置
   */
  database: DatabaseConfig = new DatabaseConfig();
}
```

---

### 3. 定义实体

创建数据库实体：

```typescript
// src/entities/user.entity.ts
import { Entity, PrimaryKey, Property } from '@hl8/database';
import { v4 } from 'uuid';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property()
  email: string;

  @Property()
  tenantId: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, email: string, tenantId: string) {
    this.name = name;
    this.email = email;
    this.tenantId = tenantId;
  }
}
```

---

### 4. 配置模块

在应用模块中配置 DatabaseModule：

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from '@hl8/config';
import { DatabaseModule, DatabaseConfig } from '@hl8/database';
import { IsolationModule } from '@hl8/nestjs-isolation';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // 1. 配置模块
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
      load: [dotenvLoader()],
    }),

    // 2. 隔离模块
    IsolationModule.forRoot(),

    // 3. 数据库模块
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
          idleTimeoutMillis: config.idleTimeoutMillis,
        },
        entities: [User], // 注册实体
        migrations: {
          path: './migrations',
        },
      }),
      inject: [DatabaseConfig],
    }),
  ],
})
export class AppModule {}
```

---

## 基础用法

### 1. 创建仓储

```typescript
// src/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@hl8/database';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,
    private readonly logger: FastifyLoggerService, // 注入日志服务
  ) {}

  async findAll(): Promise<User[]> {
    this.logger.log('查询所有用户');
    return this.em.find(User, {});
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log('查询用户', { userId: id });
    return this.em.findOne(User, { id });
  }

  async save(user: User): Promise<void> {
    this.logger.log('保存用户', { userId: user.id });
    await this.em.persistAndFlush(user);
  }

  async remove(user: User): Promise<void> {
    this.logger.log('删除用户', { userId: user.id });
    await this.em.removeAndFlush(user);
  }
}
```

---

### 2. 使用事务

#### 方式一：使用装饰器（推荐）

```typescript
// src/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { Transactional } from '@hl8/database';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  @Transactional()
  async createUser(
    name: string,
    email: string,
    tenantId: string,
  ): Promise<User> {
    const user = new User(name, email, tenantId);
    await this.userRepository.save(user);
    // 如果这里抛出异常，上面的操作会自动回滚
    return user;
  }
}
```

#### 方式二：编程式事务

```typescript
import { Injectable } from '@nestjs/common';
import { TransactionService } from '@hl8/database';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly transactionService: TransactionService) {}

  async createUser(
    name: string,
    email: string,
    tenantId: string,
  ): Promise<User> {
    return this.transactionService.runInTransaction(async (em) => {
      const user = new User(name, email, tenantId);
      await em.persistAndFlush(user);
      return user;
    });
  }
}
```

---

### 3. 多租户隔离

使用隔离装饰器自动应用租户过滤：

```typescript
// src/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { IsolationAware, IsolationLevel } from '@hl8/database';
import { IsolationService } from '@hl8/nestjs-isolation';

@Injectable()
export class UserRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly isolationService: IsolationService,
  ) {}

  @IsolationAware(IsolationLevel.TENANT)
  async findAllInTenant(): Promise<User[]> {
    const tenantId = this.isolationService.getContext()?.getTenantId();
    return this.em.find(User, { tenantId });
  }
}
```

---

## 数据库迁移

### 1. 创建迁移

```bash
pnpm --filter your-app migration:create
```

这将生成一个新的迁移文件：

```typescript
// migrations/Migration20251013000000.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20251013000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE TABLE users (...);');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE users;');
  }
}
```

---

### 2. 运行迁移

```bash
# 运行所有待执行的迁移
pnpm --filter your-app migration:up

# 或在代码中运行
```

```typescript
// src/main.ts
import { MigrationService } from '@hl8/database';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 运行迁移
  const migrationService = app.get(MigrationService);
  await migrationService.runMigrations();

  await app.listen(3000);
}
bootstrap();
```

---

### 3. 回滚迁移

```bash
# 回滚最近的迁移
pnpm --filter your-app migration:down
```

---

## 健康检查

### 添加健康检查端点

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from '@hl8/database';

@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get('database')
  async checkDatabase() {
    const result = await this.healthCheckService.check();
    return {
      status: result.status,
      connection: result.connection,
      pool: result.pool,
      timestamp: result.checkedAt,
    };
  }
}
```

---

## 性能监控

### 查看慢查询

```typescript
// src/monitoring/monitoring.controller.ts
import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '@hl8/database';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('slow-queries')
  async getSlowQueries() {
    const slowQueries = await this.metricsService.getSlowQueries();
    return {
      count: slowQueries.length,
      queries: slowQueries.slice(0, 10), // 最近 10 条
    };
  }

  @Get('metrics')
  async getMetrics() {
    const metrics = await this.metricsService.getDatabaseMetrics();
    return metrics;
  }
}
```

---

## 常见问题

### 1. 连接失败

**问题**: 应用启动时无法连接到数据库

**解决**:

- 检查环境变量配置
- 确认数据库服务正在运行
- 验证用户名和密码
- 检查防火墙规则

---

### 2. 实体未找到

**问题**: `Entity 'User' not found in the schema`

**解决**:

- 确保实体已在 DatabaseModule 配置中注册
- 检查实体文件的装饰器是否正确
- 运行迁移创建表结构

---

### 3. 事务回滚

**问题**: 事务没有按预期回滚

**解决**:

- 确保使用 `@Transactional()` 装饰器
- 检查是否捕获了异常但未重新抛出
- 验证连接池配置

---

### 4. 多租户数据泄露

**问题**: 查询返回了其他租户的数据

**解决**:

- 使用 `@IsolationAware()` 装饰器
- 检查隔离上下文是否正确设置
- 在查询中显式添加 tenantId 过滤

---

## 下一步

- 📖 阅读完整文档：`libs/database/README.md`
- 🔧 查看 API 契约：`specs/004-database/contracts/`
- 🏗️ 了解数据模型：`specs/004-database/data-model.md`
- 🧪 编写单元测试：参考 `libs/database/__tests__/`

---

## 帮助与支持

如有问题，请：

- 查看详细文档
- 查看源代码注释
- 联系团队寻求帮助

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-13
