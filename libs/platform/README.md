# @hl8/platform

**HL8 平台核心业务逻辑** - 无框架依赖的纯领域模型

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/hl8/platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Framework](https://img.shields.io/badge/Framework-Agnostic-green.svg)](.)

---

## ⚡ 核心特性

### 1. 无框架依赖 🎯
- ✅ 纯 TypeScript
- ✅ 可用于任何环境（Node.js, Browser, Deno）
- ✅ 可用于任何框架（NestJS, Express, Koa, Fastify）

### 2. 领域驱动设计 (DDD) 📐
- ✅ 值对象 (Value Objects)
- ✅ 实体 (Entities)
- ✅ 领域异常 (Domain Exceptions)
- ✅ 充血模型 (Rich Domain Model)

### 3. 高度可测试 ✨
- ✅ 无外部依赖
- ✅ 纯函数式
- ✅ 易于 Mock

---

## 📦 包含的模块

### 值对象 (Value Objects)

```typescript
import {
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from '@hl8/platform';

// 生成新 ID
const tenantId = TenantId.generate();

// 从字符串创建
const userId = UserId.create('123e4567-e89b-42d3-9456-426614174003');

// 相等性比较
tenantId1.equals(tenantId2);  // boolean
```

### 实体 (Entities)

```typescript
import { IsolationContext, TenantId, UserId } from '@hl8/platform';

// 创建租户级隔离上下文
const context = IsolationContext.createTenant(
  TenantId.create('...')
);

// 创建用户级隔离上下文
const userContext = IsolationContext.createUser(
  tenantId,
  organizationId,
  departmentId,
  userId
);

// 获取隔离级别
context.getIsolationLevel();  // IsolationLevel.TENANT

// 验证上下文
context.validate();  // boolean
```

### 枚举 (Enums)

```typescript
import { IsolationLevel, DataSharingLevel } from '@hl8/platform';

// 5 级数据隔离
IsolationLevel.PLATFORM
IsolationLevel.TENANT
IsolationLevel.ORGANIZATION
IsolationLevel.DEPARTMENT
IsolationLevel.USER

// 数据共享级别
DataSharingLevel.PLATFORM
DataSharingLevel.TENANT
DataSharingLevel.ORGANIZATION
DataSharingLevel.DEPARTMENT
DataSharingLevel.PRIVATE
```

### 异常 (Exceptions)

```typescript
import {
  AbstractHttpException,
  GeneralNotFoundException,
  TenantNotFoundException,
} from '@hl8/platform';

// 抛出业务异常
throw new TenantNotFoundException(tenantId.value, '租户不存在');

// 转换为 RFC7807 格式
const problemDetails = exception.toRFC7807();
```

---

## 🚀 使用场景

### 场景 1: NestJS 应用

```typescript
import { EntityId, IsolationContext } from '@hl8/platform';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  createUser(context: IsolationContext) {
    // 使用核心业务逻辑
  }
}
```

### 场景 2: Express 应用

```typescript
import { TenantId, TenantNotFoundException } from '@hl8/platform';

app.get('/tenants/:id', (req, res) => {
  const tenantId = TenantId.create(req.params.id);
  // ...
});
```

### 场景 3: Browser/Frontend

```typescript
import { EntityId } from '@hl8/platform';

// 在前端验证 ID 格式
if (EntityId.isValid(userId)) {
  // ...
}
```

### 场景 4: Microservices

```typescript
import { IsolationContext, IsolationLevel } from '@hl8/platform';

// 在不同微服务间传递隔离上下文
const context = IsolationContext.createTenant(tenantId);
// 序列化传递...
```

---

## 📊 架构位置

```
应用层 (apps/)
    ↓ depends on
框架适配层 (libs/nestjs-*)
    ↓ depends on
@hl8/platform (核心层) ← 本项目
    ↓ no dependencies
纯 TypeScript
```

**特点**:
- ⚡ 无任何框架依赖
- ✅ 可在任何地方使用
- ✅ 高度可测试
- ✅ 易于复用

---

## 🎯 设计原则

### 1. 领域驱动设计 (DDD)

**值对象 (Value Objects)**:
- 不可变性
- 相等性基于值
- 自我验证

**实体 (Entities)**:
- 唯一标识
- 生命周期
- 业务规则封装

### 2. 充血模型 (Rich Domain Model)

```typescript
// ✅ 业务逻辑在领域对象中
class IsolationContext {
  validate(): boolean {
    // 业务规则验证
  }
  
  getIsolationLevel(): IsolationLevel {
    // 业务逻辑
  }
}

// ❌ 不是贫血模型
// class IsolationContext {
//   tenantId: string;  // 只有数据，无逻辑
// }
```

### 3. 无框架依赖

```json
{
  "dependencies": {}  // ← 零依赖！
}
```

**好处**:
- ✅ 可在任何环境运行
- ✅ 测试极其简单
- ✅ 永不过时

---

## 📝 API 参考

详见源码中的 TSDoc 注释（100% 覆盖）

---

## 🔗 相关项目

- **@hl8/nestjs-infra**: NestJS 通用模块（依赖本项目）
- **@hl8/nestjs-fastify**: Fastify 专用模块（依赖本项目）

---

**纯粹的业务逻辑，可在任何地方使用！** ⚡

