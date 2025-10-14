# HL8 核心库使用指南

**版本**: v1.0.0  
**日期**: 2025-10-12  
**适用库**: @hl8/isolation-model, @hl8/nestjs-isolation, @hl8/nestjs-caching

---

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm add @hl8/isolation-model @hl8/nestjs-isolation @hl8/nestjs-caching
pnpm add ioredis nestjs-cls
```

### 2. 配置模块

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { IsolationModule } from '@hl8/nestjs-isolation';
import { CachingModule } from '@hl8/nestjs-caching';

@Module({
  imports: [
    // 1. 配置隔离模块（自动提取租户/组织/用户上下文）
    IsolationModule.forRoot(),

    // 2. 配置缓存模块（自动多层级隔离）
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      ttl: 3600,
      keyPrefix: 'myapp:cache:',
    }),
  ],
})
export class AppModule {}
```

### 3. 在服务中使用缓存装饰器

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, CachePut } from '@hl8/nestjs-caching';

@Injectable()
export class UsersService {
  // 读操作：自动缓存
  @Cacheable('users')
  async getUserById(id: string): Promise<User> {
    return this.repository.findOne(id);
  }

  // 更新操作：刷新缓存
  @CachePut('users')
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.repository.update(id, data);
  }

  // 删除操作：清除缓存
  @CacheEvict('users')
  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### 4. 启动应用并测试

```bash
# 启动应用
pnpm start

# 测试租户 A 的请求
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:3000/users/123

# 测试租户 B 的请求（数据完全隔离）
curl -H "X-Tenant-Id: 123e4567-e89b-42d3-a456-426614174000" \
     http://localhost:3000/users/123
```

---

## 📚 完整示例

查看 [examples/nestjs-caching-demo](../../examples/nestjs-caching-demo/) 获取完整的可运行示例。

---

## 🎊 总结

通过以上几个简单的步骤，您就可以在 NestJS 应用中使用自动多层级数据隔离的缓存功能了！

- ✅ 零侵入：业务代码无需手动处理租户隔离
- ✅ 声明式：使用装饰器，代码更简洁
- ✅ 类型安全：TypeScript strict mode
- ✅ 高性能：Flyweight 模式 + Redis

**更多文档**:

- [Architecture](../../libs/nestjs-caching/docs/ARCHITECTURE.md)
- [API Reference](../../libs/nestjs-caching/docs/API.md)
- [Quickstart](./quickstart.md)
