# @hl8/caching

> 企业级 NestJS 缓存库 - 自动多层级数据隔离 + DDD 充血模型

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.6-red)](https://nestjs.com/)
[![Tests](https://img.shields.io/badge/tests-140%2F140%20passing-brightgreen)](./docs/API.md)
[![Coverage](https://img.shields.io/badge/coverage-55%25-yellow)](./docs/API.md)

## ✨ 核心特性

- 🎯 **自动多层级隔离**：支持平台/租户/组织/部门/用户 5 级隔离，零侵入
- 🏗️ **DDD 充血模型**：业务逻辑封装在领域对象中，易于维护
- 🎨 **装饰器模式**：`@Cacheable`、`@CacheEvict`、`@CachePut`，声明式 API
- 📊 **性能监控**：实时命中率、延迟统计、错误追踪
- 🔒 **类型安全**：TypeScript strict mode + 完整类型定义
- ⚡ **高性能**：Flyweight 模式、批量操作、连接池管理
- 🧪 **完整测试**：140 个测试，100% 通过

---

## 📦 安装

```bash
pnpm add @hl8/caching @hl8/isolation-model ioredis
```

---

## 🚀 快速开始

### 1. 配置模块

```typescript
import { Module } from '@nestjs/common';
import { CachingModule } from '@hl8/caching';
import { IsolationModule } from '@hl8/nestjs-isolation';

@Module({
  imports: [
    // 配置隔离模块（必须）
    IsolationModule.forRoot(),
    
    // 配置缓存模块
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 3600, // 默认 TTL（秒）
      keyPrefix: 'hl8:cache:',
    }),
  ],
})
export class AppModule {}
```

### 2. 使用装饰器

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, CachePut } from '@hl8/caching';

@Injectable()
export class UserService {
  // 自动缓存
  @Cacheable('user')
  async getUserById(id: string): Promise<User> {
    return this.repository.findOne(id);
  }
  
  // 更新后刷新缓存
  @CachePut('user')
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.repository.update(id, data);
  }
  
  // 删除后清除缓存
  @CacheEvict('user')
  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### 3. 自动多层级隔离

```bash
# 租户 A 的请求
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:3000/api/users/123

# 生成键: hl8:cache:tenant:550e8400...:user:123
```

```bash
# 租户 B 的请求（完全隔离）
curl -H "X-Tenant-Id: 123e4567-e89b-42d3-a456-426614174000" \
     http://localhost:3000/api/users/123

# 生成键: hl8:cache:tenant:123e4567...:user:123
```

**数据完全隔离！无需业务代码干预！**

---

## 📖 核心概念

### DDD 充血模型

业务逻辑封装在领域对象中，而不是分散在服务层：

```typescript
// ✅ 充血模型
class CacheKey {
  toRedisKey(): string {
    // 业务逻辑在领域对象内部
    return this.context.buildCacheKey(this.namespace, this.key);
  }
}

// ❌ 贫血模型
class CacheKey {
  namespace: string;
  key: string;
  // 仅数据字段，业务逻辑在外部
}
```

### 自动隔离机制

1. **IsolationModule** 从请求头提取租户/组织/用户信息
2. **ClsService** 存储到 CLS（Continuation Local Storage）
3. **CacheService** 自动读取 CLS 并组合到缓存键中

**完全零侵入！**

---

## 🎯 装饰器 API

### @Cacheable - 读缓存

```typescript
@Cacheable('user', {
  keyGenerator: (id: string) => `profile:${id}`,
  ttl: 1800,
  condition: (id: string) => id !== 'admin',
  cacheNull: true,
})
async getUserProfile(id: string): Promise<UserProfile> {
  return this.repository.findProfile(id);
}
```

### @CacheEvict - 清除缓存

```typescript
@CacheEvict('user', {
  allEntries: true,
  beforeInvocation: true,
})
async resetAllUsers(): Promise<void> {
  await this.repository.truncate();
}
```

### @CachePut - 强制更新

```typescript
@CachePut('user', {
  keyGenerator: (id: string) => id,
  ttl: 3600,
})
async refreshUserCache(id: string): Promise<User> {
  return this.repository.findOne(id);
}
```

---

## 📊 性能监控

```typescript
import { CacheMetricsService } from '@hl8/caching';

@Injectable()
export class CacheMonitorService {
  constructor(private readonly metrics: CacheMetricsService) {}
  
  getDashboard() {
    const metrics = this.metrics.getMetrics();
    
    return {
      hitRate: `${(metrics.hitRate * 100).toFixed(2)}%`,
      avgLatency: `${metrics.averageLatency.toFixed(2)}ms`,
      hits: metrics.hits,
      misses: metrics.misses,
      errors: metrics.errors,
    };
  }
}
```

---

## 🔧 高级用法

### 异步配置

```typescript
CachingModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => ({
    redis: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
    },
    ttl: config.get('CACHE_TTL'),
  }),
})
```

### 直接使用 CacheService

```typescript
@Injectable()
export class MyService {
  constructor(private readonly cache: CacheService) {}
  
  async getData(key: string) {
    // 尝试从缓存获取
    let data = await this.cache.get<MyData>('mydata', key);
    
    if (!data) {
      // 从数据源获取
      data = await this.fetchFromSource(key);
      
      // 存入缓存
      await this.cache.set('mydata', key, data, 1800);
    }
    
    return data;
  }
}
```

### 批量清除

```typescript
// 清除所有用户缓存
await cacheService.clear('user:*');

// 清除特定模式
await cacheService.clear('temp:*');
```

---

## 🏗️ 架构设计

```
应用层 (业务代码)
  ↓ 使用装饰器
装饰器层 (@Cacheable, @CacheEvict, @CachePut)
  ↓ 委托
拦截器层 (CacheInterceptor - AOP 实现)
  ↓ 调用
服务层 (CacheService, RedisService, MetricsService)
  ↓ 使用
领域层 (CacheKey VO, CacheEntry VO, Events)
  ↓ 依赖
基础设施层 (Redis, ClsService)
```

详细架构说明请查看 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 📚 文档

- [架构设计](./docs/ARCHITECTURE.md) - 详细的架构设计和模式说明
- [API 参考](./docs/API.md) - 完整的 API 文档
- [快速开始指南](../../../specs/001-hl8-nestjs-enhance/quickstart.md) - 使用指南
- [更新日志](./CHANGELOG.md) - 版本更新历史

---

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试并查看覆盖率
pnpm test:cov

# 构建
pnpm build
```

**测试统计**：

- ✅ 140/140 测试通过
- ✅ 监控模块：100% 覆盖率
- ✅ 工具模块：89.47% 覆盖率
- ✅ 领域层：78.94% 覆盖率

---

## 🎯 使用场景

### 1. SAAS 多租户应用

自动租户隔离，完全零侵入：

```typescript
// 业务代码完全不需要关心租户隔离
@Cacheable('order')
async getOrders() {
  return this.repository.findAll();
}

// 不同租户的请求自动隔离
// 租户 A: hl8:cache:tenant:A:order:list
// 租户 B: hl8:cache:tenant:B:order:list
```

### 2. 高并发查询

减轻数据库压力：

```typescript
@Cacheable('product', { ttl: 3600 })
async getProductById(id: string) {
  return this.repository.findOne(id);
}
```

### 3. 定时刷新

保持缓存新鲜：

```typescript
@CachePut('stats')
@Cron('0 */5 * * * *') // 每 5 分钟
async refreshStats() {
  return this.calculateStats();
}
```

---

## 💡 最佳实践

### 1. 合理设置 TTL

```typescript
// 频繁变化的数据 - 短 TTL
@Cacheable('realtime', { ttl: 60 }) // 1 分钟

// 稳定数据 - 长 TTL
@Cacheable('config', { ttl: 86400 }) // 24 小时
```

### 2. 使用条件缓存

```typescript
@Cacheable('user', {
  // 不缓存敏感用户
  condition: (id: string) => id !== 'admin',
})
```

### 3. 防止缓存穿透

```typescript
@Cacheable('product', {
  cacheNull: true, // 缓存 null 值
})
async findProduct(id: string): Promise<Product | null> {
  return this.repository.findOne(id);
}
```

### 4. 及时清除缓存

```typescript
@CacheEvict('user')
async updateUser(id: string, data: any) {
  return this.repository.update(id, data);
}
```

---

## 🤝 依赖项

- **@hl8/isolation-model**: 零依赖领域模型（自动隔离）
- **ioredis**: Redis 客户端
- **nestjs-cls**: CLS（Continuation Local Storage）管理

---

## 📝 License

MIT

---

## 🎊 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## 📮 联系方式

- Issues: [GitHub Issues](https://github.com/your-org/hl8/issues)
- 文档: [完整文档](./docs/)

---

**更新日期**: 2025-10-12  
**版本**: v1.0.0
