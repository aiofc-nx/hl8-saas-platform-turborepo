# Data Model: Isolation 数据隔离模块

**Date**: 2025-10-12  
**Feature**: 拆分 Isolation 数据隔离模块为独立库项目  
**Spec**: [spec.md](./spec.md) | **Plan**: [isolation-plan.md](./isolation-plan.md) | **Research**: [isolation-research.md](./isolation-research.md)

## 概述

本文档定义 Isolation 模块的核心数据模型，分为两个层次：

1. **领域模型库** (`@hl8/isolation-model`) - 零依赖的纯领域模型，框架无关
2. **实现库** (`@hl8/nestjs-isolation`) - NestJS 框架实现

所有领域模型遵循 DDD 充血模型原则，业务规则封装在领域对象内部。

---

## 核心架构

### 依赖倒置原则 (DIP)

```text
┌──────────────────────────────────────┐
│  业务库（High-Level）                 │
│  @hl8/nestjs-caching                 │
│  @hl8/nestjs-logging                 │
│  @hl8/nestjs-database                │
└────────────┬─────────────────────────┘
             │ 依赖（仅接口）
             ↓
┌──────────────────────────────────────┐
│  领域模型库（Abstract）               │
│  @hl8/isolation-model                │
│  - 零依赖                             │
│  - 纯TypeScript                       │
│  - 接口 + 实体 + 值对象               │
└──────────────────────────────────────┘
             ↑ 实现
             │
┌──────────────────────────────────────┐
│  实现库（Concrete）                   │
│  @hl8/nestjs-isolation               │
│  - 依赖 NestJS                        │
│  - 依赖 nestjs-cls                    │
└──────────────────────────────────────┘
```

---

## 领域模型库（@hl8/isolation-model）

### 值对象（Value Objects）

#### TenantId (租户 ID 值对象)

**职责**: 封装租户标识符的验证和比较逻辑

**属性**:

| 属性    | 类型     | 描述               | 必需 |
| ------- | -------- | ------------------ | ---- |
| `value` | `string` | 租户 ID 值（只读） | ✅   |

**业务规则**:

- 非空字符串
- 长度 1-50 字符
- 只能包含字母、数字、下划线、连字符
- 格式示例: `t123`, `tenant_abc`, `org-456`

**静态工厂方法**:

```typescript
TenantId.create(value: string): TenantId
```

**实例方法**:

```typescript
getValue(): string           // 获取值
equals(other?: TenantId): boolean  // 值对象相等性比较
toString(): string           // 字符串表示
```

**实现示例**:

```typescript
export class TenantId {
  private static cache = new Map<string, TenantId>(); // Flyweight 模式

  private constructor(private readonly value: string) {
    this.validate();
  }

  static create(value: string): TenantId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new TenantId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  private validate(): void {
    if (!this.value || typeof this.value !== "string") {
      throw new IsolationValidationError(
        "租户 ID 必须是非空字符串",
        "INVALID_TENANT_ID",
      );
    }

    if (this.value.length > 50) {
      throw new IsolationValidationError(
        "租户 ID 长度不能超过 50 字符",
        "TENANT_ID_TOO_LONG",
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(this.value)) {
      throw new IsolationValidationError(
        "租户 ID 只能包含字母、数字、下划线和连字符",
        "INVALID_TENANT_ID_FORMAT",
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other?: TenantId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

---

#### OrganizationId (组织 ID 值对象)

**职责**: 封装组织标识符的验证和比较逻辑

**属性**: 同 TenantId

**业务规则**: 同 TenantId

**API**: 同 TenantId

---

#### DepartmentId (部门 ID 值对象)

**职责**: 封装部门标识符的验证和比较逻辑

**属性**: 同 TenantId

**业务规则**: 同 TenantId

**API**: 同 TenantId

---

#### UserId (用户 ID 值对象)

**职责**: 封装用户标识符的验证和比较逻辑

**属性**: 同 TenantId

**业务规则**: 同 TenantId

**API**: 同 TenantId

---

### 领域实体（Entities）

#### IsolationContext (隔离上下文实体)

**职责**: 封装多层级数据隔离的核心业务逻辑

**属性**:

| 属性             | 类型              | 描述              | 必需 |
| ---------------- | ----------------- | ----------------- | ---- |
| `tenantId`       | `TenantId?`       | 租户 ID（值对象） | ❌   |
| `organizationId` | `OrganizationId?` | 组织 ID（值对象） | ❌   |
| `departmentId`   | `DepartmentId?`   | 部门 ID（值对象） | ❌   |
| `userId`         | `UserId?`         | 用户 ID（值对象） | ❌   |

**业务规则**:

**层级判断规则**:

- 有 departmentId → DEPARTMENT 级
- 有 organizationId → ORGANIZATION 级
- 有 tenantId → TENANT 级
- 有 userId（无租户）→ USER 级
- 都没有 → PLATFORM 级

**验证规则**:

- 组织级必须有租户 ID
- 部门级必须有租户 ID 和组织 ID
- 所有 ID 值对象必须有效

**访问权限规则**:

- 平台级上下文可访问所有数据
- 非共享数据：必须完全匹配隔离上下文
- 共享数据：检查共享级别是否允许

**静态工厂方法**:

```typescript
IsolationContext.platform(): IsolationContext
IsolationContext.tenant(tenantId: TenantId): IsolationContext
IsolationContext.organization(tenantId: TenantId, organizationId: OrganizationId): IsolationContext
IsolationContext.department(tenantId: TenantId, organizationId: OrganizationId, departmentId: DepartmentId): IsolationContext
IsolationContext.user(userId: UserId, tenantId?: TenantId): IsolationContext
```

**核心方法**（业务逻辑）:

```typescript
// 层级判断
getIsolationLevel(): IsolationLevel

// 状态检查
isEmpty(): boolean
isTenantLevel(): boolean
isOrganizationLevel(): boolean
isDepartmentLevel(): boolean
isUserLevel(): boolean

// 缓存键生成（供 caching 模块使用）
buildCacheKey(namespace: string, key: string): string

// 日志上下文生成（供 logging 模块使用）
buildLogContext(): Record<string, string>

// 数据库查询条件生成（供 database 模块使用）
buildWhereClause(): Record<string, string>

// 权限验证（核心业务逻辑）
canAccess(dataContext: IsolationContext, isShared: boolean, sharingLevel?: SharingLevel): boolean

// 上下文切换
switchOrganization(newOrganizationId: OrganizationId): IsolationContext
switchDepartment(newDepartmentId: DepartmentId): IsolationContext
```

**使用示例**:

```typescript
// 示例 1: 创建租户级上下文
const tenantId = TenantId.create("t123");
const context = IsolationContext.tenant(tenantId);

console.log(context.getIsolationLevel()); // IsolationLevel.TENANT
console.log(context.buildCacheKey("user", "list"));
// 输出: tenant:t123:user:list

// 示例 2: 创建部门级上下文
const orgId = OrganizationId.create("o456");
const deptId = DepartmentId.create("d789");
const deptContext = IsolationContext.department(tenantId, orgId, deptId);

console.log(deptContext.buildLogContext());
// 输出: { tenantId: 't123', organizationId: 'o456', departmentId: 'd789' }

// 示例 3: 权限验证
const userContext = IsolationContext.department(tenantId, orgId, deptId);
const dataContext = IsolationContext.organization(tenantId, orgId);

const canAccess = userContext.canAccess(
  dataContext,
  true, // 共享数据
  SharingLevel.ORGANIZATION,
);
console.log(canAccess); // true（用户在组织内，可访问组织共享数据）
```

---

### 枚举（Enums）

#### IsolationLevel (隔离级别)

```typescript
/**
 * 隔离级别枚举
 *
 * @description 定义 5 个数据隔离层级
 *
 * @since 1.0.0
 */
export enum IsolationLevel {
  /** 平台级 - 跨租户 */
  PLATFORM = "platform",

  /** 租户级 - 租户内 */
  TENANT = "tenant",

  /** 组织级 - 组织内 */
  ORGANIZATION = "organization",

  /** 部门级 - 部门内 */
  DEPARTMENT = "department",

  /** 用户级 - 用户私有 */
  USER = "user",
}
```

---

#### SharingLevel (共享级别)

```typescript
/**
 * 共享级别枚举
 *
 * @description 定义数据的共享范围
 *
 * @since 1.0.0
 */
export enum SharingLevel {
  /** 平台共享 - 所有租户可访问 */
  PLATFORM = "platform",

  /** 租户共享 - 租户内所有用户可访问 */
  TENANT = "tenant",

  /** 组织共享 - 组织内所有用户可访问 */
  ORGANIZATION = "organization",

  /** 部门共享 - 部门内所有用户可访问 */
  DEPARTMENT = "department",

  /** 用户私有 - 仅用户本人可访问 */
  USER = "user",
}
```

---

### 接口（Interfaces）

#### IIsolationContextProvider (上下文提供者接口)

**描述**: 定义上下文存储和获取的接口

```typescript
/**
 * 隔离上下文提供者接口
 *
 * @description 定义上下文存储和获取的标准接口
 *
 * ## 实现要求
 *
 * - 必须支持请求级上下文存储
 * - 必须线程安全（Node.js 异步安全）
 * - 获取操作无副作用
 *
 * @since 1.0.0
 */
export interface IIsolationContextProvider {
  /**
   * 获取当前隔离上下文
   *
   * @returns 隔离上下文，不存在返回 undefined
   */
  getIsolationContext(): IsolationContext | undefined;

  /**
   * 设置隔离上下文
   *
   * @param context - 隔离上下文
   */
  setIsolationContext(context: IsolationContext): void;
}
```

---

#### IIsolationValidator (隔离验证器接口)

**描述**: 定义权限验证的接口

```typescript
/**
 * 隔离验证器接口
 *
 * @description 定义数据访问权限验证的标准接口
 *
 * @since 1.0.0
 */
export interface IIsolationValidator {
  /**
   * 验证隔离级别
   *
   * @param requiredLevel - 要求的最低隔离级别
   * @returns 如果当前级别满足要求返回 true
   */
  validateIsolationLevel(requiredLevel: IsolationLevel): boolean;

  /**
   * 检查数据访问权限
   *
   * @param dataContext - 数据的隔离上下文
   * @param isShared - 数据是否共享
   * @param sharingLevel - 共享级别（如果是共享数据）
   * @returns 如果有权限返回 true
   */
  checkDataAccess(
    dataContext: IsolationContext,
    isShared: boolean,
    sharingLevel?: SharingLevel,
  ): boolean;
}
```

---

#### DataAccessContext (数据访问上下文)

**描述**: 描述数据的隔离和共享属性

```typescript
/**
 * 数据访问上下文
 *
 * @description 定义数据的隔离属性和共享策略
 *
 * @since 1.0.0
 */
export interface DataAccessContext {
  /** 数据的隔离上下文 */
  isolationContext: IsolationContext;

  /** 是否共享数据 */
  isShared: boolean;

  /** 共享级别（如果是共享数据） */
  sharingLevel?: SharingLevel;

  /** 精确共享对象列表（可选） */
  sharedWith?: string[];
}
```

---

### 领域事件（Domain Events）

#### IsolationContextCreatedEvent (上下文创建事件)

```typescript
/**
 * 隔离上下文创建事件
 *
 * @description 当请求到达并成功构建隔离上下文时触发
 *
 * ## 使用场景
 *
 * - 审计追踪
 * - 上下文传播
 * - 安全监控
 *
 * @since 1.0.0
 */
export class IsolationContextCreatedEvent {
  constructor(
    /** 隔离上下文 */
    public readonly context: IsolationContext,

    /** 请求 ID */
    public readonly requestId: string,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

---

#### IsolationContextSwitchedEvent (上下文切换事件)

```typescript
/**
 * 隔离上下文切换事件
 *
 * @description 当用户切换组织或部门时触发
 *
 * ## 使用场景
 *
 * - 用户行为分析
 * - 异常检测
 * - 审计追踪
 *
 * @since 1.0.0
 */
export class IsolationContextSwitchedEvent {
  constructor(
    /** 切换前的上下文 */
    public readonly from: IsolationContext,

    /** 切换后的上下文 */
    public readonly to: IsolationContext,

    /** 切换原因 */
    public readonly reason: string,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

---

#### DataAccessDeniedEvent (数据访问被拒绝事件)

```typescript
/**
 * 数据访问被拒绝事件
 *
 * @description 当用户尝试访问无权限的数据时触发
 *
 * ## 使用场景
 *
 * - 安全审计
 * - 异常行为检测
 * - 权限问题诊断
 *
 * @since 1.0.0
 */
export class DataAccessDeniedEvent {
  constructor(
    /** 用户上下文 */
    public readonly userContext: IsolationContext,

    /** 数据上下文 */
    public readonly dataContext: IsolationContext,

    /** 拒绝原因 */
    public readonly reason: string,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
```

---

### 异常类型

#### IsolationValidationError

**描述**: 隔离上下文验证失败异常

```typescript
/**
 * 隔离验证异常
 *
 * @description 当隔离上下文验证失败时抛出
 *
 * @since 1.0.0
 */
export class IsolationValidationError extends Error {
  constructor(
    message: string,
    /** 错误代码 */
    public readonly code: string,
    /** 上下文信息 */
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = "IsolationValidationError";
  }
}
```

**错误代码**:

- `INVALID_TENANT_ID`: 租户 ID 无效
- `INVALID_ORGANIZATION_ID`: 组织 ID 无效
- `INVALID_DEPARTMENT_ID`: 部门 ID 无效
- `INVALID_USER_ID`: 用户 ID 无效
- `INVALID_ORGANIZATION_CONTEXT`: 组织上下文缺少租户
- `INVALID_DEPARTMENT_CONTEXT`: 部门上下文缺少租户或组织
- `ACCESS_DENIED`: 数据访问被拒绝

---

## 实现库（@hl8/nestjs-isolation）

### 模块配置

#### IsolationModuleOptions

```typescript
/**
 * 隔离模块配置选项
 *
 * @since 1.0.0
 */
export interface IsolationModuleOptions {
  /** 是否全局模块，默认 true */
  global?: boolean;

  /** 是否自动注册中间件，默认 true */
  autoRegisterMiddleware?: boolean;

  /** 提取策略，默认 'header' */
  extractionStrategy?: "header" | "jwt" | "custom";

  /** 自定义提取器（如果 strategy 为 'custom'） */
  customExtractor?: IExtractionStrategy;
}
```

---

### 提取策略

#### IExtractionStrategy (提取策略接口)

```typescript
/**
 * 提取策略接口
 *
 * @description 定义从请求中提取隔离标识的策略
 *
 * @since 1.0.0
 */
export interface IExtractionStrategy {
  /**
   * 从请求中提取隔离标识
   *
   * @param request - HTTP 请求对象
   * @returns 提取的标识符对象
   */
  extract(request: any): {
    tenantId?: string;
    organizationId?: string;
    departmentId?: string;
    userId?: string;
  };
}
```

---

## 数据模型关系图

```text
┌──────────────────┐
│ IsolationContext │ (实体)
│  (充血模型)       │
└────────┬─────────┘
         │
         │ 包含（值对象）
         ↓
┌──────────────────┐
│    TenantId      │ (值对象)
│ OrganizationId   │
│  DepartmentId    │
│     UserId       │
└──────────────────┘
         │
         │ 使用
         ↓
┌──────────────────┐
│ IsolationLevel   │ (枚举)
│  SharingLevel    │
└──────────────────┘
         │
         │ 触发
         ↓
┌──────────────────────────┐
│ IsolationContextCreated  │ (事件)
│ IsolationContextSwitched │
│   DataAccessDenied       │
└──────────────────────────┘
```

---

## 类型导出结构

### 领域模型库导出

```typescript
// libs/isolation-model/src/index.ts

// 实体
export { IsolationContext } from "./entities/isolation-context.entity.js";

// 值对象
export { TenantId } from "./value-objects/tenant-id.vo.js";
export { OrganizationId } from "./value-objects/organization-id.vo.js";
export { DepartmentId } from "./value-objects/department-id.vo.js";
export { UserId } from "./value-objects/user-id.vo.js";

// 枚举
export { IsolationLevel } from "./enums/isolation-level.enum.js";
export { SharingLevel } from "./enums/sharing-level.enum.js";

// 接口
export type { IIsolationContextProvider } from "./interfaces/isolation-context-provider.interface.js";
export type { IIsolationValidator } from "./interfaces/isolation-validator.interface.js";
export type { DataAccessContext } from "./interfaces/data-access-context.interface.js";

// 事件
export { IsolationContextCreatedEvent } from "./events/context-created.event.js";
export { IsolationContextSwitchedEvent } from "./events/context-switched.event.js";
export { DataAccessDeniedEvent } from "./events/access-denied.event.js";

// 异常
export { IsolationValidationError } from "./errors/isolation-validation.error.js";
```

### 实现库导出

```typescript
// libs/nestjs-isolation/src/index.ts

// 重新导出领域模型
export * from "@hl8/isolation-model";

// NestJS 模块
export { IsolationModule } from "./isolation.module.js";

// 服务实现
export { IsolationContextService } from "./services/isolation-context.service.js";
export { MultiLevelIsolationService } from "./services/multi-level-isolation.service.js";

// 中间件
export { IsolationExtractionMiddleware } from "./middleware/isolation-extraction.middleware.js";

// 守卫
export { IsolationGuard } from "./guards/isolation.guard.js";

// 装饰器
export { RequireTenant } from "./decorators/require-tenant.decorator.js";
export { RequireOrganization } from "./decorators/require-organization.decorator.js";
export { RequireDepartment } from "./decorators/require-department.decorator.js";
export { CurrentContext } from "./decorators/current-context.decorator.js";

// 类型
export type { IsolationModuleOptions } from "./types/module-options.interface.js";
```

---

## 数据验证规则汇总

### 领域模型库验证规则

| 数据类型         | 验证规则              | 错误代码                     |
| ---------------- | --------------------- | ---------------------------- |
| TenantId         | 非空字符串            | INVALID_TENANT_ID            |
| TenantId         | 长度 1-50 字符        | TENANT_ID_TOO_LONG           |
| TenantId         | 只含字母、数字、\_、- | INVALID_TENANT_ID_FORMAT     |
| OrganizationId   | 同 TenantId           | INVALID_ORGANIZATION_ID      |
| DepartmentId     | 同 TenantId           | INVALID_DEPARTMENT_ID        |
| UserId           | 同 TenantId           | INVALID_USER_ID              |
| IsolationContext | 组织级需要租户        | INVALID_ORGANIZATION_CONTEXT |
| IsolationContext | 部门级需要租户+组织   | INVALID_DEPARTMENT_CONTEXT   |

---

## 性能优化策略

### 1. Flyweight 模式（值对象缓存）

```typescript
// 所有 ID 值对象使用 Flyweight 模式
export class TenantId {
  private static cache = new Map<string, TenantId>();

  static create(value: string): TenantId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new TenantId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }
}
```

**优势**:

- 减少对象创建开销
- 内存占用更少
- 相等性比较更快（可以使用 === 引用比较）

### 2. 延迟计算（Lazy Evaluation）

```typescript
export class IsolationContext {
  private _level?: IsolationLevel; // 缓存计算结果

  getIsolationLevel(): IsolationLevel {
    if (this._level === undefined) {
      this._level = this.computeLevel();
    }
    return this._level;
  }
}
```

### 3. 纯函数优化

所有方法都是纯函数，无副作用：

- V8 引擎可以更好地优化
- 可以安全地缓存结果
- 易于测试和推理

---

## 使用模式

### 模式 1: Caching 模块集成

```typescript
// libs/nestjs-caching/package.json
{
  "dependencies": {
    "@hl8/nestjs-isolation": "workspace:*"  // 零依赖！
  }
}

// libs/nestjs-caching/src/cache.service.ts
import { IsolationContext } from '@hl8/nestjs-isolation';
import type { IIsolationContextProvider } from '@hl8/nestjs-isolation';

@Injectable()
export class CacheService {
  constructor(
    private readonly contextProvider: IIsolationContextProvider,
  ) {}

  async get<T>(namespace: string, key: string): Promise<T | null> {
    const context = this.contextProvider.getIsolationContext()
      ?? IsolationContext.platform();

    const cacheKey = context.buildCacheKey(namespace, key);
    return this.redis.get(cacheKey);
  }
}
```

### 模式 2: Logging 模块集成

```typescript
// libs/nestjs-logging/package.json
{
  "dependencies": {
    "@hl8/nestjs-isolation": "workspace:*"  // 零依赖！
  }
}

// libs/nestjs-logging/src/logger.service.ts
import { IsolationContext } from '@hl8/nestjs-isolation';
import type { IIsolationContextProvider } from '@hl8/nestjs-isolation';

@Injectable()
export class LoggerService {
  constructor(
    private readonly contextProvider: IIsolationContextProvider,
  ) {}

  info(message: string, data?: any): void {
    const context = this.contextProvider.getIsolationContext()
      ?? IsolationContext.platform();

    const logContext = context.buildLogContext();

    this.pino.info({
      ...logContext,
      message,
      data,
    });
  }
}
```

### 模式 3: NestJS 应用完整集成

```typescript
// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { IsolationModule } from "@hl8/nestjs-isolation-impl"; // 使用实现

@Module({
  imports: [
    IsolationModule.forRoot({
      global: true,
      autoRegisterMiddleware: true,
      extractionStrategy: "header",
    }),
  ],
})
export class AppModule {}
```

---

## 设计原则总结

### 1. 零依赖原则（领域模型库）

- ✅ 不依赖任何 npm 包
- ✅ 纯 TypeScript 实现
- ✅ 可在任何环境运行

### 2. 充血模型原则

- ✅ 业务逻辑在领域对象内部
- ✅ IsolationContext 封装隔离逻辑
- ✅ 值对象封装验证逻辑

### 3. 依赖倒置原则

- ✅ 高层模块依赖抽象（接口）
- ✅ 低层模块实现抽象
- ✅ 领域模型独立于实现

### 4. 单一职责原则

- ✅ 领域模型库：提供领域概念
- ✅ 实现库：提供框架集成
- ✅ 业务库：使用领域模型

### 5. 开放封闭原则

- ✅ 对扩展开放（可以添加新的实现库）
- ✅ 对修改封闭（领域模型稳定）

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 数据模型设计完成
