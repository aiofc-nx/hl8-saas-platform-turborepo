# Quick Start: Caching 模块快速开始

**Date**: 2025-10-12  
**Feature**: 将 libs/nestjs-infra/src/caching 拆分为独立的 libs/nestjs-caching 库项目  
**Version**: 1.0.0

## 概述

`@hl8/nestjs-caching` 是一个为 NestJS 应用提供企业级 Redis 缓存功能的库，支持多层级数据隔离（平台、租户、组织、部门、用户），提供装饰器、性能监控和灵活配置。

**核心特性**:

- ✅ 自动多层级数据隔离
- ✅ DDD 充血模型设计
- ✅ 缓存装饰器（@Cacheable、@CacheEvict、@CachePut）
- ✅ 性能监控和指标收集
- ✅ 完整的 TypeScript 类型支持
- ✅ 支持 ES Module (NodeNext)

---

## 安装

### 前置要求

- Node.js >= 20
- Redis >= 5.0
- NestJS >= 11.0
- TypeScript >= 5.9

### 安装命令

在 monorepo 根目录执行：

```bash
# 已在 workspace 内，无需安装
# 如果是独立项目，执行：
pnpm add @hl8/nestjs-caching
```

---

## 基础使用

### 步骤 1: 配置模块

在应用模块中导入 `CachingModule`：

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { CachingModule } from '@hl8/nestjs-caching';

@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'your-password', // 可选
        db: 0,
      },
      defaultTTL: 3600, // 默认 1 小时
      keyPrefix: 'hl8:cache:',
      enableMetrics: true,
    }),
  ],
})
export class AppModule {}
```

### 步骤 2: 注入 CacheService

在服务中注入 `CacheService`：

```typescript
// src/users/user.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService } from '@hl8/nestjs-caching';

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}
  
  async getUserProfile(userId: string) {
    // 尝试从缓存获取
    const cached = await this.cacheService.get<UserProfile>(
      'user', 
      `profile:${userId}`
    );
    
    if (cached) {
      return cached;
    }
    
    // 从数据库加载
    const profile = await this.userRepository.findOne(userId);
    
    // 缓存结果（30 分钟）
    await this.cacheService.set('user', `profile:${userId}`, profile, 1800);
    
    return profile;
  }
}
```

### 步骤 3: 运行应用

```bash
cd /path/to/your/app
pnpm run dev
```

**完成！** 您的应用现在支持 Redis 缓存了 🎉

---

## 使用装饰器（推荐）

装饰器提供更简洁的缓存操作方式。

### @Cacheable - 自动缓存

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable } from '@hl8/nestjs-caching';

@Injectable()
export class UserService {
  /**
   * 自动缓存用户配置
   * 
   * - 首次调用：执行方法并缓存结果
   * - 再次调用：直接返回缓存，不执行方法
   */
  @Cacheable('user', {
    keyGenerator: (userId: string) => `profile:${userId}`,
    ttl: 1800, // 30 分钟
  })
  async getUserProfile(userId: string): Promise<UserProfile> {
    console.log('从数据库加载...'); // 首次调用时输出
    return this.userRepository.findOne(userId);
  }
}
```

### @CacheEvict - 清除缓存

```typescript
import { Injectable } from '@nestjs/common';
import { CacheEvict } from '@hl8/nestjs-caching';

@Injectable()
export class UserService {
  /**
   * 更新用户时自动清除缓存
   */
  @CacheEvict('user', {
    keyGenerator: (userId: string) => `profile:${userId}`,
  })
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    await this.userRepository.update(userId, data);
    // 缓存会在方法执行后自动清除
  }
  
  /**
   * 删除用户时清除所有相关缓存
   */
  @CacheEvict('user', {
    allEntries: true, // 清除 user 命名空间下的所有缓存
  })
  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
```

### @CachePut - 强制更新缓存

```typescript
import { Injectable } from '@nestjs/common';
import { CachePut } from '@hl8/nestjs-caching';

@Injectable()
export class UserService {
  /**
   * 创建用户后立即缓存
   */
  @CachePut('user', {
    keyGenerator: (user: User) => `profile:${user.id}`,
    ttl: 3600,
  })
  async createUser(data: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(data);
    // 方法返回值会立即缓存
    return user;
  }
}
```

---

## 多层级隔离

缓存自动支持 5 个隔离层级，无需手动处理。

### 隔离层级说明

| 层级 | 描述 | 缓存键示例 |
|------|------|-----------|
| Platform | 平台级缓存 | `hl8:cache:platform:system:version` |
| Tenant | 租户级缓存 | `hl8:cache:tenant:t123:config:flags` |
| Organization | 组织级缓存 | `hl8:cache:tenant:t123:org:o456:members:list` |
| Department | 部门级缓存 | `hl8:cache:tenant:t123:org:o456:dept:d789:tasks:active` |
| User | 用户级缓存 | `hl8:cache:user:u999:preferences:theme` |

### 自动隔离示例

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@hl8/nestjs-caching';

@Injectable()
export class DataService {
  constructor(private readonly cacheService: CacheService) {}
  
  async getData() {
    // 自动根据当前请求的隔离上下文生成缓存键
    // 如果当前用户属于租户 t123，组织 o456，部门 d789
    // 生成的键: hl8:cache:tenant:t123:org:o456:dept:d789:data:list
    
    return this.cacheService.get('data', 'list');
  }
}
```

**工作原理**:

1. 系统从请求头中提取隔离标识（X-Tenant-Id、X-Organization-Id 等）
2. 隔离上下文存储在 `nestjs-cls` 中
3. `CacheService` 自动从上下文生成正确的缓存键
4. 开发者无需关心隔离逻辑

---

## 批量操作

### 清除租户缓存

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@hl8/nestjs-caching';

@Injectable()
export class TenantService {
  constructor(private readonly cacheService: CacheService) {}
  
  /**
   * 租户配置更新后清除所有缓存
   */
  async updateTenantConfig(tenantId: string, config: TenantConfig): Promise<void> {
    await this.tenantRepository.update(tenantId, config);
    
    // 清除该租户的所有缓存
    const count = await this.cacheService.clearTenantCache(tenantId);
    
    console.log(`清除了 ${count} 个缓存键`);
  }
  
  /**
   * 仅清除租户的用户缓存
   */
  async refreshUserCache(tenantId: string): Promise<void> {
    const count = await this.cacheService.clearTenantCache(tenantId, 'user');
    console.log(`清除了 ${count} 个用户缓存`);
  }
}
```

### 清除组织缓存

```typescript
/**
 * 组织结构调整后清除缓存
 */
async reorganize(tenantId: string, orgId: string): Promise<void> {
  await this.organizationRepository.update(tenantId, orgId);
  
  // 清除组织的所有缓存
  await this.cacheService.clearOrganizationCache(tenantId, orgId);
}
```

---

## 异步配置（推荐生产环境）

使用 `ConfigService` 管理配置：

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CachingModule } from '@hl8/nestjs-caching';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CachingModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          connectTimeout: 10000,
        },
        defaultTTL: configService.get('CACHE_DEFAULT_TTL', 3600),
        keyPrefix: configService.get('CACHE_KEY_PREFIX', 'hl8:cache:'),
        enableMetrics: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 环境变量配置

创建 `.env` 文件：

```bash
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secret-password
REDIS_DB=0

# 缓存配置
CACHE_DEFAULT_TTL=3600
CACHE_KEY_PREFIX=hl8:cache:
```

---

## 性能监控

### 启用指标收集

```typescript
// src/monitoring/monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheMetricsService } from '@hl8/nestjs-caching';

@Injectable()
export class MonitoringService {
  constructor(private readonly metricsService: CacheMetricsService) {}
  
  /**
   * 每分钟报告缓存指标
   */
  @Cron(CronExpression.EVERY_MINUTE)
  reportCacheMetrics() {
    const metrics = this.metricsService.getMetrics();
    
    console.log('=== 缓存性能指标 ===');
    console.log(`命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
    console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
    console.log(`总操作: ${metrics.totalOperations}`);
    console.log(`错误次数: ${metrics.errors}`);
    
    // 重置指标（可选）
    this.metricsService.reset();
  }
}
```

### 健康检查

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RedisService } from '@hl8/nestjs-caching';

@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}
  
  @Get()
  async check() {
    const redisHealthy = await this.redisService.healthCheck();
    
    return {
      status: redisHealthy ? 'ok' : 'error',
      redis: redisHealthy ? 'up' : 'down',
    };
  }
}
```

---

## 高级用法

### 自定义 Redis 操作

如果需要使用 `CacheService` 未提供的 Redis 功能：

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@hl8/nestjs-caching';

@Injectable()
export class LeaderboardService {
  constructor(private readonly redisService: RedisService) {}
  
  async addScore(userId: string, score: number): Promise<void> {
    const redis = this.redisService.getClient();
    
    // 使用 Redis 的 Sorted Set
    await redis.zadd('leaderboard', score, userId);
  }
  
  async getTopUsers(limit: number = 10): Promise<Array<{ userId: string; score: number }>> {
    const redis = this.redisService.getClient();
    
    // 获取排行榜前 N 名
    const results = await redis.zrevrange('leaderboard', 0, limit - 1, 'WITHSCORES');
    
    const leaderboard = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i],
        score: parseFloat(results[i + 1]),
      });
    }
    
    return leaderboard;
  }
}
```

---

## 测试

### 单元测试

```typescript
// src/users/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CacheService } from '@hl8/nestjs-caching';

describe('UserService', () => {
  let service: UserService;
  let cacheService: CacheService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();
    
    service = module.get<UserService>(UserService);
    cacheService = module.get<CacheService>(CacheService);
  });
  
  it('should cache user profile', async () => {
    const userId = 'u999';
    const profile = { id: userId, name: '张三' };
    
    // Mock 缓存未命中
    jest.spyOn(cacheService, 'get').mockResolvedValue(null);
    jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);
    
    const result = await service.getUserProfile(userId);
    
    expect(cacheService.get).toHaveBeenCalledWith('user', `profile:${userId}`);
    expect(cacheService.set).toHaveBeenCalledWith(
      'user', 
      `profile:${userId}`, 
      expect.any(Object), 
      1800
    );
  });
});
```

### 集成测试

```typescript
// __tests__/integration/caching.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CachingModule, CacheService } from '@hl8/nestjs-caching';
import Redis from 'ioredis-mock';

describe('Caching Integration', () => {
  let cacheService: CacheService;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: {
            host: 'localhost',
            port: 6379,
          },
          defaultTTL: 60,
          keyPrefix: 'test:cache:',
        }),
      ],
    }).compile();
    
    cacheService = module.get<CacheService>(CacheService);
  });
  
  it('should set and get cache', async () => {
    await cacheService.set('test', 'key1', { value: 'test' }, 60);
    const result = await cacheService.get('test', 'key1');
    
    expect(result).toEqual({ value: 'test' });
  });
  
  it('should delete cache', async () => {
    await cacheService.set('test', 'key2', { value: 'test' }, 60);
    await cacheService.del('test', 'key2');
    
    const result = await cacheService.get('test', 'key2');
    expect(result).toBeNull();
  });
});
```

---

## 故障排查

### 常见问题

#### 1. Redis 连接失败

**错误**:

```
GeneralInternalServerException: Redis 连接失败
```

**解决方案**:

- 检查 Redis 服务是否运行：`redis-cli ping`
- 检查主机地址和端口是否正确
- 检查防火墙设置
- 检查 Redis 密码配置

#### 2. 缓存未生效

**问题**: 数据没有被缓存

**排查步骤**:

1. 检查装饰器配置是否正确
2. 检查 `keyGenerator` 是否返回唯一键
3. 查看日志，确认缓存操作是否执行
4. 使用 `redis-cli` 查看键是否存在：

   ```bash
   redis-cli
   > KEYS hl8:cache:*
   ```

#### 3. 隔离上下文缺失

**错误**:

```
GeneralBadRequestException: 租户 ID 缺失
```

**解决方案**:

- 确保请求头包含隔离标识（X-Tenant-Id 等）
- 检查 `nestjs-cls` 中间件是否配置
- 使用平台级缓存（不需要隔离上下文）

---

## 最佳实践

### 1. 合理设置 TTL

```typescript
// ✅ 根据数据变更频率设置 TTL
await cacheService.set('user', 'profile', data, 1800); // 配置数据: 30 分钟
await cacheService.set('product', 'price', data, 300); // 价格数据: 5 分钟
await cacheService.set('article', 'detail', data, 3600); // 文章: 1 小时

// ❌ 避免使用过长的 TTL
await cacheService.set('user', 'session', data, 86400 * 30); // 30 天（太长）
```

### 2. 使用命名空间

```typescript
// ✅ 使用清晰的命名空间
'user'        // 用户相关
'product'     // 产品相关
'order'       // 订单相关

// ❌ 避免混合命名空间
'user-product'  // 不清晰
'data'          // 过于宽泛
```

### 3. 批量操作优化

```typescript
// ✅ 使用批量清除
await cacheService.clearTenantCache('t123', 'user');

// ❌ 避免循环操作
for (const userId of userIds) {
  await cacheService.del('user', `profile:${userId}`); // 性能差
}
```

### 4. 错误处理

```typescript
// ✅ 处理缓存异常
try {
  return await cacheService.get('user', 'profile');
} catch (error) {
  logger.error('缓存读取失败', error);
  // 降级到数据库查询
  return this.userRepository.findOne();
}

// ❌ 不处理异常
const cached = await cacheService.get('user', 'profile'); // 可能抛出异常
```

---

## 示例项目

完整示例项目位于：`examples/nestjs-caching-demo`

运行示例：

```bash
cd examples/nestjs-caching-demo
pnpm install
pnpm run dev
```

---

## 下一步

- 📖 阅读 [API 文档](./contracts/caching-api.md)
- 🏗️ 查看 [架构设计](./ARCHITECTURE.md)（即将发布）
- 📊 了解 [数据模型](./data-model.md)
- 🔬 查看 [研究报告](./research.md)

---

## 获取帮助

- **问题反馈**: [GitHub Issues](https://github.com/hl8/hl8-saas-platform-turborepo/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/hl8/hl8-saas-platform-turborepo/discussions)
- **内部文档**: `docs/` 目录

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 快速开始文档完成
