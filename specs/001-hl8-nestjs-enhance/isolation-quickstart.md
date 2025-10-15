# Quick Start: Isolation 数据隔离模块快速开始

**Date**: 2025-10-12  
**Feature**: 拆分 Isolation 数据隔离模块为独立库项目  
**Version**: 1.0.0

## 概述

Isolation 数据隔离模块提供企业级多层级数据隔离功能，拆分为两个独立的库：

1. **`@hl8/isolation-model`** - 纯领域模型库（推荐所有业务库使用）
   - 零依赖，框架无关
   - 可在任何 TypeScript 环境使用
   - 封装隔离业务逻辑

2. **`@hl8/nestjs-isolation`** - NestJS 实现库（NestJS 应用使用）
   - 依赖领域模型库
   - 提供中间件、守卫、装饰器
   - 自动提取隔离上下文

**核心特性**:

- ✅ 5 层级数据隔离（平台、租户、组织、部门、用户）
- ✅ DDD 充血模型设计
- ✅ 零依赖领域模型（可被任何模块引用）
- ✅ 自动上下文提取（从请求头）
- ✅ 完整的 TypeScript 类型支持

---

## 安装

### 方式 1: 仅使用领域模型（推荐业务库）

如果你在开发缓存、日志等业务库，只需安装领域模型库：

```bash
# 在 monorepo 中作为 workspace 依赖
# package.json
{
  "dependencies": {
    "@hl8/isolation-model": "workspace:*"
  }
}
```

### 方式 2: 使用完整功能（NestJS 应用）

如果你在开发 NestJS 应用，安装实现库（会自动包含领域模型）：

```bash
# package.json
{
  "dependencies": {
    "@hl8/nestjs-isolation": "workspace:*"
  }
}
```

---

## 快速开始 - 业务库集成（零依赖）

### 示例: Caching 模块使用隔离上下文

```typescript
// libs/nestjs-caching/src/cache.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { IsolationContext } from "@hl8/isolation-model"; // 零依赖！
import type { IIsolationContextProvider } from "@hl8/isolation-model";

@Injectable()
export class CacheService {
  constructor(
    @Inject("ISOLATION_CONTEXT_PROVIDER")
    private readonly contextProvider: IIsolationContextProvider,
  ) {}

  async get<T>(namespace: string, key: string): Promise<T | null> {
    // 获取隔离上下文（使用接口，零依赖）
    const context =
      this.contextProvider.getIsolationContext() ?? IsolationContext.platform();

    // 使用领域模型生成缓存键
    const cacheKey = context.buildCacheKey(namespace, key);

    // 执行缓存操作
    return this.redis.get(cacheKey);
  }
}
```

**关键点**:

- ✅ 只依赖 `@hl8/isolation-model`（零依赖）
- ✅ 使用接口注入（`IIsolationContextProvider`）
- ✅ 调用领域模型方法（`buildCacheKey()`）
- ✅ 无需关心具体实现

---

### 示例: Logging 模块使用隔离上下文

```typescript
// libs/nestjs-logging/src/logger.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { IsolationContext } from "@hl8/isolation-model"; // 零依赖！
import type { IIsolationContextProvider } from "@hl8/isolation-model";

@Injectable()
export class LoggerService {
  constructor(
    @Inject("ISOLATION_CONTEXT_PROVIDER")
    private readonly contextProvider: IIsolationContextProvider,
  ) {}

  info(message: string, data?: any): void {
    // 获取隔离上下文
    const context =
      this.contextProvider.getIsolationContext() ?? IsolationContext.platform();

    // 使用领域模型生成日志上下文
    const logContext = context.buildLogContext();

    // 记录日志
    this.pino.info({
      ...logContext,
      level: context.getIsolationLevel(),
      message,
      data,
    });
  }
}
```

---

## 快速开始 - NestJS 应用集成（完整功能）

### 步骤 1: 安装和配置模块

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { IsolationModule } from "@hl8/nestjs-isolation";

@Module({
  imports: [
    IsolationModule.forRoot({
      global: true, // 全局模块
      autoRegisterMiddleware: true, // 自动注册中间件
      extractionStrategy: "header", // 从请求头提取
    }),
  ],
})
export class AppModule {}
```

### 步骤 2: 发送带有隔离标识的请求

```bash
# 租户级请求
curl -H "X-Tenant-Id: t123" \
     http://localhost:3000/api/users

# 部门级请求
curl -H "X-Tenant-Id: t123" \
     -H "X-Organization-Id: o456" \
     -H "X-Department-Id: d789" \
     http://localhost:3000/api/users
```

### 步骤 3: 在服务中使用隔离上下文

```typescript
// src/users/user.service.ts
import { Injectable } from "@nestjs/common";
import { IsolationContextService } from "@hl8/nestjs-isolation";

@Injectable()
export class UserService {
  constructor(private readonly isolationService: IsolationContextService) {}

  async getUsers() {
    // 获取当前请求的隔离上下文
    const context = this.isolationService.getIsolationContext();

    if (!context) {
      throw new BadRequestException("隔离上下文缺失");
    }

    // 使用上下文构建查询条件
    const where = context.buildWhereClause();

    // 自动隔离查询
    return this.userRepository.find({ where });
  }
}
```

---

## 使用装饰器（推荐）

### @RequireTenant - 要求租户级隔离

```typescript
import { Controller, Get } from "@nestjs/common";
import { RequireTenant } from "@hl8/nestjs-isolation";

@Controller("tenants")
export class TenantController {
  @Get()
  @RequireTenant() // 自动验证租户上下文
  async getTenantInfo() {
    // 如果请求头缺少 X-Tenant-Id，会自动返回 403 错误
    return { message: "租户信息" };
  }
}
```

### @CurrentContext - 注入当前上下文

```typescript
import { Controller, Get } from "@nestjs/common";
import { CurrentContext } from "@hl8/nestjs-isolation";
import { IsolationContext } from "@hl8/isolation-model";

@Controller("users")
export class UserController {
  @Get()
  async getUsers(@CurrentContext() context: IsolationContext) {
    // 直接使用上下文
    console.log(`当前隔离级别: ${context.getIsolationLevel()}`);

    const where = context.buildWhereClause();
    return this.userService.find(where);
  }
}
```

---

## 纯领域模型使用（无框架）

即使不使用 NestJS，也可以直接使用领域模型：

```typescript
// 任何 TypeScript 环境（浏览器、Node.js、Deno）
import {
  IsolationContext,
  TenantId,
  OrganizationId,
  IsolationLevel,
} from "@hl8/isolation-model"; // 零依赖！

// 创建隔离上下文
const tenantId = TenantId.create("t123");
const orgId = OrganizationId.create("o456");
const context = IsolationContext.organization(tenantId, orgId);

// 使用领域模型
console.log(context.getIsolationLevel()); // IsolationLevel.ORGANIZATION
console.log(context.buildCacheKey("user", "list"));
// 输出: tenant:t123:org:o456:user:list

// 判断权限
const dataContext = IsolationContext.tenant(tenantId);
const canAccess = context.canAccess(
  dataContext,
  true, // 共享数据
  SharingLevel.TENANT,
);
console.log(canAccess); // true
```

---

## 高级用法

### 自定义提取策略

如果需要从 JWT 或其他来源提取隔离标识：

```typescript
import { Module } from "@nestjs/common";
import { IsolationModule, IExtractionStrategy } from "@hl8/nestjs-isolation";

// 自定义提取策略
class JwtExtractionStrategy implements IExtractionStrategy {
  extract(request: any) {
    const token = request.headers.authorization?.replace("Bearer ", "");
    const payload = this.jwtService.decode(token);

    return {
      tenantId: payload.tid,
      organizationId: payload.oid,
      departmentId: payload.did,
      userId: payload.sub,
    };
  }
}

@Module({
  imports: [
    IsolationModule.forRoot({
      extractionStrategy: "custom",
      customExtractor: new JwtExtractionStrategy(),
    }),
  ],
})
export class AppModule {}
```

---

## 测试

### 单元测试（领域模型）

```typescript
// libs/isolation-model/src/entities/isolation-context.entity.spec.ts
import {
  IsolationContext,
  TenantId,
  IsolationLevel,
} from "@hl8/isolation-model";

describe("IsolationContext", () => {
  it("should create platform level context", () => {
    const context = IsolationContext.platform();

    expect(context.isEmpty()).toBe(true);
    expect(context.getIsolationLevel()).toBe(IsolationLevel.PLATFORM);
  });

  it("should build cache key correctly", () => {
    const context = IsolationContext.tenant(TenantId.create("t123"));
    const cacheKey = context.buildCacheKey("user", "list");

    expect(cacheKey).toBe("tenant:t123:user:list");
  });

  it("should validate organization context", () => {
    // 组织级上下文必须有租户
    expect(() => {
      IsolationContext.organization(
        undefined as any,
        OrganizationId.create("o456"),
      );
    }).toThrow("组织级上下文必须包含租户 ID");
  });
});
```

### 集成测试（实现库）

```typescript
// libs/nestjs-isolation/__tests__/integration/context-extraction.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import {
  IsolationModule,
  IsolationContextService,
} from "@hl8/nestjs-isolation";
import { IsolationLevel } from "@hl8/isolation-model";

describe("Context Extraction", () => {
  let module: TestingModule;
  let service: IsolationContextService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [IsolationModule.forRoot()],
    }).compile();

    service = module.get<IsolationContextService>(IsolationContextService);
  });

  it("should extract tenant context from headers", async () => {
    // 模拟请求
    const request = {
      headers: {
        "x-tenant-id": "t123",
      },
    };

    // 提取并设置上下文
    // ... (需要配合中间件测试)

    const context = service.getIsolationContext();
    expect(context?.getIsolationLevel()).toBe(IsolationLevel.TENANT);
  });
});
```

---

## 常见场景

### 场景 1: 构建数据库查询条件

```typescript
import { IsolationContext } from "@hl8/isolation-model";

const context = IsolationContext.department(
  TenantId.create("t123"),
  OrganizationId.create("o456"),
  DepartmentId.create("d789"),
);

// 生成 WHERE 子句
const where = context.buildWhereClause();
// 返回: { tenantId: 't123', organizationId: 'o456', departmentId: 'd789' }

// 使用 TypeORM
const users = await userRepository.find({ where });

// 使用 Prisma
const users = await prisma.user.findMany({ where });
```

### 场景 2: 生成缓存键

```typescript
import { IsolationContext } from "@hl8/isolation-model";

const context = IsolationContext.tenant(TenantId.create("t123"));

// 生成缓存键
const cacheKey = context.buildCacheKey("user", "profile:u999");
// 返回: tenant:t123:user:profile:u999

// 在 Redis 中使用
await redis.set(cacheKey, JSON.stringify(userProfile));
```

### 场景 3: 记录结构化日志

```typescript
import { IsolationContext } from "@hl8/isolation-model";

const context = IsolationContext.organization(
  TenantId.create("t123"),
  OrganizationId.create("o456"),
);

// 生成日志上下文
const logContext = context.buildLogContext();
// 返回: { tenantId: 't123', organizationId: 'o456' }

// 使用 Pino 记录日志
pino.info({
  ...logContext,
  message: "用户操作",
  action: "create_user",
});
```

### 场景 4: 权限验证

```typescript
import { IsolationContext, SharingLevel } from "@hl8/isolation-model";

// 用户上下文（部门级）
const userContext = IsolationContext.department(
  TenantId.create("t123"),
  OrganizationId.create("o456"),
  DepartmentId.create("d789"),
);

// 数据上下文（组织级共享）
const dataContext = IsolationContext.organization(
  TenantId.create("t123"),
  OrganizationId.create("o456"),
);

// 检查权限
const canAccess = userContext.canAccess(
  dataContext,
  true, // 共享数据
  SharingLevel.ORGANIZATION,
);

if (canAccess) {
  // 允许访问
  console.log("用户可以访问组织共享数据");
} else {
  throw new ForbiddenException("无权访问");
}
```

---

## NestJS 应用完整示例

### app.module.ts

```typescript
import { Module } from "@nestjs/common";
import { IsolationModule } from "@hl8/nestjs-isolation";

@Module({
  imports: [
    // 配置隔离模块
    IsolationModule.forRoot({
      global: true,
      autoRegisterMiddleware: true,
      extractionStrategy: "header",
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
```

### user.controller.ts

```typescript
import { Controller, Get } from "@nestjs/common";
import { RequireTenant, CurrentContext } from "@hl8/nestjs-isolation";
import { IsolationContext } from "@hl8/isolation-model";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequireTenant() // 自动验证租户上下文
  async getUsers(@CurrentContext() context: IsolationContext) {
    // 使用领域模型
    const where = context.buildWhereClause();
    return this.userService.findAll(where);
  }
}
```

### user.service.ts

```typescript
import { Injectable } from "@nestjs/common";
import { IsolationContextService } from "@hl8/nestjs-isolation";

@Injectable()
export class UserService {
  constructor(private readonly isolationService: IsolationContextService) {}

  async findAll(where?: any) {
    // 如果没有提供 where，从上下文生成
    if (!where) {
      const context = this.isolationService.getIsolationContext();
      where = context?.buildWhereClause() ?? {};
    }

    return this.userRepository.find({ where });
  }
}
```

---

## 故障排查

### 常见问题

#### 1. 隔离上下文缺失

**错误**:

```
BadRequestException: 隔离上下文缺失
```

**解决方案**:

- 检查请求头是否包含隔离标识（X-Tenant-Id 等）
- 检查 IsolationModule 是否正确配置
- 检查中间件是否自动注册（autoRegisterMiddleware: true）

#### 2. 组织上下文验证失败

**错误**:

```
IsolationValidationError: 组织级上下文必须包含租户 ID
```

**解决方案**:

- 确保创建组织级上下文时提供了 tenantId
- 检查静态工厂方法的参数顺序

#### 3. 依赖注入失败

**错误**:

```
Nest can't resolve dependencies of CacheService (?, ...)
```

**解决方案**:

- 确保 IsolationModule 已导入（或设置 global: true）
- 使用 @Inject('ISOLATION_CONTEXT_PROVIDER') 注入接口
- 检查 provide token 是否正确

---

## 最佳实践

### 1. 使用接口注入（推荐）

```typescript
// ✅ 推荐：依赖接口（零依赖）
constructor(
  @Inject('ISOLATION_CONTEXT_PROVIDER')
  private readonly contextProvider: IIsolationContextProvider,
) {}

// ❌ 避免：直接依赖实现（引入框架依赖）
constructor(
  private readonly contextService: IsolationContextService,
) {}
```

### 2. 提供默认平台级上下文

```typescript
// ✅ 推荐：提供默认上下文
const context = this.contextProvider.getIsolationContext()
  ?? IsolationContext.platform();

// ❌ 避免：假设上下文总是存在
const context = this.contextProvider.getIsolationContext();
context.buildCacheKey(...); // 可能为 undefined
```

### 3. 使用静态工厂方法

```typescript
// ✅ 推荐：使用静态工厂方法
const context = IsolationContext.tenant(TenantId.create("t123"));

// ❌ 避免：使用 new（构造函数是私有的）
const context = new IsolationContext(tenantId); // 编译错误
```

### 4. 值对象复用（Flyweight）

```typescript
// ✅ 推荐：复用值对象
const tenantId = TenantId.create("t123");
const context1 = IsolationContext.tenant(tenantId);
const context2 = IsolationContext.organization(tenantId, orgId);

// 两个上下文共享同一个 tenantId 实例
console.log(context1.tenantId === context2.tenantId); // true
```

---

## 架构优势

### 为什么要分离领域模型和实现？

**传统方式的问题**:

```
libs/nestjs-caching
  └── 依赖 libs/nestjs-isolation
       └── 依赖 nestjs-cls
       └── 依赖 @nestjs/common
       └── 依赖 class-validator

结果：caching 模块间接依赖了 NestJS！
```

**新架构的优势**:

```
libs/nestjs-caching
  └── 依赖 libs/isolation-model
       └── 零依赖！

libs/nestjs-isolation
  └── 依赖 libs/isolation-model
       └── 依赖 NestJS

结果：caching 模块零框架依赖！
```

**具体优势**:

1. ✅ caching、logging 等模块可以在任何环境使用
2. ✅ 减少依赖传递，降低包大小
3. ✅ 领域模型可以在浏览器环境使用
4. ✅ 可以为不同框架提供不同实现（Express、Koa 等）
5. ✅ 领域模型更容易测试（无外部依赖）

---

## 迁移指南

### 从 @hl8/platform 迁移

```typescript
// 旧方式
import { IsolationContext } from "@hl8/platform";

// 新方式
import { IsolationContext } from "@hl8/isolation-model";
```

### 从 nestjs-infra 迁移

```typescript
// 旧方式
import { IsolationModule } from "@hl8/nestjs-infra";

// 新方式（NestJS 应用）
import { IsolationModule } from "@hl8/nestjs-isolation";

// 新方式（业务库）
import { IsolationContext } from "@hl8/isolation-model";
```

---

## 下一步

- 📖 阅读 [API 文档](./contracts/isolation-api.md)
- 📊 了解 [数据模型](./isolation-data-model.md)
- 🔬 查看 [研究报告](./isolation-research.md)
- 🏗️ 查看 [架构设计](./isolation-plan.md)

---

## 获取帮助

- **问题反馈**: [GitHub Issues](https://github.com/hl8/hl8-saas-platform-turborepo/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/hl8/hl8-saas-platform-turborepo/discussions)

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 快速开始文档完成
