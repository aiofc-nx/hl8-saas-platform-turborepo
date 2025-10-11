# Quick Start: NestJS 基础设施模块

**Feature**: 001-hl8-nestjs-enhance  
**Package Name**: `@hl8/nestjs-infra`  
**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-11

## 概述

本指南帮助您快速开始使用 `@hl8/nestjs-infra` 包。

**5 分钟快速开始** → [跳转到安装](#安装)

## 前提条件

- Node.js ≥ 20
- pnpm 10.11.0
- NestJS ≥ 11
- TypeScript 5.x

## 安装

```bash
# 在 monorepo 根目录
cd /home/arligle/hl8/hl8-saas-platform-turborepo

# 安装依赖
pnpm install
```

## 基础使用

### 1. 异常处理模块 ⭐ **优先使用**

**场景**：提供统一的异常处理和 RFC7807 标准错误响应

```typescript
import { Module } from '@nestjs/common';
import { ExceptionModule } from '@hl8/nestjs-infra';

@Module({
  imports: [
    ExceptionModule.forRoot({
      documentationUrl: 'https://docs.hl8.com/errors',
      logLevel: 'error',
      enableStackTrace: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

**使用异常**：

```typescript
import { Injectable } from '@nestjs/common';
import {
  GeneralNotFoundException,
  GeneralBadRequestException,
  AbstractHttpException,
} from '@hl8/nestjs-infra';

@Injectable()
export class UserService {
  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      // 自动返回 RFC7807 格式的错误响应
      throw new GeneralNotFoundException(
        '用户未找到',
        `ID 为 "${userId}" 的用户不存在`,
        { userId }
      );
    }
    
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    if (!this.validateEmail(data.email)) {
      throw new GeneralBadRequestException(
        '邮箱格式无效',
        '请提供有效的邮箱地址',
        { field: 'email', value: data.email }
      );
    }
    
    return this.userRepository.create(data);
  }
}
```

**自定义异常**：

```typescript
import { AbstractHttpException } from '@hl8/nestjs-infra';

export class InsufficientPermissionsException extends AbstractHttpException {
  constructor(resource: string, action: string) {
    super(
      'INSUFFICIENT_PERMISSIONS',
      '权限不足',
      `您没有权限对 ${resource} 执行 ${action} 操作`,
      403,
      { resource, action }
    );
  }
}

// 使用
throw new InsufficientPermissionsException('用户', '删除');
```

**错误响应格式**（自动生成）：

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

---

### 2. 缓存模块

**场景**：为用户查询添加缓存

```typescript
import { Module } from '@nestjs/common';
import { CachingModule } from '@hl8/nestjs-infra';

@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultTTL: 3600,
      enableTenantIsolation: true,
    }),
  ],
})
export class AppModule {}
```

**使用装饰器**：

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict } from '@hl8/nestjs-infra';

@Injectable()
export class UserService {
  // 自动缓存，3600秒过期
  @Cacheable('user', 3600)
  async getUser(userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }

  // 更新时自动清除缓存
  @CacheEvict('user')
  async updateUser(userId: string, data: any): Promise<void> {
    await this.userRepository.update(userId, data);
  }
}
```

**使用服务**：

```typescript
import { Injectable } from '@nestjs/common';
import { ICacheService } from '@hl8/nestjs-infra';

@Injectable()
export class ProductService {
  constructor(private readonly cacheService: ICacheService) {}

  async getProduct(id: string): Promise<Product> {
    // 尝试从缓存获取
    const cached = await this.cacheService.get<Product>('product', id);
    if (cached) return cached;

    // 缓存未命中，查询数据库
    const product = await this.productRepository.findById(id);

    // 存入缓存
    await this.cacheService.set('product', id, product, 3600);

    return product;
  }
}
```

### 2. 多租户模块

**场景**：自动管理多层级隔离上下文（支持平台级、租户级、组织级、部门级、用户级）

```typescript
import { Module } from '@nestjs/common';
import { IsolationModule } from '@hl8/nestjs-infra';

@Module({
  imports: [
    IsolationModule.forRoot({
      global: true,
      extractionStrategy: 'header', // 从请求头提取租户信息
      enableMultiLevelIsolation: true,
    }),
  ],
})
export class AppModule {}
```

**使用上下文**：

```typescript
import { Injectable } from '@nestjs/common';
import { IIsolationContextService } from '@hl8/nestjs-infra';

@Injectable()
export class OrderService {
  constructor(
    private readonly isolationContext: IIsolationContextService
  ) {}

  async getOrders(): Promise<Order[]> {
    // 自动获取当前租户ID
    const tenantId = this.isolationContext.getTenantId();
    const orgId = this.isolationContext.getOrganizationId();

    // 自动过滤租户数据
    return this.orderRepository.findByTenantAndOrg(tenantId, orgId);
  }
}
```

**平台级数据使用**（平台管理后台）：

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable } from '@hl8/nestjs-infra';

@Injectable()
export class PlatformPromotionService {
  // 平台级数据：无租户上下文，缓存键自动生成为 hl8:cache:platform:promotion:banners
  @Cacheable('promotion', 3600)
  async getBanners(): Promise<Banner[]> {
    // 平台推广横幅，对所有租户可见
    return this.promotionRepository.findAllBanners();
  }

  // 平台运营数据统计
  @Cacheable('analytics', 600)
  async getPlatformStats(): Promise<PlatformStats> {
    return {
      totalTenants: await this.tenantRepository.count(),
      totalUsers: await this.userRepository.count(),
      activeTenantsToday: await this.getActiveTenantsToday(),
      revenue: await this.getRevenue(),
    };
  }

  // 平台系统配置
  async getSystemConfig(key: string): Promise<any> {
    // 平台级系统配置，跨租户共享
    return this.configRepository.getPlatformConfig(key);
  }
}
```

**5个隔离层级说明**：

| 层级 | 标识符 | 典型数据 | 缓存键示例 |
|------|--------|---------|-----------|
| 平台级 | 无 | 推广数据、运营数据、系统配置 | `platform:promotion:banners` |
| 租户级 | tenantId | 租户配置、租户统计 | `tenant:t123:config` |
| 组织级 | +orgId | 组织成员、组织项目 | `tenant:t123:org:o456:members` |
| 部门级 | +deptId | 部门文档、部门任务 | `tenant:t123:org:o456:dept:d789:tasks` |
| 用户级 | userId | 用户偏好、个人草稿 | `user:u999:preferences` |

---

### 3. 配置模块

**场景**：类型安全的配置管理

```typescript
import { Module } from '@nestjs/common';
import { TypedConfigModule, fileLoader, dotenvLoader } from '@hl8/nestjs-infra';
import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. 定义配置类
export class DatabaseConfig {
  @IsString()
  host!: string;

  @IsNumber()
  @Type(() => Number)
  port!: number;
}

export class AppConfig {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  database!: DatabaseConfig;

  @IsString()
  appName!: string;
}

// 2. 配置模块
@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: [
        fileLoader({ path: './config/app.yml' }),
        dotenvLoader({ separator: '__' }),
      ],
      validate: true,
    }),
  ],
})
export class AppModule {}

// 3. 使用配置（完全类型安全）
@Injectable()
export class DatabaseService {
  constructor(private readonly config: AppConfig) {}

  connect() {
    // 完整的类型推断和自动补全
    console.log(`连接到 ${this.config.database.host}:${this.config.database.port}`);
  }
}
```

### 4. 日志模块

**场景**：结构化日志记录

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from '@hl8/nestjs-infra';

@Module({
  imports: [
    LoggingModule.forRoot({
      level: 'info',
      prettyPrint: process.env.NODE_ENV !== 'production',
      includeContext: true,
    }),
  ],
})
export class AppModule {}
```

**使用日志**：

```typescript
import { Injectable } from '@nestjs/common';
import { ILoggerService } from '@hl8/nestjs-infra';

@Injectable()
export class PaymentService {
  constructor(private readonly logger: ILoggerService) {}

  async processPayment(orderId: string, amount: number) {
    // 自动包含租户上下文
    this.logger.log('开始处理支付', { orderId, amount });

    try {
      // 支付逻辑
      this.logger.log('支付成功', { orderId });
    } catch (error) {
      this.logger.error('支付失败', error.stack, { orderId });
    }
  }
}
```

### 5. Fastify 适配器

**场景**：使用企业级 Fastify 适配器（整合所有功能）

```typescript
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { EnterpriseFastifyAdapter } from '@hl8/nestjs-infra';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建企业级适配器（所有功能整合在一起）
  const adapter = new EnterpriseFastifyAdapter({
    // Fastify 实例配置
    fastifyOptions: {
      logger: true,
      trustProxy: true,
      bodyLimit: 1048576, // 1MB
    },
    
    // CORS 支持（默认启用）
    enableCors: true,
    corsOptions: {
      origin: true,
      credentials: true,
    },
    
    // 性能监控（默认启用）
    enablePerformanceMonitoring: true,
    
    // 健康检查（默认启用）
    enableHealthCheck: true,
    healthCheckPath: '/health',
    
    // 限流（可选启用）
    enableRateLimit: true,
    rateLimitOptions: {
      timeWindow: 60000, // 1分钟
      max: 100,          // 最多100次请求
      perTenant: true,   # 按租户限流
    },
    
    // 安全头（默认启用）
    enableSecurity: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  await app.listen(3000, '0.0.0.0');
  
  console.log(`应用运行在 http://localhost:3000`);
  console.log(`健康检查: http://localhost:3000/health`);
}

bootstrap();
```

**简化设计说明**：

- ✅ **单一适配器**：只有 `EnterpriseFastifyAdapter`，所有功能整合
- ✅ **CORS 集成**：不需要独立的 CORS plugin，直接在适配器中配置
- ✅ **监控集成**：性能监控和健康检查直接集成到适配器
- ✅ **灵活配置**：所有功能都可通过选项启用/禁用
- ❌ **移除冗余**：不需要 CoreFastifyAdapter 或独立的 plugins/ 目录

## 完整示例

**综合使用所有模块**：

```typescript
import { Module } from '@nestjs/common';
import {
  ExceptionModule,
  CachingModule,
  IsolationModule,
  TypedConfigModule,
  LoggingModule,
  fileLoader,
} from '@hl8/nestjs-infra';

@Module({
  imports: [
    // 1. 异常处理模块（最优先，其他模块依赖它）⭐
    ExceptionModule.forRoot({
      documentationUrl: 'https://docs.hl8.com/errors',
      logLevel: 'error',
      enableStackTrace: process.env.NODE_ENV !== 'production',
    }),

    // 2. 配置模块
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: [fileLoader({ path: './config/app.yml' })],
    }),

    // 3. 日志模块
    LoggingModule.forRoot({
      level: 'info',
      includeContext: true,
    }),

    // 4. 多租户模块
    IsolationModule.forRoot({
      global: true,
      enableMultiLevelIsolation: true,
    }),

    // 5. 缓存模块（依赖多租户）
    CachingModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
      },
      enableTenantIsolation: true,
    }),
  ],
})
export class AppModule {}
```

**业务服务示例**（综合使用）：

```typescript
import { Injectable } from '@nestjs/common';
import {
  ICacheService,
  IIsolationContextService,
  ILoggerService,
  Cacheable,
  GeneralNotFoundException,
  GeneralBadRequestException,
} from '@hl8/nestjs-infra';

@Injectable()
export class ProductService {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly isolationContext: IIsolationContextService,
    private readonly logger: ILoggerService
  ) {}

  // 自动缓存 + 租户隔离 + 日志记录 + 统一异常处理
  @Cacheable('product', 3600)
  async getProduct(productId: string): Promise<Product> {
    const tenantId = this.isolationContext.getTenantId();
    
    this.logger.log('查询产品', { productId, tenantId });

    const product = await this.productRepository.findById(productId);

    if (!product) {
      // 使用统一异常处理，自动返回 RFC7807 格式
      throw new GeneralNotFoundException(
        '产品未找到',
        `ID 为 "${productId}" 的产品不存在`,
        { productId, tenantId }
      );
    }

    return product;
  }

  async updateProduct(productId: string, data: UpdateProductDto): Promise<Product> {
    if (!data.name || data.name.trim() === '') {
      throw new GeneralBadRequestException(
        '产品名称无效',
        '产品名称不能为空',
        { field: 'name' }
      );
    }

    const product = await this.getProduct(productId);
    return this.productRepository.update(productId, data);
  }
}
```

## 常见问题

### Q1: 如何自定义异常消息？

```typescript
import { ExceptionMessageProvider, ExceptionModule } from '@hl8/nestjs-infra';

export class CustomMessageProvider implements ExceptionMessageProvider {
  private messages = {
    'USER_NOT_FOUND': {
      title: '用户未找到',
      detail: 'ID 为 "{userId}" 的用户不存在'
    },
  };

  getMessage(errorCode: string, type: 'title' | 'detail', params?: any): string | undefined {
    const message = this.messages[errorCode]?.[type];
    if (!message) return undefined;
    
    // 参数替换
    return message.replace(/\{(\w+)\}/g, (_, key) => params?.[key] || '');
  }

  hasMessage(errorCode: string, type: 'title' | 'detail'): boolean {
    return !!this.messages[errorCode]?.[type];
  }
}

@Module({
  imports: [
    ExceptionModule.forRoot({
      messageProvider: new CustomMessageProvider(),
    }),
  ],
})
export class AppModule {}
```

### Q2: 如何在开发环境中禁用缓存？

```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
  },
  defaultTTL: process.env.NODE_ENV === 'production' ? 3600 : 0, // 开发环境 TTL=0
})
```

### Q2: 如何手动清除租户的所有缓存？

```typescript
@Injectable()
export class AdminService {
  constructor(private readonly cacheService: ICacheService) {}

  async clearTenantCache(tenantId: string) {
    // TODO: 实现批量清除功能
    await this.cacheService.delByPattern(`*:tenant:${tenantId}:*`);
  }
}
```

### Q3: 如何自定义租户提取逻辑？

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { IIsolationContextService, IsolationContext } from '@hl8/nestjs-infra';

@Injectable()
export class CustomTenantMiddleware implements NestMiddleware {
  constructor(private readonly isolationContext: IIsolationContextService) {}

  use(req: any, res: any, next: () => void) {
    // 自定义提取逻辑（例如从 JWT token）
    const tenantId = this.extractFromJWT(req.headers.authorization);
    
    const context: IsolationContext = {
      tenantId,
      createdAt: new Date(),
    };

    this.isolationContext.setIsolationContext(context);
    next();
  }

  private extractFromJWT(authorization: string): string {
    // 实现 JWT 解析逻辑
    return 'tenant-from-jwt';
  }
}
```

### Q4: 如何实现数据共享控制？

**场景**：部门创建的公告，希望整个组织都能看到

```typescript
import { Injectable } from '@nestjs/common';
import { 
  IIsolationContextService,
  DataSharingLevel,
} from '@hl8/nestjs-infra';

interface Announcement {
  id: string;
  title: string;
  content: string;
  
  // 隔离字段
  tenantId: string;
  organizationId: string;
  departmentId: string;
  userId: string;
  
  // 共享控制字段 ⭐
  isShared: boolean;
  sharingLevel?: DataSharingLevel;
  
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly isolationContext: IIsolationContextService
  ) {}

  // 创建部门公告（组织级共享）
  async createDepartmentAnnouncement(data: CreateAnnouncementDto): Promise<Announcement> {
    const context = this.isolationContext.getIsolationContext();
    
    const announcement: Announcement = {
      id: generateId(),
      title: data.title,
      content: data.content,
      
      // 数据归属：部门级
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      departmentId: context.departmentId,
      userId: context.userId,
      
      // 共享控制：组织内可见 ⭐
      isShared: true,
      sharingLevel: DataSharingLevel.ORGANIZATION,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return this.repository.create(announcement);
  }

  // 查询公告（自动根据共享规则过滤）
  async getAnnouncements(): Promise<Announcement[]> {
    const context = this.isolationContext.getIsolationContext();
    
    // 查询条件：
    // 1. 本部门的所有公告
    // 2. 本组织的共享公告（isShared=true && sharingLevel=ORGANIZATION）
    // 3. 本租户的共享公告（isShared=true && sharingLevel=TENANT）
    return this.repository.findVisibleAnnouncements(context);
  }
}
```

**典型共享场景**：

| 场景 | 数据归属 | isShared | sharingLevel | 可见范围 |
|------|---------|----------|-------------|---------|
| 部门私有文档 | 部门级 | false | - | 仅本部门 |
| 部门公告 | 部门级 | true | ORGANIZATION | 整个组织 |
| 组织最佳实践 | 组织级 | true | TENANT | 整个租户 |
| 租户工单 | 租户级 | true | PLATFORM | 平台客服可见 |
| 用户草稿 | 用户级 | false | - | 仅用户本人 |

---

### Q5: 如何在测试中使用？

```typescript
import { Test } from '@nestjs/testing';
import { CachingModule, ICacheService } from '@hl8/nestjs-infra';

describe('ProductService', () => {
  let service: ProductService;
  let cacheService: ICacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
      ],
      providers: [ProductService],
    }).compile();

    service = module.get(ProductService);
    cacheService = module.get(ICacheService);
  });

  it('应当正确缓存产品', async () => {
    const product = await service.getProduct('product-1');
    
    // 验证缓存
    const cached = await cacheService.get('product', 'product-1');
    expect(cached).toEqual(product);
  });
});
```

## 性能提示

1. **缓存 TTL 设置**：
   - 热数据：300-600 秒
   - 温数据：1800-3600 秒
   - 冷数据：≥ 7200 秒

2. **Redis 连接池**：
   - 生产环境建议使用连接池
   - 设置合理的 `connectTimeout`

3. **日志级别**：
   - 开发环境：`debug`
   - 生产环境：`info` 或 `warn`

4. **缓存键设计**：
   - 使用清晰的命名空间
   - 包含必要的隔离信息
   - 避免过长的键名

## 进阶话题

- 📖 [完整 API 文档](./contracts/README.md)
- 📖 [数据模型](./data-model.md)
- 📖 [研究文档](./research.md)
- 📖 [实施计划](./plan.md)

## 获取帮助

- 📝 查看 [Issues](../../issues)
- 💬 加入讨论
- 📧 联系维护者

---

**快速开始完成！** 🎉

下一步：

1. 查看[完整文档](./contracts/README.md)了解更多功能
2. 阅读[研究文档](./research.md)了解技术决策
3. 开始开发您的应用！
