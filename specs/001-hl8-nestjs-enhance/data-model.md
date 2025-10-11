# Data Model: NestJS 基础设施模块

**Feature**: 001-hl8-nestjs-enhance  
**Package Name**: `@hl8/nestjs-infra`  
**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-11

## 概述

本文档定义 `@hl8/nestjs-infra` 包中 `shared/` 目录的领域模型（实体、值对象、事件、类型、异常）。

**重要说明**：

- `shared/` 目录是过渡性设计，便于后续迁移到业务模块或 shared-kernel
- 其他功能模块（caching、configuration、logging 等）采用功能导向设计，无领域模型
- 仅 multi-tenancy 模块涉及领域概念

## 1. 实体 (Entities)

### 1.1 IsolationContext（隔离上下文）

**描述**：表示请求的多层级隔离上下文，贯穿整个请求生命周期

**属性**：

| 属性名 | 类型 | 必需 | 描述 | 验证规则 |
|-------|------|-----|------|---------|
| tenantId | TenantId | 否 | 租户标识符 | 有效的 TenantId 值对象 |
| organizationId | OrganizationId | 否 | 组织标识符 | 有效的 OrganizationId 值对象 |
| departmentId | DepartmentId | 否 | 部门标识符 | 有效的 DepartmentId 值对象 |
| userId | UserId | 否 | 用户标识符 | 有效的 UserId 值对象 |
| createdAt | Date | 是 | 创建时间 | ISO 8601 时间戳 |

**业务规则**：

1. **层级规则**：
   - **平台级**：所有标识符均为空（tenantId、organizationId、departmentId、userId 都为 undefined）
   - **租户级**：有 tenantId，organizationId 和 departmentId 为空
   - **组织级**：有 organizationId 必须有 tenantId
   - **部门级**：有 departmentId 必须有 organizationId 和 tenantId
   - **用户级**：userId 可以独立存在或与其他层级组合

2. **验证规则**：
   - **允许空上下文**：平台级数据的隔离上下文所有标识符均为空
   - **层级一致性**：有子级必须有父级（部门→组织→租户）
   - **标识符有效性**：所有非空标识符必须是有效的值对象

3. **生命周期**：
   - 在请求开始时创建
   - 在请求结束时销毁
   - 不可变（创建后不可修改）

4. **平台级数据特殊说明**：
   - 平台级数据的 IsolationContext 所有标识符为 undefined
   - 用于平台管理后台访问平台数据（如推广数据、运营数据、系统配置）
   - 只有平台管理员可以创建平台级上下文
   - 缓存键中不包含租户信息（`hl8:cache:platform:xxx`）

**方法**：

- `validate(): boolean` - 验证上下文有效性
- `getIsolationLevel(): IsolationLevel` - 获取隔离级别
- `isValid(): boolean` - 检查是否有效
- `toJSON(): object` - 序列化为 JSON

**示例**：

```typescript
/**
 * 隔离上下文实体
 *
 * @description 表示请求的多层级隔离上下文
 *
 * ## 业务规则
 *
 * ### 层级规则
 * - 平台级：所有标识符均为空
 * - 租户级：有 tenantId，其他为空
 * - 组织级：有 organizationId 必须有 tenantId
 * - 部门级：有 departmentId 必须有 organizationId 和 tenantId
 * - 用户级：userId 可以独立存在或与其他层级组合
 *
 * ### 不可变性
 * - 创建后不可修改
 * - 使用值对象保证不可变性
 *
 * @example
 * ```typescript
 * // 平台级隔离（平台管理后台）
 * const platformContext = new IsolationContext({
 *   // 所有标识符为空，表示平台级数据
 * });
 * console.log(platformContext.getIsolationLevel()); // IsolationLevel.PLATFORM
 *
 * // 租户级隔离
 * const tenantContext = new IsolationContext({
 *   tenantId: new TenantId('tenant-123'),
 * });
 * console.log(tenantContext.getIsolationLevel()); // IsolationLevel.TENANT
 *
 * // 组织级隔离
 * const orgContext = new IsolationContext({
 *   tenantId: new TenantId('tenant-123'),
 *   organizationId: new OrganizationId('org-456'),
 * });
 * console.log(orgContext.getIsolationLevel()); // IsolationLevel.ORGANIZATION
 *
 * // 部门级隔离
 * const deptContext = new IsolationContext({
 *   tenantId: new TenantId('tenant-123'),
 *   organizationId: new OrganizationId('org-456'),
 *   departmentId: new DepartmentId('dept-789'),
 * });
 * console.log(deptContext.getIsolationLevel()); // IsolationLevel.DEPARTMENT
 *
 * // 验证
 * if (!context.validate()) {
 *   throw new InvalidIsolationContextException();
 * }
 * ```
 */
export class IsolationContext {
  // 实现
}
```

---

## 2. 值对象 (Value Objects)

### 2.1 TenantId（租户标识符）

**描述**：租户的唯一标识符

**属性**：

| 属性名 | 类型 | 描述 | 格式 |
|-------|------|------|-----|
| value | string | 租户 ID 值 | UUID v4 或自定义格式 |

**验证规则**：

- 非空字符串
- 长度 ≤ 100 字符
- 符合 ID 格式规范（UUID 或自定义）

**方法**：

- `equals(other: TenantId): boolean` - 相等性比较
- `toString(): string` - 转换为字符串
- `isValid(): boolean` - 验证有效性

### 2.2 OrganizationId（组织标识符）

**描述**：组织的唯一标识符

**属性**：

| 属性名 | 类型 | 描述 | 格式 |
|-------|------|------|-----|
| value | string | 组织 ID 值 | UUID v4 或自定义格式 |

**验证规则**：

- 非空字符串
- 长度 ≤ 100 字符
- 符合 ID 格式规范

### 2.3 DepartmentId（部门标识符）

**描述**：部门的唯一标识符

**属性**：

| 属性名 | 类型 | 描述 | 格式 |
|-------|------|------|-----|
| value | string | 部门 ID 值 | UUID v4 或自定义格式 |

**验证规则**：

- 非空字符串
- 长度 ≤ 100 字符
- 符合 ID 格式规范

### 2.4 UserId（用户标识符）

**描述**：用户的唯一标识符

**属性**：

| 属性名 | 类型 | 描述 | 格式 |
|-------|------|------|-----|
| value | string | 用户 ID 值 | UUID v4 或自定义格式 |

**验证规则**：

- 非空字符串
- 长度 ≤ 100 字符
- 符合 ID 格式规范

**通用值对象模式**：

```typescript
/**
 * 标识符值对象基类
 *
 * @description 所有标识符值对象的基类
 *
 * ## 业务规则
 *
 * ### 不可变性
 * - 值对象创建后不可修改
 * - 通过 readonly 属性保证不可变性
 *
 * ### 相等性
 * - 基于值相等，而非引用相等
 * - 两个值对象值相同即相等
 *
 * @example
 * ```typescript
 * const id1 = new TenantId('tenant-123');
 * const id2 = new TenantId('tenant-123');
 * console.log(id1.equals(id2)); // true
 * ```
 */
export abstract class IdentifierValueObject {
  constructor(public readonly value: string) {
    this.validate();
  }

  abstract validate(): void;

  equals(other: IdentifierValueObject): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

---

## 3. 领域事件 (Domain Events)

### 3.1 IsolationContextCreatedEvent

**描述**：隔离上下文创建事件

**属性**：

| 属性名 | 类型 | 必需 | 描述 |
|-------|------|-----|------|
| eventId | string | 是 | 事件唯一标识符 |
| occurredOn | Date | 是 | 事件发生时间 |
| isolationContext | IsolationContext | 是 | 创建的隔离上下文 |
| requestId | string | 否 | 关联的请求 ID |

**触发时机**：

- 请求开始时创建隔离上下文

**用途**：

- 审计日志记录
- 监控统计
- 事件溯源

### 3.2 IsolationContextSwitchedEvent

**描述**：隔离上下文切换事件

**属性**：

| 属性名 | 类型 | 必需 | 描述 |
|-------|------|-----|------|
| eventId | string | 是 | 事件唯一标识符 |
| occurredOn | Date | 是 | 事件发生时间 |
| oldContext | IsolationContext | 是 | 旧的隔离上下文 |
| newContext | IsolationContext | 是 | 新的隔离上下文 |
| reason | string | 否 | 切换原因 |

**触发时机**：

- 系统内部切换隔离上下文时（如内部服务调用）

**用途**：

- 审计追踪
- 安全监控
- 异常检测

### 3.3 CacheInvalidatedEvent

**描述**：缓存失效事件

**属性**：

| 属性名 | 类型 | 必需 | 描述 |
|-------|------|-----|------|
| eventId | string | 是 | 事件唯一标识符 |
| occurredOn | Date | 是 | 事件发生时间 |
| namespace | string | 是 | 缓存命名空间 |
| keys | string[] | 否 | 失效的缓存键（为空表示全部） |
| isolationContext | IsolationContext | 否 | 关联的隔离上下文 |

**触发时机**：

- 手动调用 CacheEvict
- 数据更新导致缓存失效
- 批量清除缓存

**用途**：

- 分布式缓存同步
- 监控统计
- 审计追踪

---

## 4. 类型定义 (Types)

### 4.1 IsolationLevel（隔离级别）

**描述**：定义隔离级别枚举

```typescript
/**
 * 隔离级别枚举
 *
 * @description 定义系统支持的隔离级别
 *
 * ## 业务规则
 *
 * ### 平台级数据
 * - 无任何隔离标识（tenantId、organizationId 等均为空）
 * - 属于平台自身的数据，跨租户共享
 * - 例如：平台推广数据、运营数据、系统配置、全局统计等
 * - 只有平台管理员可以访问和修改
 *
 * ### 租户级数据
 * - 只有 tenantId，无 organizationId、departmentId
 * - 属于整个租户，租户内所有用户可见
 * - 例如：租户配置、租户统计、租户级资源
 *
 * ### 组织级数据
 * - 有 tenantId + organizationId
 * - 属于租户内的特定组织
 * - 例如：组织配置、组织成员、组织资源
 *
 * ### 部门级数据
 * - 有 tenantId + organizationId + departmentId
 * - 属于组织内的特定部门
 * - 例如：部门文档、部门任务、部门成员
 *
 * ### 用户级数据
 * - 有 userId（可选 tenantId、organizationId、departmentId）
 * - 属于特定用户的私有数据
 * - 例如：用户偏好、用户草稿、个人笔记
 */
export enum IsolationLevel {
  /** 平台级（无隔离标识）- 平台自身数据，跨租户共享 */
  PLATFORM = 'platform',
  
  /** 租户级（tenantId）- 租户数据，租户内共享 */
  TENANT = 'tenant',
  
  /** 组织级（tenantId + organizationId）- 组织数据 */
  ORGANIZATION = 'organization',
  
  /** 部门级（tenantId + organizationId + departmentId）- 部门数据 */
  DEPARTMENT = 'department',
  
  /** 用户级（userId，可选其他层级）- 用户私有数据 */
  USER = 'user',
}
```

### 4.2 TenantType（租户类型）

**描述**：定义租户类型枚举

```typescript
/**
 * 租户类型枚举
 *
 * @description 定义系统支持的租户类型
 */
export enum TenantType {
  /** 企业租户 */
  ENTERPRISE = 'enterprise',
  
  /** 社群租户 */
  COMMUNITY = 'community',
  
  /** 团队租户 */
  TEAM = 'team',
  
  /** 个人租户 */
  PERSONAL = 'personal',
}
```

### 4.3 DataSharingLevel（数据共享级别）

**描述**：定义数据共享级别

```typescript
/**
 * 数据共享级别枚举
 *
 * @description 定义数据的共享范围
 *
 * ## 业务规则
 *
 * ### 共享级别说明
 * - 数据的隔离级别（IsolationLevel）定义数据的归属
 * - 数据的共享级别（DataSharingLevel）定义数据的可见范围
 * - 共享级别可以等于或高于隔离级别
 * - 通过 isShared 字段控制是否启用共享
 *
 * ### 典型场景
 * - 租户级数据（IsolationLevel.TENANT）+ 平台级共享（DataSharingLevel.PLATFORM）
 *   = 租户创建的数据，但平台管理员可见（如租户提交的工单）
 * - 部门级数据（IsolationLevel.DEPARTMENT）+ 组织级共享（DataSharingLevel.ORGANIZATION）
 *   = 部门创建的数据，但整个组织可见（如部门公告）
 *
 * @example
 * ```typescript
 * // 租户工单：属于租户，但平台可见
 * const ticket = {
 *   isolationLevel: IsolationLevel.TENANT,
 *   tenantId: 'tenant-123',
 *   isShared: true,
 *   sharingLevel: DataSharingLevel.PLATFORM,
 * };
 *
 * // 部门公告：属于部门，但组织可见
 * const announcement = {
 *   isolationLevel: IsolationLevel.DEPARTMENT,
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   departmentId: 'dept-789',
 *   isShared: true,
 *   sharingLevel: DataSharingLevel.ORGANIZATION,
 * };
 * ```
 */
export enum DataSharingLevel {
  /** 平台级共享（所有租户可见）- 最高共享级别 */
  PLATFORM = 'platform',
  
  /** 租户级共享（租户内可见） */
  TENANT = 'tenant',
  
  /** 组织级共享（组织内可见） */
  ORGANIZATION = 'organization',
  
  /** 部门级共享（部门内可见） */
  DEPARTMENT = 'department',
  
  /** 私有（仅所有者可见）- 不共享 */
  PRIVATE = 'private',
}
```

### 4.4 数据共享字段设计

**描述**：每条数据都应该包含共享控制字段

**推荐的数据模型字段**：

```typescript
/**
 * 基础数据模型接口（所有业务实体应该实现）
 *
 * @description 定义所有业务数据的基础字段
 *
 * ## 业务规则
 *
 * ### 隔离字段（定义数据归属）
 * - tenantId: 数据归属的租户（可为空表示平台级）
 * - organizationId: 数据归属的组织（可为空）
 * - departmentId: 数据归属的部门（可为空）
 * - userId: 数据创建者/所有者（可为空）
 *
 * ### 共享控制字段（定义可见范围）⭐
 * - isShared: 是否共享（布尔值，默认 false）
 * - sharingLevel: 共享级别（仅当 isShared=true 时有效）
 * - sharedWith: 明确共享给哪些对象（可选，用于更精细的控制）
 *
 * ### 设计原因
 * - 虽然看似冗余，但提供了极大的灵活性
 * - 同一层级的数据可以有不同的共享策略
 * - 支持动态调整共享状态
 * - 为未来扩展预留空间（如时间范围共享、条件共享）
 *
 * @example
 * ```typescript
 * // 示例1：部门文档，仅部门内可见（不共享）
 * const privateDeptDoc = {
 *   id: 'doc-1',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   departmentId: 'dept-789',
 *   userId: 'user-001',
 *   isShared: false,              // 不共享
 *   sharingLevel: null,
 * };
 *
 * // 示例2：部门公告，组织内可见（向上共享）
 * const deptAnnouncement = {
 *   id: 'announcement-1',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   departmentId: 'dept-789',
 *   userId: 'user-001',
 *   isShared: true,               // 共享
 *   sharingLevel: DataSharingLevel.ORGANIZATION, // 组织内可见
 * };
 *
 * // 示例3：优秀案例，全租户共享（向上共享到租户）
 * const bestPractice = {
 *   id: 'practice-1',
 *   tenantId: 'tenant-123',
 *   organizationId: 'org-456',
 *   departmentId: 'dept-789',
 *   userId: 'user-001',
 *   isShared: true,               // 共享
 *   sharingLevel: DataSharingLevel.TENANT, // 整个租户可见
 * };
 *
 * // 示例4：租户工单，平台可见（向上共享到平台）
 * const supportTicket = {
 *   id: 'ticket-1',
 *   tenantId: 'tenant-123',
 *   userId: 'user-001',
 *   isShared: true,               // 共享
 *   sharingLevel: DataSharingLevel.PLATFORM, // 平台管理员可见
 * };
 * ```
 */
export interface BaseDataModel {
  /** 数据唯一标识 */
  id: string;
  
  // === 隔离字段（定义数据归属）===
  /** 租户ID（可为空表示平台级数据） */
  tenantId?: string;
  
  /** 组织ID */
  organizationId?: string;
  
  /** 部门ID */
  departmentId?: string;
  
  /** 用户ID（创建者/所有者） */
  userId?: string;
  
  // === 共享控制字段 ⭐ ===
  /** 是否共享（默认 false） */
  isShared: boolean;
  
  /** 共享级别（仅当 isShared=true 时有效） */
  sharingLevel?: DataSharingLevel;
  
  /** 明确共享给哪些对象（可选，用于更精细控制） */
  sharedWith?: string[]; // 用户ID、组织ID、部门ID 列表
  
  // === 时间戳 ===
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}
```

**共享控制的优势**：

1. ✅ **灵活性**：同一层级的数据可以有不同的共享策略
2. ✅ **动态调整**：可以在运行时改变共享状态
3. ✅ **精细控制**：通过 sharedWith 字段实现精确共享
4. ✅ **未来扩展**：可以增加时间范围共享、条件共享等高级功能
5. ✅ **业务场景**：满足复杂的业务需求（如工单上报、最佳实践分享）

**共享规则验证**：

| 隔离级别 | 允许的共享级别 | 说明 |
|---------|---------------|------|
| PLATFORM | PLATFORM（自己） | 平台数据只能平台级共享 |
| TENANT | PLATFORM, TENANT | 租户数据可共享到平台或租户内 |
| ORGANIZATION | PLATFORM, TENANT, ORGANIZATION | 组织数据可向上共享 |
| DEPARTMENT | PLATFORM, TENANT, ORGANIZATION, DEPARTMENT | 部门数据可向上共享 |
| USER | 所有级别 | 用户数据可共享到任何级别 |

### 4.5 IsolationContext接口

**描述**：隔离上下文的接口定义

```typescript
/**
 * 隔离上下文接口
 */
export interface IIsolationContext {
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  departmentId?: DepartmentId;
  userId?: UserId;
  createdAt: Date;
}
```

---

## 5. 异常 (Exceptions)

### 5.1 TenantNotFoundException

**描述**：租户未找到异常

**属性**：

- message: "租户未找到"
- tenantId: string
- statusCode: 404

**触发条件**：

- 请求中的租户 ID 不存在
- 租户已被删除或禁用

### 5.2 InvalidIsolationContextException

**描述**：无效的隔离上下文异常

**属性**：

- message: "无效的隔离上下文"
- context: IsolationContext
- reason: string
- statusCode: 400

**触发条件**：

- 隔离上下文验证失败
- 层级关系不正确（如有 departmentId 但无 organizationId）

### 5.3 OrganizationNotFoundException

**描述**：组织未找到异常

**属性**：

- message: "组织未找到"
- organizationId: string
- statusCode: 404

### 5.4 UnauthorizedOrganizationException

**描述**：未授权的组织访问异常

**属性**：

- message: "无权访问该组织"
- organizationId: string
- userId: string
- statusCode: 403

**异常基类**：

```typescript
/**
 * 隔离异常基类
 *
 * @description 所有隔离相关异常的基类
 */
export abstract class IsolationException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly context?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}
```

---

## 6. 关系图

### 6.1 实体与值对象关系

```
IsolationContext (实体)
├── tenantId: TenantId (值对象)
├── organizationId: OrganizationId (值对象)
├── departmentId: DepartmentId (值对象)
└── userId: UserId (值对象)
```

### 6.2 事件触发流程

```
请求到达
  ↓
提取租户信息
  ↓
创建 IsolationContext
  ↓
触发 IsolationContextCreatedEvent
  ↓
请求处理
  ↓
（可选）切换上下文
  ↓
触发 IsolationContextSwitchedEvent
  ↓
（可选）缓存失效
  ↓
触发 CacheInvalidatedEvent
```

### 6.3 异常层次

```
IsolationException (基类)
├── TenantNotFoundException
├── InvalidIsolationContextException
├── OrganizationNotFoundException
├── DepartmentNotFoundException
└── UnauthorizedOrganizationException
```

---

## 7. 验证规则总结

| 实体/值对象 | 验证规则 |
|-----------|---------|
| IsolationContext | **允许所有标识符为空**（平台级）；层级关系正确；所有非空标识符有效 |
| TenantId | 非空；长度 ≤ 100；符合 ID 格式 |
| OrganizationId | 非空；长度 ≤ 100；符合 ID 格式 |
| DepartmentId | 非空；长度 ≤ 100；符合 ID 格式 |
| UserId | 非空；长度 ≤ 100；符合 ID 格式 |

**层级关系验证规则**：

| 场景 | tenantId | organizationId | departmentId | userId | 验证结果 |
|------|----------|---------------|-------------|--------|---------|
| 平台级 | ❌ 空 | ❌ 空 | ❌ 空 | ❌ 空 | ✅ 有效 |
| 租户级 | ✅ 有值 | ❌ 空 | ❌ 空 | ❌ 空 | ✅ 有效 |
| 组织级 | ✅ 有值 | ✅ 有值 | ❌ 空 | ❌ 空 | ✅ 有效 |
| 部门级 | ✅ 有值 | ✅ 有值 | ✅ 有值 | ❌ 空 | ✅ 有效 |
| 用户级 | ❌ 空 | ❌ 空 | ❌ 空 | ✅ 有值 | ✅ 有效 |
| 错误情况1 | ❌ 空 | ✅ 有值 | ❌ 空 | ❌ 空 | ❌ 无效（有组织但无租户） |
| 错误情况2 | ✅ 有值 | ❌ 空 | ✅ 有值 | ❌ 空 | ❌ 无效（有部门但无组织） |

---

## 8. 状态转换

**IsolationContext 状态**：

- **创建**：从请求头提取信息创建
- **验证**：验证有效性
- **使用**：在请求生命周期中使用
- **销毁**：请求结束时销毁

**不可变性**：IsolationContext 创建后不可修改，任何变更都需要创建新实例

---

## 9. 持久化说明

**重要**：`shared/` 目录中的领域模型**不需要持久化**

- IsolationContext：存储在请求作用域（AsyncLocalStorage），请求结束自动销毁
- 值对象：作为 IsolationContext 的一部分，不单独存储
- 事件：可选择持久化到事件存储（由业务应用决定）

---

## 10. 迁移计划

### 10.1 当前状态（Phase 1-2）

```text
libs/nestjs-infra/
└── src/
    └── shared/          # 临时存放
        ├── entities/
        ├── value-objects/
        ├── events/
        ├── types/
        └── exceptions/
```

### 10.2 目标状态（Phase 3+）

**方案 A：迁移到 Shared Kernel**

```text
libs/shared-kernel/      # 新建共享内核
├── entities/
├── value-objects/
├── events/
└── types/

libs/nestjs-infra/
└── src/
    ├── caching/         # 依赖 shared-kernel
    ├── multi-tenancy/   # 依赖 shared-kernel
    └── ...
```

**方案 B：迁移到业务模块**

```text
libs/tenant-management/  # 租户管理业务模块
└── domain/
    ├── entities/
    ├── value-objects/
    └── events/

libs/nestjs-infra/
└── src/
    ├── caching/         # 依赖 tenant-management
    ├── multi-tenancy/   # 依赖 tenant-management
    └── ...
```

---

**数据模型完成日期**：2025-10-11  
**审核状态**：✅ 通过  
**下一步**：创建 contracts/ 和 quickstart.md
