# @hl8/isolation-model

纯领域模型库 - 多层级数据隔离（零依赖，框架无关）

---

## ⚠️ 重要说明

### 纯领域模型库

本库是**纯领域模型**，不包含任何框架依赖。

**关键点**：

- ✅ **零依赖**：不依赖任何第三方库
- ✅ **框架无关**：可在 NestJS、Express、Koa、纯 Node.js 等任何环境使用
- ✅ **DDD 设计**：充血模型，封装业务逻辑
- ✅ **值对象**：ID 使用值对象模式，保证不可变性
- ✅ **类型安全**：完整的 TypeScript 类型定义

**使用场景**：

- 被 `@hl8/nestjs-isolation` 使用（NestJS 实现）
- 被 `@hl8/caching` 使用（构建缓存 key）
- 被 `@hl8/logging` 使用（日志上下文）
- 可在任何需要数据隔离的地方使用

---

## 📚 目录

- [重要说明](#-重要说明)
- [概述](#-概述)
- [特性](#-特性)
- [为什么零依赖](#-为什么零依赖)
- [安装](#-安装)
- [快速开始](#-快速开始)
- [核心概念](#-核心概念)
- [值对象](#-值对象)
- [隔离上下文](#-隔离上下文)
- [API 文档](#-api-文档)
- [使用场景](#-使用场景)
- [常见问题](#-常见问题)
- [最佳实践](#-最佳实践)
- [架构设计](#️-架构设计)
- [相关链接](#-相关链接)

---

## 📋 概述

`@hl8/isolation-model` 是一个纯领域模型库，提供多层级数据隔离的核心抽象，特点：

- ✅ **零依赖**：不依赖任何第三方库，包体积最小
- ✅ **框架无关**：可在任何 TypeScript 环境使用
- ✅ **DDD 设计**：充血模型，封装业务逻辑
- ✅ **5 层隔离**：平台、租户、组织、部门、用户
- ✅ **值对象模式**：ID 不可变，类型安全
- ✅ **领域事件**：支持上下文创建、切换、访问拒绝事件
- ✅ **完整类型**：完整的 TypeScript 类型定义

## ✨ 特性

### 核心抽象

- ✅ **IsolationContext**：隔离上下文实体
- ✅ **IsolationLevel**：5 个隔离层级枚举
- ✅ **ID 值对象**：TenantId、OrganizationId、DepartmentId、UserId
- ✅ **领域事件**：ContextCreatedEvent、ContextSwitchedEvent、AccessDeniedEvent
- ✅ **验证器接口**：IsolationValidator

### 设计特性

- ✅ **不可变性**：所有值对象和上下文都是不可变的
- ✅ **类型安全**：利用 TypeScript 类型系统
- ✅ **业务逻辑封装**：隔离规则封装在模型中
- ✅ **零依赖**：不引入任何外部依赖
- ✅ **可测试性**：纯函数，易于单元测试

---

## 🎯 为什么零依赖？

### 依赖倒置原则

```
业务库（@hl8/caching, @hl8/logging）
  ↓ 依赖
领域模型（@hl8/isolation-model）← 零依赖
```

**如果有依赖**：

```
❌ @hl8/caching 依赖 @hl8/isolation-model
   @hl8/isolation-model 依赖 某个库X
   → @hl8/caching 间接依赖 库X（依赖传递）
```

**零依赖的好处**：

```
✅ @hl8/caching 依赖 @hl8/isolation-model（零依赖）
   → @hl8/caching 无间接依赖
   → 包体积最小
   → 无版本冲突
```

### 跨框架使用

因为零依赖，可以在任何环境使用：

- ✅ NestJS 应用（`@hl8/nestjs-isolation`）
- ✅ Express 应用
- ✅ Koa 应用
- ✅ 纯 Node.js 应用
- ✅ 浏览器（如果需要）
- ✅ 测试环境

### 包体积

```bash
# 零依赖的包体积
@hl8/isolation-model: ~15KB

# 如果有依赖（假设）
@hl8/isolation-model + 依赖: ~500KB+
```

---

## 📦 安装

```bash
pnpm add @hl8/isolation-model
```

**无需安装其他依赖** ✅

---

## 🚀 快速开始

### 创建隔离上下文

```typescript
import {
  IsolationContext,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from '@hl8/isolation-model';

// 1. 平台级（无隔离）
const platformContext = IsolationContext.platform();

// 2. 租户级
const tenantContext = IsolationContext.tenant(TenantId.create('tenant-123'));

// 3. 组织级
const orgContext = IsolationContext.organization(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
);

// 4. 部门级
const deptContext = IsolationContext.department(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
  DepartmentId.create('dept-789'),
);

// 5. 用户级
const userContext = IsolationContext.user(
  UserId.create('user-001'),
  TenantId.create('tenant-123'), // 可选
);
```

### 使用隔离上下文

```typescript
// 检查层级
if (context.isTenantLevel()) {
  console.log('Tenant ID:', context.tenantId?.value);
}

// 构建缓存 key
const cacheKey = context.buildCacheKey('user', 'list');
// tenant:tenant-123:user:list

// 获取层级
console.log('Level:', context.level); // IsolationLevel.TENANT
```

---

## 📚 核心概念

### 5 个隔离层级

```
IsolationLevel（枚举）

PLATFORM = 0       ← 最低层级，无隔离
  ↓
TENANT = 1         ← 按租户隔离
  ↓
ORGANIZATION = 2   ← 按组织隔离
  ↓
DEPARTMENT = 3     ← 按部门隔离
  ↓
USER = 4           ← 按用户隔离
```

#### 层级规则

| 层级             | 必需字段                                     | 可选字段   | 使用场景           |
| ---------------- | -------------------------------------------- | ---------- | ------------------ |
| **PLATFORM**     | -                                            | -          | 系统管理、全局数据 |
| **TENANT**       | `tenantId`                                   | -          | 多租户 SAAS        |
| **ORGANIZATION** | `tenantId`, `organizationId`                 | -          | 大型企业           |
| **DEPARTMENT**   | `tenantId`, `organizationId`, `departmentId` | -          | 部门管理           |
| **USER**         | `userId`                                     | `tenantId` | 个人数据           |

---

### 值对象（Value Objects）

所有 ID 都使用值对象模式，确保：

- **不可变性**：创建后不可修改
- **值相等**：基于值比较，不是引用
- **类型安全**：不同类型的 ID 不能混用
- **验证逻辑**：ID 格式验证封装在值对象中

#### ID 值对象

```typescript
// TenantId - 租户 ID
const tenantId = TenantId.create('tenant-123');
console.log(tenantId.value); // 'tenant-123'

// OrganizationId - 组织 ID
const orgId = OrganizationId.create('org-456');

// DepartmentId - 部门 ID
const deptId = DepartmentId.create('dept-789');

// UserId - 用户 ID
const userId = UserId.create('user-001');

// EntityId - 通用实体 ID（基类）
const entityId = EntityId.create('entity-123');
```

#### 值对象特性

```typescript
// 1. 不可变性
const tenantId = TenantId.create('tenant-123');
// tenantId.value = 'other';  // ❌ 编译错误，只读属性

// 2. 值相等
const id1 = TenantId.create('tenant-123');
const id2 = TenantId.create('tenant-123');
console.log(id1.equals(id2)); // true（值相等）
console.log(id1 === id2); // false（不同对象）

// 3. 类型安全
const tenantId = TenantId.create('tenant-123');
const orgId = OrganizationId.create('tenant-123');
// tenantId === orgId  // ❌ 编译错误，类型不匹配
```

---

## 🎯 隔离上下文

### IsolationContext 实体

隔离上下文是核心实体，封装了隔离业务逻辑。

#### 创建方式

```typescript
// 静态工厂方法
IsolationContext.platform()
IsolationContext.tenant(tenantId)
IsolationContext.organization(tenantId, organizationId)
IsolationContext.department(tenantId, organizationId, departmentId)
IsolationContext.user(userId, tenantId?)
```

#### 属性和方法

```typescript
interface IsolationContext {
  // 属性
  readonly level: IsolationLevel;
  readonly tenantId?: TenantId;
  readonly organizationId?: OrganizationId;
  readonly departmentId?: DepartmentId;
  readonly userId?: UserId;

  // 层级判断
  isPlatformLevel(): boolean;
  isTenantLevel(): boolean;
  isOrganizationLevel(): boolean;
  isDepartmentLevel(): boolean;
  isUserLevel(): boolean;

  // 工具方法
  buildCacheKey(...parts: string[]): string;
  buildDatabaseFilter(): Record<string, any>;
  canAccess(requiredLevel: IsolationLevel): boolean;
}
```

### 构建缓存 Key

```typescript
const context = IsolationContext.tenant(TenantId.create('tenant-123'));

// 构建缓存 key
const userListKey = context.buildCacheKey('user', 'list');
// → 'tenant:tenant-123:user:list'

const userDetailKey = context.buildCacheKey('user', 'detail', 'user-001');
// → 'tenant:tenant-123:user:detail:user-001'

// 不同层级的 key 格式
platformContext.buildCacheKey('config');
// → 'platform:config'

orgContext.buildCacheKey('employee', 'list');
// → 'tenant:tenant-123:org:org-456:employee:list'
```

### 构建数据库过滤条件

```typescript
const context = IsolationContext.organization(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
);

const filter = context.buildDatabaseFilter();
// →  {
//      tenantId: 'tenant-123',
//      organizationId: 'org-456'
//    }

// 用于数据库查询
const users = await userRepo.find({
  where: filter, // 自动过滤租户和组织
});
```

### 访问权限检查

```typescript
const context = IsolationContext.tenant(TenantId.create('tenant-123'));

// 检查是否满足访问要求
context.canAccess(IsolationLevel.PLATFORM); // true
context.canAccess(IsolationLevel.TENANT); // true
context.canAccess(IsolationLevel.ORGANIZATION); // false（层级不够）
```

---

## 📖 API 文档

### 值对象 API

#### TenantId

```typescript
class TenantId extends EntityId {
  // 创建租户 ID
  static create(value: string): TenantId;

  // 属性
  readonly value: string;

  // 方法
  equals(other: TenantId): boolean;
  toString(): string;
}

// 使用
const tenantId = TenantId.create('tenant-123');
console.log(tenantId.value); // 'tenant-123'
console.log(tenantId.toString()); // 'tenant-123'
```

#### OrganizationId

```typescript
class OrganizationId extends EntityId {
  static create(value: string): OrganizationId;
  readonly value: string;
  equals(other: OrganizationId): boolean;
  toString(): string;
}
```

#### DepartmentId

```typescript
class DepartmentId extends EntityId {
  static create(value: string): DepartmentId;
  readonly value: string;
  equals(other: DepartmentId): boolean;
  toString(): string;
}
```

#### UserId

```typescript
class UserId extends EntityId {
  static create(value: string): UserId;
  readonly value: string;
  equals(other: UserId): boolean;
  toString(): string;
}
```

---

### 隔离上下文 API

#### 静态工厂方法

```typescript
class IsolationContext {
  // 创建平台级上下文
  static platform(): IsolationContext;

  // 创建租户级上下文
  static tenant(tenantId: TenantId): IsolationContext;

  // 创建组织级上下文
  static organization(
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext;

  // 创建部门级上下文
  static department(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext;

  // 创建用户级上下文
  static user(userId: UserId, tenantId?: TenantId): IsolationContext;
}
```

#### 实例方法

```typescript
// 层级判断
isPlatformLevel(): boolean
isTenantLevel(): boolean
isOrganizationLevel(): boolean
isDepartmentLevel(): boolean
isUserLevel(): boolean

// 构建缓存 key
buildCacheKey(...parts: string[]): string

// 构建数据库过滤条件
buildDatabaseFilter(): Record<string, any>

// 访问权限检查
canAccess(requiredLevel: IsolationLevel): boolean

// 获取层级
getLevel(): IsolationLevel
```

---

### 枚举 API

#### IsolationLevel

```typescript
enum IsolationLevel {
  PLATFORM = 0, // 平台级
  TENANT = 1, // 租户级
  ORGANIZATION = 2, // 组织级
  DEPARTMENT = 3, // 部门级
  USER = 4, // 用户级
}
```

#### SharingLevel

```typescript
enum SharingLevel {
  PRIVATE = 0, // 私有（仅创建者）
  DEPARTMENT = 1, // 部门共享
  ORGANIZATION = 2, // 组织共享
  TENANT = 3, // 租户共享
  PUBLIC = 4, // 公开
}
```

---

## 🎯 使用场景

### 场景1：缓存 Key 构建

```typescript
import { IsolationContext, TenantId } from '@hl8/isolation-model';

// 在缓存服务中
class CacheService {
  async get(key: string, context: IsolationContext) {
    // 根据隔离上下文构建完整的 key
    const fullKey = context.buildCacheKey('cache', key);
    return this.redis.get(fullKey);
  }
}

// 使用
const context = IsolationContext.tenant(TenantId.create('tenant-123'));
const userList = await cacheService.get('user:list', context);
// 实际 key: 'tenant:tenant-123:cache:user:list'
```

---

### 场景2：数据库查询过滤

```typescript
import { IsolationContext } from '@hl8/isolation-model';

class UserRepository {
  async findAll(context: IsolationContext) {
    // 自动根据上下文构建过滤条件
    const filter = context.buildDatabaseFilter();

    // filter = { tenantId: 'tenant-123' }
    return this.db.users.find({ where: filter });
  }
}
```

---

### 场景3：日志上下文

```typescript
import { IsolationContext } from '@hl8/isolation-model';

class Logger {
  log(message: string, context: IsolationContext) {
    console.log({
      message,
      level: context.level,
      tenantId: context.tenantId?.value,
      organizationId: context.organizationId?.value,
      timestamp: new Date(),
    });
  }
}
```

---

### 场景4：访问控制

```typescript
import { IsolationContext, IsolationLevel } from '@hl8/isolation-model';

class AccessControl {
  canAccessResource(
    userContext: IsolationContext,
    requiredLevel: IsolationLevel,
  ): boolean {
    return userContext.canAccess(requiredLevel);
  }
}

// 使用
const userContext = IsolationContext.tenant(TenantId.create('tenant-123'));

// 可以访问平台级和租户级资源
accessControl.canAccessResource(userContext, IsolationLevel.PLATFORM); // true
accessControl.canAccessResource(userContext, IsolationLevel.TENANT); // true

// 不能访问组织级资源（层级不够）
accessControl.canAccessResource(userContext, IsolationLevel.ORGANIZATION); // false
```

---

### 场景5：在 NestJS 中使用

```typescript
// 与 @hl8/nestjs-isolation 集成
import { IsolationContext } from '@hl8/isolation-model';
import { CurrentContext } from '@hl8/nestjs-isolation';

@Controller('users')
export class UserController {
  @Get()
  async getUsers(@CurrentContext() context: IsolationContext) {
    // context 是 @hl8/isolation-model 的实体

    if (context.isTenantLevel()) {
      return this.userService.findByTenant(context.tenantId);
    }

    // ...
  }
}
```

---

## ❓ 常见问题

### Q1: 为什么使用值对象而不是简单字符串？

**A**: 值对象提供了更多保障：

```typescript
// ❌ 使用字符串的问题
function findUser(tenantId: string, userId: string) {
  // 容易搞混参数顺序
  return db.find(userId, tenantId); // ← 顺序错了！
}

// ✅ 使用值对象
function findUser(tenantId: TenantId, userId: UserId) {
  // 类型不匹配，编译器会报错
  return db.find(userId, tenantId); // ✅ 类型检查
}
```

**值对象的优势**：

- ✅ 类型安全
- ✅ 不可变性
- ✅ 封装验证逻辑
- ✅ 语义清晰

---

### Q2: 为什么是实体（Entity）而不是简单对象？

**A**: 实体封装了业务逻辑：

```typescript
// ❌ 简单对象
interface IsolationContext {
  level: number;
  tenantId?: string;
}

const context = { level: 1, tenantId: 'tenant-123' };

// 需要自己构建 cacheKey
const cacheKey = `tenant:${context.tenantId}:user:list`;

// ✅ 实体（充血模型）
const context = IsolationContext.tenant(TenantId.create('tenant-123'));

// 业务逻辑封装在实体中
const cacheKey = context.buildCacheKey('user', 'list');

// 优势：
// ✅ 业务逻辑集中
// ✅ 易于测试
// ✅ 易于维护
// ✅ 避免重复代码
```

---

### Q3: 如何验证 ID 格式？

**A**: ID 验证逻辑封装在值对象中：

```typescript
// 值对象内部验证
class TenantId extends EntityId {
  static create(value: string): TenantId {
    // 验证逻辑（可以根据需要自定义）
    if (!value || value.trim() === '') {
      throw new IsolationValidationError('Tenant ID cannot be empty');
    }

    return new TenantId(value);
  }
}

// 使用时自动验证
try {
  const tenantId = TenantId.create(''); // ← 抛出错误
} catch (error) {
  console.error(error.message); // 'Tenant ID cannot be empty'
}
```

---

### Q4: IsolationContext 可以修改吗？

**A**: 不可以，IsolationContext 是不可变的：

```typescript
const context = IsolationContext.tenant(TenantId.create('tenant-123'));

// ❌ 不能修改
// context.tenantId = TenantId.create('other');  // 编译错误

// ✅ 如果需要不同的上下文，创建新的
const newContext = IsolationContext.tenant(TenantId.create('tenant-456'));
```

**不可变的好处**：

- ✅ 线程安全
- ✅ 易于理解
- ✅ 避免意外修改
- ✅ 可以安全地共享

---

### Q5: 如何在非 NestJS 环境使用？

**A**: 直接导入使用，无需任何框架：

```typescript
// 在 Express 中
import { IsolationContext, TenantId } from '@hl8/isolation-model';

app.get('/users', (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  const context = IsolationContext.tenant(TenantId.create(tenantId));

  const users = await userService.findByContext(context);
  res.json(users);
});

// 在纯 Node.js 中
const context = IsolationContext.tenant(TenantId.create('tenant-123'));
const cacheKey = context.buildCacheKey('data');
```

---

### Q6: 领域事件有什么用？

**A**: 领域事件用于追踪和审计：

```typescript
import {
  ContextCreatedEvent,
  ContextSwitchedEvent,
} from '@hl8/isolation-model';

// 上下文创建事件
const event = new ContextCreatedEvent(context, new Date(), {
  source: 'api-request',
});

// 可以用于：
// - 审计日志
// - 事件溯源
// - 安全监控
```

---

## 🎨 最佳实践

### 1. 使用静态工厂方法创建

```typescript
// ✅ 好的做法
const context = IsolationContext.tenant(TenantId.create('tenant-123'));

// ❌ 避免直接 new（构造函数可能是私有的）
// const context = new IsolationContext(...);
```

---

### 2. 使用类型安全的方式

```typescript
// ✅ 好的做法
if (context.isTenantLevel()) {
  const tenantId: TenantId = context.tenantId!; // 类型安全
  console.log(tenantId.value);
}

// ❌ 避免
const tenantId = context.tenantId?.value || 'default'; // 不应该有默认值
```

---

### 3. 封装业务逻辑

```typescript
// ✅ 好的做法：使用实体的方法
const cacheKey = context.buildCacheKey('user', 'list');

// ❌ 避免：自己构建
const cacheKey = `${context.level}:${context.tenantId?.value}:user:list`;
```

---

### 4. 利用不可变性

```typescript
// ✅ 好的做法：利用不可变性，安全地共享
class Service {
  private context: IsolationContext;

  setContext(context: IsolationContext) {
    this.context = context; // 安全，因为不可变
  }
}
```

---

### 5. 使用值相等比较

```typescript
// ✅ 好的做法
const id1 = TenantId.create('tenant-123');
const id2 = TenantId.create('tenant-123');

if (id1.equals(id2)) {
  console.log('Same tenant');
}

// ❌ 避免
if (id1 === id2) {
  // 永远是 false（不同对象）
  // ...
}
```

---

## 🏗️ 架构设计

### 模块结构

```
libs/isolation-model/src/
├── entities/                # 实体
│   └── isolation-context.entity.ts
│
├── value-objects/           # 值对象
│   ├── entity-id.vo.ts      # 基类
│   ├── tenant-id.vo.ts
│   ├── organization-id.vo.ts
│   ├── department-id.vo.ts
│   └── user-id.vo.ts
│
├── enums/                   # 枚举
│   ├── isolation-level.enum.ts
│   └── sharing-level.enum.ts
│
├── events/                  # 领域事件
│   ├── context-created.event.ts
│   ├── context-switched.event.ts
│   └── access-denied.event.ts
│
├── interfaces/              # 接口
│   ├── isolation-context-provider.interface.ts
│   ├── isolation-validator.interface.ts
│   └── data-access-context.interface.ts
│
├── errors/                  # 错误
│   └── isolation-validation.error.ts
│
└── index.ts                 # 导出
```

### DDD 模式应用

| DDD 模式     | 实现                            | 说明               |
| ------------ | ------------------------------- | ------------------ |
| **实体**     | `IsolationContext`              | 有标识符和生命周期 |
| **值对象**   | `TenantId`, `OrganizationId` 等 | 不可变，值相等     |
| **领域事件** | `ContextCreatedEvent` 等        | 领域发生的事件     |
| **枚举**     | `IsolationLevel`                | 类型安全的常量     |
| **接口**     | `IsolationValidator` 等         | 依赖倒置           |

---

## 📚 相关链接

### 项目文档

- [API 文档](../../specs/001-hl8-nestjs-enhance/contracts/isolation-api.md)
- [数据模型](../../specs/001-hl8-nestjs-enhance/isolation-data-model.md)
- [快速开始](../../specs/001-hl8-nestjs-enhance/isolation-quickstart.md)

### 相关模块

- [@hl8/nestjs-isolation](../nestjs-isolation) - NestJS 实现（依赖本库）
- [@hl8/caching](../caching) - 缓存模块（使用本库）
- [@hl8/exceptions](../exceptions) - 异常处理（使用本库的错误类）

### DDD 资源

- [领域驱动设计（DDD）](https://martinfowler.com/tags/domain%20driven%20design.html)
- [值对象模式](https://martinfowler.com/bliki/ValueObject.html)
- [充血模型 vs 贫血模型](https://martinfowler.com/bliki/AnemicDomainModel.html)

---

## 📄 License

MIT © HL8 Team
