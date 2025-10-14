# Research: Database 连接管理模块技术研究

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 解决技术选型、最佳实践和集成方案的研究

---

## 研究任务清单

基于 Technical Context 中的未知项和依赖关系，以下是需要研究的关键问题：

1. ✅ MikroORM 与现有架构的集成方案
2. ✅ ES Module 环境下的 NestJS + MikroORM 配置
3. ✅ nestjs-cls 6.0+ 的上下文管理最佳实践
4. ✅ 多租户数据隔离的实现策略
5. ✅ 事务装饰器的实现方案
6. ✅ 日志集成方案（NestJS Logger vs FastifyLogger）
7. ✅ 异常处理与 @hl8/exceptions 的集成
8. ✅ 配置管理与 @hl8/config 的集成
9. ✅ 连接池优化策略

---

## 1. MikroORM 与现有架构的集成方案

### 决策：使用 MikroORM 6.x 作为 ORM 层

### 理由

- **成熟稳定**：MikroORM 6.x 是成熟的 TypeScript ORM，有良好的社区支持
- **类型安全**：原生 TypeScript 支持，完整的类型推导
- **灵活性**：支持多种数据库（PostgreSQL、MongoDB、MySQL 等）
- **NestJS 集成**：官方提供 @mikro-orm/nestjs 集成包
- **ES Module 支持**：6.x 版本完全支持 ES Module
- **旧代码经验**：团队已有使用 MikroORM 的经验

### 集成方案

```typescript
// libs/database/src/database.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class DatabaseModule {
  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MikroOrmModule.forRootAsync({
          useFactory: async (config: DatabaseConfig) => ({
            type: 'postgresql',
            clientUrl: config.getConnectionString(),
            entities: config.entities,
            // ES Module 配置
            tsNode: false,
            discovery: { warnWhenNoEntities: false },
          }),
          inject: [DatabaseConfig],
        }),
      ],
      // ...其他配置
    };
  }
}
```

### 替代方案（已拒绝）

- **Prisma**：更现代但需要生成客户端代码，增加构建复杂度
- **TypeORM**：社区活跃但 TypeScript 支持不如 MikroORM
- **Sequelize**：成熟但基于 JavaScript，类型支持较弱

---

## 2. ES Module 环境下的 NestJS + MikroORM 配置

### 决策：使用 NodeNext + 动态导入实体

### 关键配置

**package.json**:

```json
{
  "name": "@hl8/database",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "engines": {
    "node": ">=20"
  }
}
```

**tsconfig.build.json**:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.spec.ts", "__tests__"]
}
```

**MikroORM 配置**:

```typescript
// 在 ES Module 环境下，实体需要动态导入
const config: Options = {
  type: 'postgresql',
  entities: ['./dist/**/*.entity.js'], // 使用编译后的 .js 文件
  entitiesTs: ['./src/**/*.entity.ts'], // TypeScript 源文件
  tsNode: false, // 禁用 ts-node（生产环境）
  discovery: {
    warnWhenNoEntities: false,
    requireEntitiesArray: true,
  },
};
```

### 最佳实践

1. 实体文件使用 `.entity.ts` 后缀便于识别
2. 在配置中同时提供 `entities` 和 `entitiesTs` 路径
3. 生产环境使用编译后的 `.js` 文件
4. 开发环境可以使用 `entitiesTs` 直接引用源文件

---

## 3. nestjs-cls 6.0+ 的上下文管理最佳实践

### 决策：使用 nestjs-cls 6.0+ 进行请求上下文管理

### 版本选择

- **nestjs-cls 6.0.1**：最新稳定版，支持 NestJS 11+
- 旧代码使用 5.0.0，需要升级到 6.0+ 以匹配当前项目

### 集成方案

**模块配置**:

```typescript
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req) => req.headers['x-request-id'] ?? uuidv4(),
      },
    }),
  ],
})
export class DatabaseModule {}
```

**隔离上下文存储**:

```typescript
import { ClsService } from 'nestjs-cls';
import { IsolationContext } from '@hl8/isolation-model';

export class IsolationService {
  constructor(private readonly cls: ClsService) {}

  setIsolationContext(context: IsolationContext): void {
    this.cls.set('isolationContext', context);
  }

  getIsolationContext(): IsolationContext | undefined {
    return this.cls.get('isolationContext');
  }

  getTenantId(): string | undefined {
    return this.getIsolationContext()?.getTenantId();
  }
}
```

**事务上下文存储**:

```typescript
export class TransactionService {
  constructor(private readonly cls: ClsService) {}

  setEntityManager(em: EntityManager): void {
    this.cls.set('entityManager', em);
  }

  getEntityManager(): EntityManager | undefined {
    return this.cls.get('entityManager');
  }
}
```

### 最佳实践

1. 使用类型化的 get/set 方法而非直接访问 cls
2. 为不同用途创建专门的服务类（IsolationService、TransactionService）
3. 在中间件/拦截器中设置上下文，在服务中读取上下文
4. 使用请求 ID 进行链路追踪

---

## 4. 多租户数据隔离的实现策略

### 决策：集成 @hl8/nestjs-isolation，使用 IsolationContext

### 集成方案

**隔离上下文集成**:

```typescript
import { IsolationContext } from '@hl8/isolation-model';
import { IsolationService as BaseIsolationService } from '@hl8/nestjs-isolation';

export class DatabaseIsolationService {
  constructor(
    private readonly baseIsolationService: BaseIsolationService,
    private readonly cls: ClsService,
  ) {}

  /**
   * 应用隔离过滤器到查询
   *
   * @description 根据当前隔离上下文自动添加过滤条件
   */
  applyIsolationFilter<T>(
    qb: QueryBuilder<T>,
    entity: string,
  ): QueryBuilder<T> {
    const context = this.baseIsolationService.getContext();

    if (!context) {
      throw new DatabaseQueryException('缺少隔离上下文');
    }

    // 应用租户隔离
    if (context.getTenantId()) {
      qb.andWhere({ tenantId: context.getTenantId() });
    }

    // 应用组织隔离（如果需要）
    if (context.getOrganizationId()) {
      qb.andWhere({ organizationId: context.getOrganizationId() });
    }

    // 应用部门隔离（如果需要）
    if (context.getDepartmentId()) {
      qb.andWhere({ departmentId: context.getDepartmentId() });
    }

    return qb;
  }
}
```

**隔离装饰器**:

```typescript
export function IsolationAware(level: IsolationLevel = IsolationLevel.TENANT) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cls: ClsService = this.cls;
      const context: IsolationContext = cls.get('isolationContext');

      if (!context) {
        throw new DatabaseQueryException('缺少隔离上下文');
      }

      // 验证隔离级别
      if (level === IsolationLevel.TENANT && !context.getTenantId()) {
        throw new DatabaseQueryException('租户隔离要求提供租户ID');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
```

### 使用示例

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly isolationService: DatabaseIsolationService,
  ) {}

  @IsolationAware(IsolationLevel.TENANT)
  async findAll(): Promise<User[]> {
    const qb = this.em.createQueryBuilder(User, 'u');
    this.isolationService.applyIsolationFilter(qb, 'User');
    return qb.getResult();
  }
}
```

### 最佳实践

1. 使用装饰器强制隔离检查
2. 在查询构建器中自动应用隔离过滤
3. 在服务层而非控制器层处理隔离
4. 记录所有隔离相关的日志用于审计

---

## 5. 事务装饰器的实现方案

### 决策：实现声明式事务装饰器 @Transactional

### 实现方案

**事务装饰器**:

```typescript
import { ClsService } from 'nestjs-cls';
import { EntityManager } from '@mikro-orm/core';

export interface TransactionalOptions {
  isolationLevel?: 'read committed' | 'repeatable read' | 'serializable';
  readOnly?: boolean;
}

export function Transactional(options?: TransactionalOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cls: ClsService = this.cls;
      const em: EntityManager = this.em || this.entityManager;

      // 如果已在事务中，复用现有事务
      const existingEm = cls.get<EntityManager>('entityManager');
      if (existingEm) {
        return originalMethod.apply(this, args);
      }

      // 开启新事务
      return em.transactional(async (transactionEm) => {
        // 将事务 EM 存储到上下文
        cls.set('entityManager', transactionEm);

        try {
          const result = await originalMethod.apply(this, args);
          // 事务自动提交
          return result;
        } catch (error) {
          // 事务自动回滚
          throw error;
        } finally {
          // 清理上下文
          cls.set('entityManager', undefined);
        }
      });
    };

    return descriptor;
  };
}
```

### 使用示例

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async createUser(data: CreateUserDto): Promise<User> {
    // 从上下文获取事务 EM
    const em = this.cls.get<EntityManager>('entityManager');

    const user = new User(data);
    await em.persistAndFlush(user);

    return user;
  }
}
```

### 最佳实践

1. 支持嵌套事务（检测现有事务并复用）
2. 使用 MikroORM 的 `transactional()` 方法确保原子性
3. 将事务 EntityManager 存储到 CLS 上下文
4. 事务结束后清理上下文
5. 使用数据库默认隔离级别（PostgreSQL 为 READ COMMITTED）

---

## 6. 日志集成方案

### 决策：使用 @hl8/nestjs-fastify 提供的 FastifyLoggerService

### 理由

- **全局统一**：FastifyLoggerService 是系统最早注册的全局日志服务
- **零开销**：直接复用 Fastify 内置的 Pino 实例
- **自动上下文**：自动包含隔离上下文（租户、组织、部门、用户）
- **高性能**：基于 Pino，性能比 NestJS Logger 快 10-20 倍
- **标准接口**：实现 NestLoggerService 和 ILoggerService 接口
- **结构化日志**：原生支持 JSON 格式，便于日志分析

### 集成方案

**方案 A：注入 FastifyLoggerService（推荐）**

```typescript
import { Injectable } from '@nestjs/common';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';

@Injectable()
export class ConnectionManager {
  constructor(private readonly logger: FastifyLoggerService) {}

  async connect(): Promise<void> {
    this.logger.log('正在连接数据库...');
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

**方案 B：使用 @nestjs/common 的 Logger（兼容模式）**

如果未使用 Fastify，可以回退到 NestJS Logger：

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class ConnectionManager {
  private readonly logger = new Logger(ConnectionManager.name);

  // ... 使用方式相同
}
```

**推荐策略**：

- database 模块默认使用 `FastifyLoggerService`
- 因为整个系统已经全局注册了 FastifyLoggingModule
- 所有服务都可以直接注入使用

### 日志自动增强

使用 FastifyLoggerService 时，所有日志自动包含：

```json
{
  "level": "info",
  "time": 1697123456789,
  "msg": "正在连接数据库...",
  "context": "ConnectionManager",
  // 自动添加的隔离上下文
  "tenantId": "tenant-123",
  "organizationId": "org-456",
  "departmentId": "dept-789",
  "userId": "user-001",
  // 自动添加的请求信息
  "requestId": "req-abc-123"
}
```

### 模块初始化顺序

由于 FastifyLoggingModule 是最早注册的，database 模块可以安全注入：

```typescript
// app.module.ts
@Module({
  imports: [
    // 1. Fastify 日志模块（最早）
    FastifyLoggingModule.forRoot(),

    // 2. 异常模块
    FastifyExceptionModule.forRoot(),

    // 3. 隔离模块
    IsolationModule.forRoot(),

    // 4. Database 模块（可以注入上面的服务）
    DatabaseModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => ({
        connection: config.getConnectionConfig(),
        entities: [User, Tenant],
      }),
      inject: [DatabaseConfig],
    }),
  ],
})
export class AppModule {}
```

### 最佳实践

1. ✅ 在所有 database 服务中注入 `FastifyLoggerService`
2. ✅ 所有日志消息使用中文
3. ✅ 使用结构化日志（对象参数而非字符串拼接）
4. ✅ 记录关键操作（连接、断开、事务、慢查询）
5. ✅ 错误日志包含堆栈跟踪
6. ✅ 利用自动包含的隔离上下文（无需手动添加）
7. ✅ 使用合适的日志级别（log、warn、error、debug）

### 结构化日志示例

```typescript
// ✅ 推荐：使用结构化日志
this.logger.log('数据库连接成功', {
  host: config.host,
  port: config.port,
  database: config.database,
  poolSize: config.poolMax,
});

// ❌ 不推荐：字符串拼接
this.logger.log(`数据库连接成功: ${config.host}:${config.port}`);
```

---

## 7. 异常处理与 @hl8/exceptions 的集成

### 决策：使用 @hl8/exceptions 提供的异常基类

### 集成方案

**异常类定义**:

```typescript
import { AbstractHttpException } from '@hl8/exceptions';

/**
 * 数据库连接异常
 *
 * @description 当数据库连接失败时抛出此异常
 */
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

/**
 * 数据库查询异常
 *
 * @description 当数据库查询执行失败时抛出此异常
 */
export class DatabaseQueryException extends AbstractHttpException {
  constructor(detail: string, data?: Record<string, any>) {
    super('DATABASE_QUERY_ERROR', '数据库查询错误', detail, 500, data);
  }
}

/**
 * 数据库事务异常
 *
 * @description 当事务执行失败时抛出此异常
 */
export class DatabaseTransactionException extends AbstractHttpException {
  constructor(detail: string, data?: Record<string, any>) {
    super('DATABASE_TRANSACTION_ERROR', '数据库事务错误', detail, 500, data);
  }
}
```

**说明**：

- 使用 `AbstractHttpException` 作为基类（来自 @hl8/exceptions）
- 构造函数参数顺序：errorCode, title, detail, status, data
- 原始错误可以通过 data 参数传递，或直接重新抛出
- 自动符合 RFC7807 标准

### 使用示例

```typescript
import { Logger } from '@nestjs/common';
import { DatabaseConnectionException } from '../exceptions/index.js';

@Injectable()
export class ConnectionManager {
  private readonly logger = new Logger(ConnectionManager.name);

  async connect(): Promise<void> {
    try {
      this.logger.log('正在连接数据库...');
      await this.orm.connect();
      this.logger.log('数据库连接成功');
    } catch (error) {
      this.logger.error('数据库连接失败', error.stack);

      throw new DatabaseConnectionException('无法连接到数据库服务器', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        // 不包含密码等敏感信息
      });
    }
  }

  async executeQuery<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      return await this.em.execute(sql, params);
    } catch (error) {
      this.logger.error('查询执行失败', error.stack);

      throw new DatabaseQueryException('数据库查询执行失败', {
        // 脱敏后的 SQL（隐藏敏感参数）
        query: this.sanitizeQuery(sql),
        // 不包含实际参数值
      });
    }
  }
}
```

### 异常响应示例

当抛出 `DatabaseConnectionException` 时，全局过滤器自动转换为：

```json
{
  "type": "https://docs.hl8.com/errors#DATABASE_CONNECTION_ERROR",
  "title": "数据库连接错误",
  "detail": "无法连接到数据库服务器",
  "status": 503,
  "errorCode": "DATABASE_CONNECTION_ERROR",
  "instance": "req-abc-123",
  "data": {
    "host": "localhost",
    "port": 5432,
    "database": "hl8_saas"
  }
}
```

### 最佳实践

1. ✅ 所有异常继承自 `AbstractHttpException`
2. ✅ 异常消息（title、detail）使用中文
3. ✅ errorCode 使用大写蛇形命名（如 DATABASE_CONNECTION_ERROR）
4. ✅ data 参数包含诊断信息，但不包含敏感数据（密码、密钥等）
5. ✅ 使用合适的 HTTP 状态码（503 连接错误，500 查询/事务错误）
6. ✅ 在抛出异常前记录详细日志（包含堆栈和原始错误）
7. ✅ 依赖 @hl8/exceptions 的全局过滤器自动转换为 RFC7807 格式

---

## 8. 配置管理与 @hl8/config 的集成

### 决策：使用 @hl8/config 进行类型安全的配置管理

### 集成方案

**配置类定义**:

```typescript
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * 数据库配置
 *
 * @description 数据库连接和行为的完整配置
 */
export class DatabaseConfig {
  /**
   * 数据库主机
   */
  @IsString()
  host: string = 'localhost';

  /**
   * 数据库端口
   */
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number = 5432;

  /**
   * 数据库名称
   */
  @IsString()
  database: string;

  /**
   * 数据库用户名
   */
  @IsString()
  username: string;

  /**
   * 数据库密码
   */
  @IsString()
  password: string;

  /**
   * 连接池最小连接数
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  poolMin?: number = 5;

  /**
   * 连接池最大连接数
   */
  @IsNumber()
  @Min(1)
  @IsOptional()
  poolMax?: number = 20;

  /**
   * 连接空闲超时（毫秒）
   */
  @IsNumber()
  @Min(1000)
  @IsOptional()
  idleTimeoutMillis?: number = 600000; // 10 分钟

  /**
   * 慢查询阈值（毫秒）
   */
  @IsNumber()
  @Min(100)
  @IsOptional()
  slowQueryThreshold?: number = 1000;

  /**
   * 获取连接字符串
   */
  getConnectionString(): string {
    return `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
  }
}
```

**模块集成**:

```typescript
import { TypedConfigModule } from '@hl8/config';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: DatabaseConfig,
      load: [dotenvLoader()],
    }),
  ],
})
export class DatabaseModule {}
```

### 环境变量映射

```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_saas
DB_USERNAME=postgres
DB_PASSWORD=password
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000
DB_SLOW_QUERY_THRESHOLD=1000
```

### 最佳实践

1. 使用 class-validator 验证配置
2. 提供合理的默认值
3. 敏感信息（密码）从环境变量读取
4. 配置类提供辅助方法（如 getConnectionString()）
5. 所有配置项添加中文注释

---

## 9. 连接池优化策略

### 决策：使用 MikroORM 内置连接池 + 自定义监控

### 配置方案

**连接池配置**:

```typescript
const config: Options = {
  type: 'postgresql',
  clientUrl: dbConfig.getConnectionString(),
  pool: {
    min: dbConfig.poolMin,
    max: dbConfig.poolMax,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    acquireTimeoutMillis: 10000, // 获取连接超时：10秒
    createTimeoutMillis: 5000, // 创建连接超时：5秒
    destroyTimeoutMillis: 5000, // 销毁连接超时：5秒
    reapIntervalMillis: 1000, // 清理空闲连接间隔：1秒
    createRetryIntervalMillis: 200, // 创建失败重试间隔：200ms
  },
};
```

**连接池监控**:

```typescript
@Injectable()
export class ConnectionPoolMonitor {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly logger: Logger,
  ) {
    // 定期检查连接池状态
    setInterval(() => this.checkPoolStatus(), 60000); // 每分钟检查一次
  }

  private async checkPoolStatus(): Promise<void> {
    const driver = (this.em as any).driver;
    const pool = driver.connection.getPool();

    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };

    this.logger.log(`连接池状态: ${JSON.stringify(stats)}`);

    // 警告：如果空闲连接过少
    if (stats.idle < 2 && stats.total >= pool.max) {
      this.logger.warn('连接池接近上限，考虑增加最大连接数');
    }

    // 警告：如果有等待中的请求
    if (stats.waiting > 0) {
      this.logger.warn(`有 ${stats.waiting} 个请求正在等待数据库连接`);
    }
  }

  async getPoolMetrics(): Promise<PoolMetrics> {
    const driver = (this.em as any).driver;
    const pool = driver.connection.getPool();

    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      max: pool.max,
      min: pool.min,
    };
  }
}
```

### 最佳实践

1. 根据应用负载调整连接池大小
2. 设置合理的超时时间避免死锁
3. 定期监控连接池使用情况
4. 记录连接池警告日志
5. 在高负载时自动调整连接池配置

---

## 技术栈总结

### 核心依赖（最终版本）

```json
{
  "dependencies": {
    "@mikro-orm/core": "^6.3.0",
    "@mikro-orm/nestjs": "^6.0.2",
    "@mikro-orm/postgresql": "^6.3.0",
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@hl8/nestjs-fastify": "workspace:*",
    "@hl8/config": "workspace:*",
    "@hl8/exceptions": "workspace:*",
    "@hl8/nestjs-isolation": "workspace:*",
    "@hl8/isolation-model": "workspace:*",
    "nestjs-cls": "^6.0.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.1.6",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.15.3",
    "jest": "^30.2.0",
    "ts-jest": "^29.2.5",
    "typescript": "5.9.2"
  }
}
```

### 开发工具

- **TypeScript 编译器**: tsc 5.9.2
- **快速编译器**: swc (通过 NestJS CLI)
- **测试框架**: Jest 30.2.0
- **代码检查**: ESLint (@repo/eslint-config)
- **包管理器**: pnpm 10.11.0

---

## 风险与缓解

| 风险                                 | 影响 | 缓解措施                                               |
| ------------------------------------ | ---- | ------------------------------------------------------ |
| MikroORM 6.x 与 NestJS 11 兼容性问题 | 中   | 使用官方集成包 @mikro-orm/nestjs，参考官方文档         |
| ES Module 导入实体路径问题           | 中   | 使用编译后的 .js 文件路径，配置 entities 和 entitiesTs |
| nestjs-cls 6.0 API 变更              | 低   | 参考官方迁移指南，测试所有上下文管理功能               |
| 连接池资源耗尽                       | 高   | 实现连接池监控，设置合理的超时和限制                   |
| 多租户数据泄露                       | 高   | 强制隔离检查，使用装饰器确保隔离，记录审计日志         |

---

## 后续行动

✅ **研究完成**，可以进入 Phase 1（设计与契约）：

1. 创建数据模型设计（data-model.md）
2. 生成 API 契约（contracts/）
3. 编写快速开始指南（quickstart.md）
4. 更新 Agent 上下文

---

**研究完成时间**: 2025-10-13  
**下一阶段**: Phase 1 - Design & Contracts
