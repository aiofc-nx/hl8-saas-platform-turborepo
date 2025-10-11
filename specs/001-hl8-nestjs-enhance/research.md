# Research: NestJS 基础设施模块

**Feature**: 001-hl8-nestjs-enhance  
**Package Name**: `@hl8/nestjs-infra`  
**Phase**: 0 - Outline & Research  
**Date**: 2025-10-11

## 研究任务概述

本研究旨在解决从6个独立包整合到1个统一包 `@hl8/nestjs-infra` 的技术决策和最佳实践。

**关键发现**：@hl8/common 包含统一异常处理系统，是基础设施的核心组件，必须优先整合（P0）。

## 1. 统一异常处理系统（P0 - CRITICAL）⭐

### 研究问题

如何实现符合 RFC7807 标准的统一异常处理系统？

### 研究结果

**决策**：采用 NestJS 异常过滤器 + RFC7807 标准响应格式 + 消息提供者模式

**理由**：

1. **标准化**：RFC7807 是 HTTP API 问题详情的标准格式
2. **一致性**：所有异常返回统一的响应结构
3. **可调试性**：提供详细的错误信息和追踪能力
4. **国际化**：通过消息提供者支持多语言错误消息
5. **文档化**：与 Swagger 集成，自动生成 API 错误文档

**技术实现**：

```typescript
// 1. 抽象异常基类
export abstract class AbstractHttpException extends HttpException {
  constructor(
    public readonly errorCode: string,
    public readonly title: string,
    public readonly detail: string,
    public readonly status: number,
    public readonly data?: any,
    public readonly type?: string,
    public readonly rootCause?: Error
  ) {
    super({ errorCode, title, detail, status, data }, status);
    this.name = this.constructor.name;
  }

  toRFC7807(): ProblemDetails {
    return {
      type: this.type || `https://docs.hl8.com/errors#${this.errorCode}`,
      title: this.title,
      detail: this.detail,
      status: this.status,
      instance: this.getRequestId(),
      errorCode: this.errorCode,
      data: this.data,
    };
  }
}

// 2. 通用异常类
export class GeneralNotFoundException extends AbstractHttpException {
  constructor(title: string, detail: string, data?: any) {
    super('NOT_FOUND', title, detail, 404, data);
  }
}

export class GeneralBadRequestException extends AbstractHttpException {
  constructor(title: string, detail: string, data?: any) {
    super('BAD_REQUEST', title, detail, 400, data);
  }
}

// 3. 异常过滤器
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: ILoggerService,
    private readonly messageProvider?: ExceptionMessageProvider
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let problemDetails: ProblemDetails;

    if (exception instanceof AbstractHttpException) {
      problemDetails = exception.toRFC7807();
    } else {
      // 处理未知异常
      problemDetails = {
        type: 'about:blank',
        title: 'Internal Server Error',
        detail: 'An unexpected error occurred',
        status: 500,
        instance: request.id,
      };
    }

    // 记录日志
    this.logger.error('HTTP exception occurred', exception.stack, {
      exception: problemDetails,
      request: {
        id: request.id,
        method: request.method,
        url: request.url,
      },
    });

    response.status(problemDetails.status).send(problemDetails);
  }
}

// 4. 消息提供者
export interface ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, any>
  ): string | undefined;

  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean;
}

// 5. 异常模块
@Module({})
export class ExceptionModule {
  static forRoot(config: ExceptionConfig): DynamicModule {
    return {
      module: ExceptionModule,
      providers: [
        {
          provide: EXCEPTION_CONFIG,
          useValue: config,
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
      exports: [EXCEPTION_CONFIG],
    };
  }
}
```

**RFC7807 响应格式**：

```json
{
  "type": "https://docs.hl8.com/errors#user-not-found",
  "title": "用户未找到",
  "detail": "ID 为 \"user-123\" 的用户不存在",
  "status": 404,
  "instance": "req-456",
  "errorCode": "USER_NOT_FOUND",
  "data": {
    "userId": "user-123"
  }
}
```

**与其他模块的集成**：

- **logging**：异常自动记录到日志
- **isolation**：异常包含租户上下文信息
- **swagger**：自动生成 API 错误文档

**替代方案考虑**：

- ❌ 使用 NestJS 内置异常：缺少标准化格式
- ❌ 自定义错误格式：不符合 RFC7807 标准
- ❌ 不统一处理：错误格式不一致，用户体验差

**参考资源**：

- [RFC7807 规范](https://tools.ietf.org/html/rfc7807)
- [NestJS 异常过滤器](https://docs.nestjs.com/exception-filters)
- 旧代码：`backup/common/src/exceptions/`

---

## 2. CommonJS 到 NodeNext 迁移策略

### 研究问题

如何将使用 CommonJS 的旧代码迁移到 NodeNext ES 模块系统？

### 研究结果

**决策**：使用渐进式迁移策略，逐模块转换

**理由**：

1. **最小化风险**：每次迁移一个模块，便于测试和回滚
2. **保持向后兼容**：导出的 API 保持兼容，内部实现升级
3. **利用工具链**：tsc + swc 提供类型检查和快速编译

**迁移步骤**：

1. **更新 package.json**：

   ```json
   {
     "type": "module",
     "engines": {
       "node": ">=20"
     }
   }
   ```

2. **更新 tsconfig.json**：

   ```json
   {
     "extends": "@repo/ts-config/nestjs.json",
     "compilerOptions": {
       "module": "NodeNext",
       "moduleResolution": "NodeNext"
     }
   }
   ```

3. **转换导入导出语法**：
   - `require()` → `import`
   - `module.exports` → `export`
   - 添加 `.js` 扩展名（TypeScript 编译后）

4. **更新测试配置**：
   - Jest 配置支持 ES 模块
   - 使用 `ts-jest` 或 `@swc/jest`

**替代方案**：

- ❌ 保留 CommonJS：违反宪章要求，技术债务持续
- ❌ 一次性全部迁移：风险高，难以调试

**参考资源**：

- [Node.js ESM 文档](https://nodejs.org/api/esm.html)
- [TypeScript NodeNext 配置](https://www.typescriptlang.org/tsconfig#moduleResolution)
- 项目文档：`docs/ts-config.md`

---

## 2. 功能模块化设计模式

### 研究问题

基础设施库应该采用什么样的代码组织方式？

### 研究结果

**决策**：采用功能导向的模块化设计，每个功能独立组织

**理由**：

1. **高内聚低耦合**：每个功能模块包含该功能的所有代码
2. **按需导入**：用户可以只导入需要的功能模块
3. **便于维护**：功能边界清晰，修改影响范围小
4. **业界标准**：@nestjs/*、express、fastify 都采用此模式

**模块结构**：

```
功能模块/
├── module.ts          # NestJS 模块定义
├── service.ts         # 核心服务
├── service.spec.ts    # 单元测试
├── decorators/        # 装饰器
├── types/             # 类型定义
└── utils/             # 工具函数
```

**模块间通信**：

- 通过明确的接口（interface）
- 最小化模块间依赖
- 避免循环依赖

**替代方案考虑**：

- ❌ Clean Architecture 分层：增加不必要的抽象，不符合基础设施库特点
- ❌ 单一大文件：难以维护，违反单一职责原则
- ❌ 按技术分层（services/、controllers/、models/）：功能分散，不利于维护

**参考资源**：

- [@nestjs/common 源码](https://github.com/nestjs/nest/tree/master/packages/common)
- [Express 源码结构](https://github.com/expressjs/express)
- [Fastify 源码结构](https://github.com/fastify/fastify)

---

## 3. NestJS 模块系统集成

### 研究问题

如何确保整合后的包完全兼容 NestJS 模块系统？

### 研究结果

**决策**：每个功能模块提供独立的 NestJS Module，支持动态配置

**理由**：

1. **符合 NestJS 最佳实践**：利用 NestJS 的依赖注入和模块化
2. **灵活配置**：支持 `forRoot()`、`forRootAsync()` 等配置方式
3. **可选导入**：用户只导入需要的功能模块
4. **易于测试**：每个模块可独立测试

**模块导出模式**：

```typescript
// 主入口 index.ts
export * from './caching/cache.module';
export * from './configuration/typed-config.module';
export * from './logging/logger.module';
export * from './isolation/isolation.module';
export * from './fastify/fastify.module';
export * from './shared';

// 模块定义示例
@Module({})
export class CachingModule {
  static forRoot(options: CachingModuleOptions): DynamicModule {
    return {
      module: CachingModule,
      providers: [
        {
          provide: CACHING_MODULE_OPTIONS,
          useValue: options,
        },
        CacheService,
        RedisService,
      ],
      exports: [CacheService],
    };
  }

  static forRootAsync(options: CachingModuleAsyncOptions): DynamicModule {
    // 支持异步配置
  }
}
```

**配置注入策略**：

- 使用 `InjectionToken` 提供配置
- 支持环境变量覆盖
- 提供默认配置

**替代方案考虑**：

- ❌ 单一大模块：不灵活，用户必须导入所有功能
- ❌ 非模块化导出：不利用 NestJS 的依赖注入能力

**参考资源**：

- [NestJS 动态模块文档](https://docs.nestjs.com/modules#dynamic-modules)
- [NestJS ConfigModule 源码](https://github.com/nestjs/config)
- [@nestjs/passport 源码](https://github.com/nestjs/passport)

---

## 4. 多租户上下文管理

### 研究问题

如何在请求生命周期内管理租户隔离上下文？

### 研究结果

**决策**：使用 nestjs-cls 库实现基于 AsyncLocalStorage 的上下文管理

**理由**：

1. **透明传递**：上下文在整个异步调用链中自动传递
2. **无需手动传参**：避免在每个函数中传递 tenantId
3. **性能优良**：基于 Node.js 原生 AsyncLocalStorage API
4. **社区认可**：nestjs-cls 是 NestJS 生态中的成熟方案

**技术实现**：

```typescript
// 上下文存储
import { ClsService } from 'nestjs-cls';

@Injectable()
export class IsolationContextService {
  constructor(private readonly cls: ClsService) {}

  setIsolationContext(context: IsolationContext): void {
    this.cls.set('isolationContext', context);
  }

  getIsolationContext(): IsolationContext {
    return this.cls.get('isolationContext');
  }

  getTenantId(): string {
    return this.getIsolationContext()?.tenantId;
  }
}

// 中间件提取租户信息
@Injectable()
export class IsolationExtractionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];
    const orgId = req.headers['x-organization-id'];
    const deptId = req.headers['x-department-id'];
    
    const context = new IsolationContext(tenantId, orgId, deptId);
    this.tenantContextService.setIsolationContext(context);
    
    next();
  }
}
```

**多层级隔离支持**：

- 平台级：无租户标识
- 租户级：tenantId
- 组织级：tenantId + organizationId
- 部门级：tenantId + organizationId + departmentId
- 用户级：上述 + userId

**替代方案考虑**：

- ❌ 请求作用域依赖注入：性能开销大，不适合高并发场景
- ❌ 手动传参：代码侵入性强，易出错
- ❌ 全局变量：多请求并发时会相互干扰

**参考资源**：

- [nestjs-cls 文档](https://github.com/Papooch/nestjs-cls)
- [Node.js AsyncLocalStorage 文档](https://nodejs.org/api/async_context.html#class-asynclocalstorage)
- 旧代码：`backup/isolation/src/lib/services/tenant-context.service.ts`

---

## 5. Redis 缓存与租户隔离

### 研究问题

如何实现租户隔离的 Redis 缓存？

### 研究结果

**决策**：使用命名空间前缀实现租户隔离，支持装饰器和服务两种使用方式

**理由**：

1. **逻辑隔离**：通过键前缀隔离不同租户的缓存数据
2. **性能优良**：Redis 原生支持键前缀过滤
3. **易于管理**：可批量删除特定租户的缓存
4. **灵活使用**：支持装饰器（声明式）和服务（编程式）

**技术实现**：

```typescript
// 缓存键生成策略
class CacheKeyGenerator {
  generate(
    namespace: string,
    key: string,
    isolationContext: IsolationContext
  ): string {
    const parts = ['hl8', 'cache'];
    
    if (isolationContext.tenantId) {
      parts.push(`tenant:${isolationContext.tenantId}`);
    }
    
    if (isolationContext.organizationId) {
      parts.push(`org:${isolationContext.organizationId}`);
    }
    
    if (isolationContext.departmentId) {
      parts.push(`dept:${isolationContext.departmentId}`);
    }
    
    parts.push(namespace, key);
    
    return parts.join(':');
    // 例如: hl8:cache:tenant:abc:org:123:user:john
  }
}

// 装饰器使用
@Cacheable('user', 3600)
async getUser(userId: string): Promise<User> {
  // 自动使用当前租户上下文生成缓存键
  return this.userRepository.findById(userId);
}

// 服务使用
await this.cacheService.set('user', userId, user, 3600);
```

**缓存失效策略**：

- TTL：时间过期自动失效
- 手动失效：@CacheEvict 装饰器或 service.del()
- 批量失效：按平台/租户/组织/部门批量清除

**5个隔离层级的缓存键设计**：

| 层级 | 隔离标识 | 缓存键格式 | 示例 |
|------|---------|-----------|------|
| 平台级 | 无 | `hl8:cache:platform:{namespace}:{key}` | `hl8:cache:platform:promotion:banner-1` |
| 租户级 | tenantId | `hl8:cache:tenant:{tid}:{namespace}:{key}` | `hl8:cache:tenant:t123:config` |
| 组织级 | + orgId | `hl8:cache:tenant:{tid}:org:{oid}:{namespace}:{key}` | `hl8:cache:tenant:t123:org:o456:members` |
| 部门级 | + deptId | `hl8:cache:tenant:{tid}:org:{oid}:dept:{did}:{namespace}:{key}` | `hl8:cache:tenant:t123:org:o456:dept:d789:tasks` |
| 用户级 | userId | `hl8:cache:user:{uid}:{namespace}:{key}` | `hl8:cache:user:u999:preferences` |

**平台级数据缓存示例**：

```typescript
// 平台管理后台 - 推广横幅缓存
class PlatformPromotionService {
  // 无租户上下文，生成平台级缓存键：hl8:cache:platform:promotion:banners
  @Cacheable('promotion', 3600)
  async getBanners(): Promise<Banner[]> {
    return this.bannerRepository.findAll();
  }
  
  // 平台运营数据
  @Cacheable('analytics', 600)
  async getPlatformStats(): Promise<PlatformStats> {
    return {
      totalTenants: await this.tenantRepository.count(),
      totalUsers: await this.userRepository.count(),
      activeToday: await this.getActiveUsersToday(),
    };
  }
}
```

**重要说明**：

- ✅ **平台级数据的识别**：隔离上下文为空或所有标识符为 undefined
- ✅ **安全控制**：只有平台管理员可以访问平台级缓存
- ✅ **跨租户共享**：平台级数据对所有租户可见（如系统配置、公告）
- ✅ **运营数据**：平台的运营、推广、统计数据都是平台级

**替代方案考虑**：

- ❌ 多个 Redis 实例：成本高，管理复杂
- ❌ 数据库字段标记：性能差，不适合缓存场景
- ❌ 不隔离：数据泄露风险

**参考资源**：

- [ioredis 文档](https://github.com/redis/ioredis)
- [Redis 键命名最佳实践](https://redis.io/docs/management/optimization/keys/)
- 旧代码：`backup/cache/src/lib/cache.service.ts`

---

## 6. 类型安全的配置管理

### 研究问题

如何实现完全类型安全的配置管理？

### 研究结果

**决策**：基于 class-validator 和 class-transformer 实现类型安全配置

**理由**：

1. **编译时类型检查**：TypeScript 完整的类型推断
2. **运行时验证**：class-validator 确保配置正确性
3. **自动转换**：class-transformer 自动转换类型
4. **IDE 支持**：完整的自动补全和类型提示

**技术实现**：

```typescript
// 配置类定义
export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  host!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  port!: number;

  @IsString()
  @IsOptional()
  password?: string;
}

export class AppConfig {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  database!: DatabaseConfig;

  @IsString()
  @IsNotEmpty()
  appName!: string;
}

// 模块配置
TypedConfigModule.forRoot({
  schema: AppConfig,
  load: [
    fileLoader({ path: './config/app.yml' }),
    dotenvLoader({ separator: '__' })
  ],
  validate: true,
  validateOptions: {
    whitelist: true,
    forbidNonWhitelisted: true,
  }
})

// 使用配置（完全类型安全）
@Injectable()
export class SomeService {
  constructor(private readonly config: AppConfig) {}

  connect() {
    // 完整的类型推断和自动补全
    console.log(this.config.database.host);
    console.log(this.config.database.port);
  }
}
```

**支持的配置格式**：

- .env 文件
- JSON 文件
- YAML 文件
- 远程配置服务
- 环境变量覆盖

**配置加载顺序**：

1. 默认配置（代码中定义）
2. 配置文件（app.yml）
3. 环境特定配置（app.dev.yml）
4. 环境变量（最高优先级）

**替代方案考虑**：

- ❌ @nestjs/config：类型安全性不足
- ❌ 直接使用 process.env：无类型检查，易出错
- ❌ JSON Schema 验证：不如 class-validator 灵活

**参考资源**：

- [class-validator 文档](https://github.com/typestack/class-validator)
- [class-transformer 文档](https://github.com/typestack/class-transformer)
- 旧代码：`backup/config/src/lib/typed-config.module.ts`

---

## 7. Pino 日志集成

### 研究问题

如何集成高性能的结构化日志系统？

### 研究结果

**决策**：使用 Pino 作为日志库，集成租户上下文和 Fastify

**理由**：

1. **高性能**：Pino 是 Node.js 生态中最快的日志库
2. **结构化日志**：JSON 格式，便于日志聚合和分析
3. **Fastify 原生支持**：Fastify 默认使用 Pino
4. **上下文绑定**：支持绑定租户上下文到日志

**技术实现**：

```typescript
// Logger 服务
@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor(
    private readonly tenantContext: IsolationContextService
  ) {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  log(message: string, context?: any) {
    const isolationContext = this.tenantContext.getIsolationContext();
    
    this.logger.info({
      message,
      tenantId: isolationContext?.tenantId,
      organizationId: isolationContext?.organizationId,
      departmentId: isolationContext?.departmentId,
      ...context,
    });
  }

  error(message: string, trace?: string, context?: any) {
    const isolationContext = this.tenantContext.getIsolationContext();
    
    this.logger.error({
      message,
      trace,
      tenantId: isolationContext?.tenantId,
      organizationId: isolationContext?.organizationId,
      departmentId: isolationContext?.departmentId,
      ...context,
    });
  }
}

// Fastify 集成
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    logger: pino({
      level: 'info',
    }),
  })
);
```

**日志级别**：

- error：错误信息
- warn：警告信息
- info：常规信息
- debug：调试信息
- trace：跟踪信息

**日志字段标准**：

- timestamp：时间戳
- level：日志级别
- message：日志消息
- tenantId：租户 ID
- organizationId：组织 ID
- departmentId：部门 ID
- userId：用户 ID
- requestId：请求 ID
- context：额外上下文

**替代方案考虑**：

- ❌ Winston：性能较差
- ❌ Bunyan：不再积极维护
- ❌ 自定义日志：重复造轮子

**参考资源**：

- [Pino 文档](https://github.com/pinojs/pino)
- [NestJS Pino 集成](https://github.com/iamolegga/nestjs-pino)
- 旧代码：`backup/logger/src/lib/logger.service.ts`

---

## 8. Fastify 企业级适配器

### 研究问题

如何为 NestJS 提供企业级的 Fastify 适配器？

### 研究结果

**决策**：扩展 @nestjs/platform-fastify，整合所有企业级功能到单一适配器（CORS、限流、熔断、安全、监控）

**理由**：

1. **高性能**：Fastify 比 Express 快约 2倍
2. **Schema 验证**：内置 JSON Schema 验证
3. **企业需求**：需要限流、熔断、安全等企业级功能
4. **简化设计**：只提供一个适配器，所有功能整合，避免用户选择困难

**设计简化**：

- ❌ 移除 core-fastify.adapter.ts（冗余）
- ❌ 移除独立的 plugins/ 目录（CORS 等直接集成到适配器）
- ✅ 只保留 enterprise-fastify.adapter.ts（整合所有功能）
- ✅ 所有企业功能默认启用，可通过配置禁用

**技术实现**：

```typescript
// 企业级适配器（整合所有功能）
export class EnterpriseFastifyAdapter extends FastifyAdapter {
  constructor(options?: EnterpriseFastifyAdapterOptions) {
    super(options?.fastifyOptions);
    
    // 1. CORS 支持（直接集成，不需要独立 plugin）
    if (options?.enableCors !== false) {
      this.enableCors(options?.corsOptions);
    }
    
    // 2. 限流（直接集成）
    if (options?.enableRateLimit) {
      this.registerRateLimit(options?.rateLimitOptions);
    }
    
    // 3. 熔断器（直接集成）
    if (options?.enableCircuitBreaker) {
      this.registerCircuitBreaker(options?.circuitBreakerOptions);
    }
    
    // 4. 安全头（直接集成）
    if (options?.enableSecurity !== false) {
      this.registerSecurity(options?.securityOptions);
    }
  }

  // 性能监控
  async enablePerformanceMonitoring() {
    this.getInstance().addHook('onRequest', async (request, reply) => {
      request.startTime = Date.now();
    });

    this.getInstance().addHook('onResponse', async (request, reply) => {
      const duration = Date.now() - request.startTime;
      this.logger.log({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration,
      });
    });
  }

  // 健康检查
  registerHealthCheck() {
    this.getInstance().get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    });
  }
}
```

**企业级功能**：

1. **限流中间件**：
   - 基于 IP 的限流
   - 基于租户的限流
   - 基于 API Key 的限流

2. **熔断器**：
   - 自动检测故障
   - 快速失败
   - 自动恢复

3. **安全中间件**：
   - Helmet（安全头）
   - CSRF 保护
   - XSS 过滤
   - SQL 注入防护

4. **性能监控**：
   - 请求响应时间
   - 吞吐量统计
   - 错误率监控

**替代方案考虑**：

- ❌ 继续使用 Express：性能较差
- ❌ 直接使用 Fastify：失去 NestJS 的模块化能力
- ❌ 不添加企业功能：不满足生产环境需求

**参考资源**：

- [Fastify 文档](https://www.fastify.io/)
- [@nestjs/platform-fastify 源码](https://github.com/nestjs/nest/tree/master/packages/platform-fastify)
- 旧代码：`backup/fastify-pro/src/lib/adapters/enterprise-fastify.adapter.ts`

---

## 9. 测试策略

### 研究问题

如何确保整合后的代码质量？

### 研究结果

**决策**：采用单元测试 + 集成测试的组合策略，目标覆盖率 ≥ 80%

**理由**：

1. **快速反馈**：单元测试快速发现问题
2. **全面验证**：集成测试验证模块间协作
3. **回归保护**：防止破坏现有功能
4. **文档作用**：测试用例展示使用方式

**测试层次**：

1. **单元测试**（与源代码同目录）：

   ```
   cache.service.ts
   cache.service.spec.ts  # 单元测试
   ```

   - 测试单个类/函数
   - 使用 Mock 隔离依赖
   - 快速执行（毫秒级）

2. **集成测试**（**tests**/ 目录）：

   ```
   __tests__/
   ├── caching/
   │   └── cache-integration.spec.ts
   ├── isolation/
   │   └── isolation-integration.spec.ts
   ```

   - 测试模块间协作
   - 使用真实依赖（TestingModule）
   - 验证完整流程

**测试工具链**：

- Jest：测试框架
- @nestjs/testing：NestJS 测试工具
- @swc/jest：快速编译
- ioredis-mock：Redis Mock

**测试规范**：

```typescript
// 单元测试示例
describe('CacheService', () => {
  let service: CacheService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    service = new CacheService(redisService);
  });

  it('应当正确设置缓存', async () => {
    await service.set('key', 'value', 3600);
    
    expect(redisService.set).toHaveBeenCalledWith(
      'key',
      'value',
      'EX',
      3600
    );
  });
});

// 集成测试示例
describe('Caching Integration', () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    cacheService = module.get(CacheService);
  });

  it('应当支持租户隔离缓存', async () => {
    // 完整的集成测试逻辑
  });

  afterEach(async () => {
    await app.close();
  });
});
```

**覆盖率要求**：

- 核心服务：≥ 90%
- 工具函数：≥ 80%
- 装饰器：≥ 80%
- 集成测试：所有关键流程

**CI/CD 集成**：

- PR 自动运行测试
- 覆盖率报告
- 测试失败阻止合并

**替代方案考虑**：

- ❌ 只写单元测试：无法发现集成问题
- ❌ 只写集成测试：执行慢，难以定位问题
- ❌ 手动测试：不可靠，无法回归

**参考资源**：

- [Jest 文档](https://jestjs.io/)
- [NestJS 测试文档](https://docs.nestjs.com/fundamentals/testing)
- 旧代码：`backup/*/src/**/*.spec.ts`

---

## 10. 数据共享控制字段设计

### 研究问题

如何设计灵活的数据共享控制机制？

### 研究结果

**决策**：为每条数据添加 `isShared`、`sharingLevel`、`sharedWith` 字段

**理由**：

1. **灵活性**：同一层级的数据可以有不同的共享策略
2. **动态控制**：可以在运行时改变数据的共享状态
3. **精细控制**：支持精确到对象的共享（sharedWith 字段）
4. **业务需求**：满足复杂的共享场景（工单上报、最佳实践分享、跨部门协作）
5. **未来扩展**：为高级功能预留空间（时间范围共享、条件共享、审批流）

**技术实现**：

```typescript
/**
 * 基础数据模型（所有业务实体的推荐基类）
 */
export interface BaseDataModel {
  // 隔离字段（定义数据归属）
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
  
  // 共享控制字段 ⭐
  isShared: boolean;              // 是否共享（默认 false）
  sharingLevel?: DataSharingLevel; // 共享级别
  sharedWith?: string[];          // 精确共享对象列表
  
  createdAt: Date;
  updatedAt: Date;
}

// 共享级别枚举
export enum DataSharingLevel {
  PLATFORM = 'platform',      // 平台级共享（所有租户可见）
  TENANT = 'tenant',          // 租户级共享
  ORGANIZATION = 'organization', // 组织级共享
  DEPARTMENT = 'department',  // 部门级共享
  PRIVATE = 'private',        // 私有（不共享）
}
```

**典型业务场景**：

**场景1：租户工单上报到平台**

```typescript
// 租户提交工单，平台客服需要看到
const supportTicket = {
  id: 'ticket-001',
  title: '功能异常',
  
  // 数据归属：租户级（租户创建的）
  tenantId: 'tenant-123',
  userId: 'user-456',
  
  // 共享控制：共享到平台 ⭐
  isShared: true,
  sharingLevel: DataSharingLevel.PLATFORM,
  
  // 结果：租户数据，但平台客服可见
};
```

**场景2：部门最佳实践分享到租户**

```typescript
// 部门发现的最佳实践，希望全租户学习
const bestPractice = {
  id: 'practice-001',
  title: '高效销售话术',
  
  // 数据归属：部门级（部门创建的）
  tenantId: 'tenant-123',
  organizationId: 'org-456',
  departmentId: 'dept-789',
  userId: 'user-001',
  
  // 共享控制：共享到租户 ⭐
  isShared: true,
  sharingLevel: DataSharingLevel.TENANT,
  
  // 结果：部门数据，但整个租户可见
};
```

**场景3：跨部门文档协作**

```typescript
// 文档共享给特定的几个部门
const collaborationDoc = {
  id: 'doc-001',
  title: '跨部门项目方案',
  
  // 数据归属：部门级
  tenantId: 'tenant-123',
  organizationId: 'org-456',
  departmentId: 'dept-sales',
  userId: 'user-001',
  
  // 共享控制：精确共享 ⭐
  isShared: true,
  sharingLevel: DataSharingLevel.ORGANIZATION, // 基础共享级别
  sharedWith: ['dept-marketing', 'dept-product'], // 精确共享给这两个部门
  
  // 结果：销售部门的文档，市场部和产品部也能看到
};
```

**场景4：临时文档（不共享）**

```typescript
// 用户的草稿，不共享
const draft = {
  id: 'draft-001',
  title: '未完成的报告',
  
  // 数据归属：用户级
  userId: 'user-001',
  
  // 共享控制：不共享 ⭐
  isShared: false,
  sharingLevel: DataSharingLevel.PRIVATE,
  
  // 结果：仅用户本人可见
};
```

**数据库查询示例**：

```typescript
// 查询用户可见的公告
async findVisibleAnnouncements(context: IsolationContext): Promise<Announcement[]> {
  const conditions = [];
  
  // 1. 本层级的所有数据（不共享的也能看到）
  if (context.departmentId) {
    conditions.push({
      departmentId: context.departmentId,
    });
  }
  
  // 2. 共享到本层级的数据
  if (context.organizationId) {
    conditions.push({
      isShared: true,
      sharingLevel: DataSharingLevel.ORGANIZATION,
      organizationId: context.organizationId,
    });
  }
  
  // 3. 共享到租户的数据
  if (context.tenantId) {
    conditions.push({
      isShared: true,
      sharingLevel: DataSharingLevel.TENANT,
      tenantId: context.tenantId,
    });
  }
  
  return this.repository.find({ $or: conditions });
}
```

**未来扩展可能性**：

1. ✅ **时间范围共享**：

   ```typescript
   interface TemporalSharing {
     isShared: true;
     sharingLevel: DataSharingLevel.ORGANIZATION;
     sharedFrom: Date;  // 共享开始时间
     sharedUntil: Date; // 共享结束时间
   }
   ```

2. ✅ **条件共享**：

   ```typescript
   interface ConditionalSharing {
     isShared: true;
     sharingLevel: DataSharingLevel.TENANT;
     sharingCondition: 'AFTER_APPROVAL' | 'AFTER_REVIEW';
   }
   ```

3. ✅ **审批流共享**：

   ```typescript
   interface ApprovalSharing {
     isShared: true;
     sharingLevel: DataSharingLevel.PLATFORM;
     requiresApproval: true;
     approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
   }
   ```

**替代方案考虑**：

- ❌ 只依赖隔离级别：不够灵活，无法支持向上共享
- ❌ 不使用 isShared 字段：每次都要判断 sharingLevel，逻辑复杂
- ❌ 不支持 sharedWith：无法实现精确共享
- ✅ **当前方案**：虽然字段多一些，但提供最大的灵活性和扩展性

**参考资源**：

- [Google Drive 共享机制](https://support.google.com/drive/answer/2494822)
- [Notion 权限系统](https://www.notion.so/help/sharing-and-permissions)
- [Microsoft SharePoint 权限模型](https://learn.microsoft.com/en-us/sharepoint/understanding-permission-levels)

---

## 11. 向后兼容性策略

### 研究问题

如何确保整合后的 API 向后兼容？

### 研究结果

**决策**：保持核心 API 向后兼容，逐步废弃旧 API

**理由**：

1. **平滑迁移**：现有使用旧包的代码可以无缝迁移
2. **降低风险**：避免破坏性变更导致的问题
3. **给予缓冲期**：开发者有时间适应新 API

**兼容策略**：

1. **导出别名**：

   ```typescript
   // 新API
   export { CachingModule } from './caching/cache.module';
   
   // 向后兼容（带 @deprecated）
   /**
    * @deprecated 使用 CachingModule 代替
    */
   export { CachingModule as CacheModule } from './caching/cache.module';
   ```

2. **适配器模式**：

   ```typescript
   // 旧 API
   class OldCacheService {
     /**
      * @deprecated 使用 CacheService.set() 代替
      */
     async cache(key: string, value: any): Promise<void> {
       return this.newCacheService.set(key, value);
     }
   }
   ```

3. **版本标记**：

   ```typescript
   /**
    * @since v2.0.0
    * @deprecated v2.1.0 - 将在 v3.0.0 移除，使用 xxx 代替
    */
   ```

**废弃流程**：

1. v2.0.0：新 API 发布，旧 API 标记为 @deprecated
2. v2.x：旧 API 继续支持，文档推荐新 API
3. v3.0.0：移除旧 API（主版本升级）

**迁移指南**：

- 提供详细的迁移文档
- 示例代码对照
- 自动化迁移脚本（可选）

**替代方案考虑**：

- ❌ 完全破坏性变更：影响现有用户
- ❌ 永久保留旧 API：增加维护负担
- ❌ 不提供兼容：迁移成本高

**参考资源**：

- [Semantic Versioning](https://semver.org/)
- [NestJS 版本策略](https://docs.nestjs.com/migration-guide)

---

## 总结

### 关键技术决策

| 决策领域 | 选择方案 | 替代方案 | 优先级 |
|---------|---------|---------|--------|
| **异常处理** | **RFC7807 + 异常过滤器 + 消息提供者** | NestJS 内置、自定义格式 | **P0 ⭐** |
| 模块系统 | NodeNext ES Modules | CommonJS（旧） | P0 |
| 代码组织 | 功能导向 | Clean Architecture 分层 | P0 |
| **数据共享控制** ⭐ | **isShared + sharingLevel + sharedWith** | 仅依赖隔离级别 | **架构决策** |
| 上下文管理 | nestjs-cls (AsyncLocalStorage) | 请求作用域注入、手动传参 | P1 |
| 缓存隔离 | Redis 键前缀 + 平台级支持 | 多实例、数据库 | P1 |
| 配置管理 | class-validator + class-transformer | @nestjs/config、process.env | P1 |
| 日志系统 | Pino | Winston、Bunyan | P1 |
| HTTP 服务器 | Fastify 企业级适配器（单一） | Express、多个适配器 | P1 |
| 测试策略 | 单元 + 集成测试 | 只单元、只集成、手动 | P1 |

**P0 优先级说明**：

- **异常处理**：所有模块的基础依赖，必须首先实现
- **模块系统**：宪章要求，全局架构决策
- **代码组织**：影响整体结构，必须首先确定

### 未解决的问题

**无**：所有技术决策已明确，可以进入 Phase 1 设计阶段。

### 后续行动

1. ✅ Phase 0 完成：所有研究任务完成
2. ⏳ Phase 1 开始：创建 data-model.md、contracts/、quickstart.md
3. ⏳ Phase 2：使用 /speckit.tasks 创建任务列表

---

**研究完成日期**：2025-10-11  
**审核状态**：✅ 通过  
**下一步**：Phase 1 - Design & Contracts
