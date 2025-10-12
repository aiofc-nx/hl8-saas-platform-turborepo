# @hl8/nestjs-isolation

NestJS 数据隔离实现库 - 基于 `@hl8/isolation-model` 领域模型。

## ✨ 特性

- ✅ 自动从请求头提取隔离上下文
- ✅ 提供装饰器、守卫、中间件
- ✅ 基于 nestjs-cls 实现请求级上下文
- ✅ 支持 Fastify 和 Express
- ✅ 支持 5 个隔离层级（Platform, Tenant, Organization, Department, User）

## 📦 安装

```bash
pnpm add @hl8/nestjs-isolation
```

## 🚀 快速开始

### 1. 导入模块

```typescript
import { Module } from '@nestjs/common';
import { IsolationModule } from '@hl8/nestjs-isolation';

@Module({
  imports: [
    IsolationModule.forRoot(),
  ],
})
export class AppModule {}
```

### 2. 使用装饰器

```typescript
import { Controller, Get } from '@nestjs/common';
import { RequireTenant, CurrentContext } from '@hl8/nestjs-isolation';
import { IsolationContext } from '@hl8/isolation-model';

@Controller('users')
export class UserController {
  @Get()
  @RequireTenant()
  async getUsers(@CurrentContext() context: IsolationContext) {
    // context.tenantId 自动从请求头提取
    return this.userService.findByContext(context);
  }
}
```

### 3. 请求头格式

```bash
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-Organization-Id: 6ba7b810-9dad-41d1-80b4-00c04fd430c8" \
     http://localhost:3000/api/users
```

## 📚 文档

- [完整文档](../../specs/001-hl8-nestjs-enhance/isolation-quickstart.md)
- [领域模型库](../isolation-model)
- [API 参考](../../specs/001-hl8-nestjs-enhance/contracts/isolation-api.md)

## 🏗️ 架构

本库依赖于纯领域模型库 `@hl8/isolation-model`，遵循依赖倒置原则：

```
业务代码（Controllers）
  ↓ 使用
@hl8/nestjs-isolation（NestJS 实现）
  ↓ 依赖
@hl8/isolation-model（纯领域模型，零依赖）
```

## 📄 License

MIT © HL8 Team
