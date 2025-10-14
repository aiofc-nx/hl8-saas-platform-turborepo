# Module API Contract: DatabaseModule

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 定义 DatabaseModule 的公共接口契约

---

## 模块导出

### 主模块: DatabaseModule

```typescript
import { DatabaseModule } from '@hl8/database';
```

**用途**: NestJS 数据库管理模块，提供数据库连接、事务管理、多租户隔离等功能

---

## 模块配置

### 1. forRoot() - 同步配置

**签名**:

```typescript
static forRoot(options: DatabaseModuleOptions): DynamicModule
```

**参数**:

- `options`: DatabaseModuleOptions - 数据库模块配置选项

**返回**: DynamicModule - NestJS 动态模块

**用途**: 使用同步方式配置数据库模块

**示例**:

```typescript
@Module({
  imports: [
    DatabaseModule.forRoot({
      connection: {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'hl8_saas',
        username: 'postgres',
        password: 'password',
      },
      pool: {
        min: 5,
        max: 20,
      },
      entities: [User, Tenant, Organization],
    }),
  ],
})
export class AppModule {}
```

---

### 2. forRootAsync() - 异步配置

**签名**:

```typescript
static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule
```

**参数**:

- `options`: DatabaseModuleAsyncOptions - 异步配置选项

**返回**: DynamicModule - NestJS 动态模块

**用途**: 使用异步方式配置数据库模块（从配置服务获取配置）

**示例**:

```typescript
@Module({
  imports: [
    DatabaseModule.forRootAsync({
      useFactory: async (config: DatabaseConfig) => ({
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
        entities: [User, Tenant, Organization],
      }),
      inject: [DatabaseConfig],
    }),
  ],
})
export class AppModule {}
```

---

## 配置接口

### DatabaseModuleOptions

```typescript
interface DatabaseModuleOptions {
  /** 数据库连接配置 */
  connection: ConnectionConfig;

  /** 连接池配置（可选） */
  pool?: PoolConfig;

  /** 实体类数组 */
  entities: Function[];

  /** 迁移配置（可选） */
  migrations?: MigrationConfig;

  /** 监控配置（可选） */
  monitoring?: MonitoringConfig;

  /** 是否启用调试模式（可选） */
  debug?: boolean;
}
```

---

### DatabaseModuleAsyncOptions

```typescript
interface DatabaseModuleAsyncOptions {
  /** 工厂函数 */
  useFactory: (
    ...args: any[]
  ) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;

  /** 依赖注入（可选） */
  inject?: any[];
}
```

---

## 提供的服务

DatabaseModule 自动注册以下服务到 NestJS 容器：

### 1. ConnectionManager

**令牌**: `ConnectionManager` (类)  
**用途**: 管理数据库连接的生命周期  
**作用域**: 单例

```typescript
constructor(
  private readonly connectionManager: ConnectionManager
) {}
```

---

### 2. TransactionService

**令牌**: `TransactionService` (类)  
**用途**: 提供编程式事务管理  
**作用域**: 单例

```typescript
constructor(
  private readonly transactionService: TransactionService
) {}
```

---

### 3. IsolationService

**令牌**: `IsolationService` (类)  
**用途**: 管理多租户数据隔离  
**作用域**: 请求作用域

```typescript
constructor(
  private readonly isolationService: IsolationService
) {}
```

---

### 4. MigrationService

**令牌**: `MigrationService` (类)  
**用途**: 管理数据库迁移  
**作用域**: 单例

```typescript
constructor(
  private readonly migrationService: MigrationService
) {}
```

---

### 5. HealthCheckService

**令牌**: `HealthCheckService` (类)  
**用途**: 提供数据库健康检查  
**作用域**: 单例

```typescript
constructor(
  private readonly healthCheckService: HealthCheckService
) {}
```

---

### 6. MetricsService

**令牌**: `MetricsService` (类)  
**用途**: 收集和报告性能指标  
**作用域**: 单例

```typescript
constructor(
  private readonly metricsService: MetricsService
) {}
```

---

## 装饰器导出

### 1. @Transactional()

**用途**: 声明式事务管理

**签名**:

```typescript
function Transactional(options?: TransactionalOptions): MethodDecorator;
```

**参数**:

- `options`: TransactionalOptions - 事务选项（可选）

**示例**:

```typescript
@Injectable()
export class UserService {
  @Transactional()
  async createUser(data: CreateUserDto): Promise<User> {
    // 方法内的所有操作都在事务中执行
    // 成功时自动提交，失败时自动回滚
  }
}
```

---

### 2. @IsolationAware()

**用途**: 确保方法在正确的隔离上下文中执行

**签名**:

```typescript
function IsolationAware(level?: IsolationLevel): MethodDecorator;
```

**参数**:

- `level`: IsolationLevel - 需要的隔离级别（可选，默认 TENANT）

**示例**:

```typescript
@Injectable()
export class UserRepository {
  @IsolationAware(IsolationLevel.TENANT)
  async findAll(): Promise<User[]> {
    // 自动应用租户隔离过滤
  }
}
```

---

## 类型定义导出

### 从 MikroORM 重新导出

为了让应用不直接依赖 @mikro-orm/core，database 模块重新导出常用类型：

```typescript
export {
  EntityManager,
  EntityRepository,
  EntityData,
  FilterQuery,
  QueryOrderMap,
  FindOptions,
  wrap,
} from '@mikro-orm/core';

export {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  Embedded,
  Enum,
} from '@mikro-orm/core';
```

---

## 配置类导出

### DatabaseConfig

```typescript
import { DatabaseConfig } from '@hl8/database';
```

**用途**: 类型安全的数据库配置类，集成 @hl8/config

**示例**:

```typescript
import { TypedConfigModule } from '@hl8/config';
import { DatabaseConfig } from '@hl8/database';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
      load: [dotenvLoader()],
    }),
  ],
})
export class AppModule {}
```

---

## 异常类导出

### 数据库异常

```typescript
import {
  DatabaseConnectionException,
  DatabaseQueryException,
  DatabaseTransactionException,
  DatabaseMigrationException,
} from '@hl8/database';
```

**用途**: 数据库操作的标准异常类型，遵循 RFC7807

**示例**:

```typescript
try {
  await this.userRepository.save(user);
} catch (error) {
  if (error instanceof DatabaseQueryException) {
    // 处理查询异常
  }
}
```

---

## 常量导出

### 依赖注入令牌

```typescript
import { DI_TOKENS } from '@hl8/database';
```

**用途**: 模块内部使用的依赖注入令牌

**可用令牌**:

- `DI_TOKENS.MODULE_OPTIONS` - 模块配置选项
- `DI_TOKENS.CONNECTION_MANAGER` - 连接管理器
- `DI_TOKENS.TRANSACTION_MANAGER` - 事务管理器

---

## 使用约束

### 必需依赖

使用 DatabaseModule 需要安装以下依赖：

```json
{
  "dependencies": {
    "@hl8/database": "workspace:*",
    "@hl8/config": "workspace:*",
    "@hl8/exceptions": "workspace:*",
    "@hl8/nestjs-isolation": "workspace:*"
  }
}
```

---

### 环境变量

需要配置以下环境变量：

```env
# 数据库连接
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_saas
DB_USERNAME=postgres
DB_PASSWORD=password

# 连接池
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000

# 监控
DB_SLOW_QUERY_THRESHOLD=1000
```

---

### Node.js 版本

- **最低版本**: Node.js >= 20
- **推荐版本**: Node.js 20 LTS

---

### TypeScript 配置

必需的 TypeScript 配置：

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "strict": true
  }
}
```

---

### package.json 配置

必需的 package.json 配置：

```json
{
  "type": "module",
  "engines": {
    "node": ">=20"
  }
}
```

---

## 初始化顺序

推荐的模块导入顺序：

```typescript
@Module({
  imports: [
    // 1. 配置模块（最先）
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
    }),

    // 2. 隔离模块
    IsolationModule.forRoot(),

    // 3. 数据库模块
    DatabaseModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => ({
        connection: config.getConnectionConfig(),
        entities: [
          /* 实体列表 */
        ],
      }),
      inject: [DatabaseConfig],
    }),

    // 4. 其他业务模块
    UserModule,
    // ...
  ],
})
export class AppModule {}
```

---

## 全局 vs 局部

### 全局模块

DatabaseModule 默认注册为全局模块，所有模块都可以注入其提供的服务：

```typescript
@Module({
  imports: [DatabaseModule.forRoot(/* ... */)],
})
export class AppModule {}

// 在任何模块中都可以注入
@Injectable()
export class UserService {
  constructor(private readonly connectionManager: ConnectionManager) {}
}
```

### 局部模块

如果需要多个数据库连接，可以使用非全局模式（需要在各模块中显式导入）。

---

## 生命周期钩子

DatabaseModule 实现以下生命周期钩子：

### onModuleInit

- 建立数据库连接
- 运行待执行的迁移（如果配置）
- 初始化连接池

### onModuleDestroy

- 关闭所有数据库连接
- 清理连接池
- 释放资源

---

## 契约版本

**版本**: 1.0.0  
**兼容性**: 向后兼容  
**破坏性变更**: 需要主版本升级

---

**完成时间**: 2025-10-13  
**下一步**: 创建服务 API 契约
