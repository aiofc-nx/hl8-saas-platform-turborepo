# @hl8/database 模块集成指南

本文档说明如何在 `fastify-api` 应用中使用 `@hl8/database` 模块。

## 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [实体定义](#实体定义)
- [服务实现](#服务实现)
- [控制器使用](#控制器使用)
- [数据库操作](#数据库操作)
- [监控和健康检查](#监控和健康检查)
- [常见问题](#常见问题)

---

## 快速开始

### 1. 启动 PostgreSQL

使用 Docker 快速启动 PostgreSQL：

```bash
docker run -d --name hl8-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hl8_saas \
  postgres:16-alpine
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

确保数据库配置正确：

```env
DATABASE__HOST=localhost
DATABASE__PORT=5432
DATABASE__DATABASE=hl8_saas
DATABASE__USERNAME=postgres
DATABASE__PASSWORD=postgres
DATABASE__DEBUG=true
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 创建数据库表

```sql
-- 连接到数据库
psql -h localhost -U postgres -d hl8_saas

-- 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID,
  department_id UUID,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, username)
);

-- 创建索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_department_id ON users(department_id);
```

### 5. 启动应用

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

---

## 配置说明

### 应用配置（AppConfig）

在 `src/config/app.config.ts` 中：

```typescript
import { DatabaseConfig } from '@hl8/database';

export class AppConfig {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  @IsOptional()
  public readonly database: DatabaseConfig = new DatabaseConfig();
}
```

### 模块配置（AppModule）

在 `src/app.module.ts` 中：

```typescript
DatabaseModule.forRootAsync({
  inject: [AppConfig],
  useFactory: (config: AppConfig) => ({
    connection: config.database.getConnectionConfig(),
    pool: config.database.getPoolConfig(),
    entities: [User], // 注册实体
    debug: config.isDevelopment,
  }),
})
```

---

## 实体定义

### User 实体示例

在 `src/entities/user.entity.ts` 中：

```typescript
import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  @Property({ type: 'varchar', length: 100 })
  username!: string;

  @Property({ type: 'varchar', length: 255 })
  email!: string;

  // ... 其他字段
}
```

### 多租户隔离字段

所有实体必须包含以下字段用于数据隔离：

- **tenantId** (必填): 租户 ID，用于租户级隔离
- **organizationId** (可选): 组织 ID，用于组织级隔离
- **departmentId** (可选): 部门 ID，用于部门级隔离

---

## 服务实现

### UserService 示例

在 `src/services/user.service.ts` 中：

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  Transactional,
  IsolationAware,
  DatabaseIsolationService,
  IsolationLevel,
} from '@hl8/database';

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
    private readonly isolationService: DatabaseIsolationService,
  ) {}

  // 创建用户（自动应用事务和隔离）
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async createUser(dto: CreateUserDto): Promise<User> {
    const tenantId = this.isolationService.getTenantId();
    
    const user = new User();
    user.tenantId = tenantId!;
    user.username = dto.username;
    user.email = dto.email;
    
    await this.em.persistAndFlush(user);
    return user;
  }

  // 查询用户（自动应用隔离）
  @IsolationAware(IsolationLevel.TENANT)
  async findAll(): Promise<User[]> {
    const filter = this.isolationService.buildIsolationFilter(
      IsolationLevel.TENANT
    );
    return this.em.find(User, filter);
  }
}
```

### 装饰器说明

#### @Transactional()

声明式事务，方法执行在事务中，失败自动回滚：

```typescript
@Transactional()
async createUser(dto: CreateUserDto): Promise<User> {
  // 在事务中执行
  await this.em.persistAndFlush(user);
}
```

#### @IsolationAware(level)

声明式数据隔离，自动验证隔离上下文：

```typescript
@IsolationAware(IsolationLevel.TENANT)
async findAll(): Promise<User[]> {
  // 自动验证 tenantId 存在
  const filter = this.isolationService.buildIsolationFilter(
    IsolationLevel.TENANT
  );
  return this.em.find(User, filter);
}
```

支持的隔离级别：

- `IsolationLevel.PLATFORM`: 平台级（无需隔离）
- `IsolationLevel.TENANT`: 租户级（需要 tenantId）
- `IsolationLevel.ORGANIZATION`: 组织级（需要 tenantId + organizationId）
- `IsolationLevel.DEPARTMENT`: 部门级（需要 tenantId + organizationId + departmentId）
- `IsolationLevel.USER`: 用户级（需要所有字段）

---

## 控制器使用

### UserController 示例

在 `src/controllers/user.controller.ts` 中：

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from '../services/user.service.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
```

---

## 数据库操作

### 创建用户

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 查询用户列表

```bash
curl http://localhost:3000/users \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"
```

### 更新用户

```bash
curl -X PUT http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "firstName": "Jane",
    "isActive": false
  }'
```

### 删除用户（软删除）

```bash
curl -X DELETE http://localhost:3000/users/{id} \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"
```

---

## 监控和健康检查

### 数据库健康检查

```bash
curl http://localhost:3000/users/db/health
```

响应示例：

```json
{
  "status": "healthy",
  "connection": {
    "isConnected": true,
    "connectedAt": "2025-01-15T10:00:00.000Z"
  },
  "pool": {
    "total": 10,
    "active": 3,
    "idle": 7,
    "waiting": 0,
    "max": 20,
    "min": 5
  },
  "responseTime": 5
}
```

### 数据库性能指标

```bash
curl http://localhost:3000/users/db/metrics
```

响应示例：

```json
{
  "timestamp": "2025-01-15T10:05:00.000Z",
  "pool": {
    "total": 10,
    "active": 3,
    "idle": 7
  },
  "queries": {
    "total": 1532,
    "slowCount": 5,
    "avgDuration": 15.3
  },
  "transactions": {
    "committed": 245,
    "rolledBack": 3,
    "active": 1
  },
  "slowQueries": [
    {
      "query": "SELECT * FROM users WHERE ...",
      "duration": 2150,
      "executedAt": "2025-01-15T10:03:00.000Z"
    }
  ]
}
```

---

## 常见问题

### 1. 如何处理嵌套事务？

`@Transactional` 装饰器自动检测嵌套事务并复用：

```typescript
@Transactional()
async createUserWithProfile(dto: CreateUserDto) {
  const user = await this.createUser(dto); // 复用外层事务
  const profile = await this.createProfile(user.id); // 复用外层事务
  return { user, profile };
}
```

### 2. 如何在没有隔离上下文时操作数据库？

使用 `IsolationLevel.PLATFORM` 跳过隔离验证：

```typescript
@IsolationAware(IsolationLevel.PLATFORM)
async findAllPlatformUsers(): Promise<User[]> {
  return this.em.find(User, {}); // 不应用隔离过滤
}
```

### 3. 如何手动管理事务？

注入 `TransactionService` 进行编程式事务：

```typescript
constructor(
  private readonly transactionService: TransactionService,
) {}

async createUser(dto: CreateUserDto) {
  return this.transactionService.runInTransaction(async (em) => {
    const user = new User();
    // ... 设置字段
    await em.persistAndFlush(user);
    return user;
  });
}
```

### 4. 如何查看慢查询？

访问 `/users/db/metrics` 端点查看最近的慢查询（默认 > 1000ms）。

### 5. 连接池如何配置？

通过环境变量配置：

```env
DATABASE__POOL_MIN=5
DATABASE__POOL_MAX=20
DATABASE__IDLE_TIMEOUT_MILLIS=30000
DATABASE__ACQUIRE_TIMEOUT_MILLIS=30000
```

---

## 总结

通过本指南，你已经学会了：

1. ✅ 配置 @hl8/database 模块
2. ✅ 定义多租户实体
3. ✅ 使用声明式事务和隔离
4. ✅ 实现 CRUD 操作
5. ✅ 监控数据库健康和性能

更多信息请参考 [@hl8/database 模块文档](../../libs/database/README.md)。
