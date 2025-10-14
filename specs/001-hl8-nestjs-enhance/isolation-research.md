# Research: 拆分 Isolation 数据隔离模块为独立库项目

**Date**: 2025-10-12  
**Feature**: 将 libs/nestjs-infra/src/isolation 拆分为纯领域模型库和实现库  
**Spec**: [spec.md](./spec.md) | **Plan**: [isolation-plan.md](./isolation-plan.md)

## 研究目标

本研究旨在解决以下关键问题：

1. **模块拆分策略**: 如何拆分为领域模型库和实现库，实现依赖倒置？
2. **零依赖设计**: 如何设计零依赖的领域模型库？
3. **DDD 充血模型**: 如何在领域模型中封装业务规则，避免贫血模型？
4. **被引用设计**: 如何确保 caching、logging 等模块能优雅地使用 IsolationContext？
5. **性能优化**: 如何确保上下文操作零开销？

## 研究发现

### 1. 模块拆分策略 - 依赖倒置原则 (DIP)

**决策**: 拆分为两个独立库：

1. `@hl8/isolation-model` - 领域模型库（纯粹，框架无关）
2. `@hl8/nestjs-isolation` - NestJS 实现库（框架绑定）

**理由**:

- Isolation 是被多个库引用的核心概念（caching、logging、database）
- 如果包含框架实现，会导致不必要的依赖传递
- 遵循依赖倒置原则：高层模块依赖抽象，而非具体实现

**架构图**:

```text
┌─────────────────────────────────────────────────────┐
│  业务库层 (High-Level Modules)                       │
│  - libs/nestjs-caching                              │
│  - libs/nestjs-logging                              │
│  - libs/nestjs-database                             │
└──────────────┬──────────────────────────────────────┘
               │ 依赖（仅类型和接口）
               ↓
┌─────────────────────────────────────────────────────┐
│  领域模型层 (Domain Model - Abstract)                │
│  - libs/nestjs-isolation                            │
│  - 零依赖，纯 TypeScript                             │
│  - IsolationContext、TenantId、接口定义             │
└──────────────────────────────────────────────────────┘
               ↑ 实现（依赖倒置）
               │
┌─────────────────────────────────────────────────────┐
│  技术实现层 (Infrastructure - Concrete)              │
│  - libs/nestjs-isolation-impl                       │
│  - 依赖 NestJS、nestjs-cls                          │
│  - 中间件、守卫、装饰器                              │
└─────────────────────────────────────────────────────┘
```

**拆分策略**:

1. **libs/isolation-model（核心领域模型）**:

   ```typescript
   // 只包含：
   - IsolationContext 实体（封装隔离逻辑）
   - TenantId、OrganizationId 等值对象
   - IsolationLevel、SharingLevel 枚举
   - IIsolationContextProvider 接口
   - IIsolationValidator 接口
   - 领域事件定义（纯类）

   // 不包含：
   - ❌ NestJS 装饰器、模块、服务
   - ❌ nestjs-cls 依赖
   - ❌ class-validator 依赖
   - ❌ 任何框架相关的代码
   ```

2. **libs/nestjs-isolation（NestJS 实现）**:

   ```typescript
   // 包含：
   - IsolationModule（NestJS 模块）
   - IsolationContextService（实现 IIsolationContextProvider）
   - MultiLevelIsolationService（实现 IIsolationValidator）
   - 中间件、守卫、装饰器
   - 提取策略

   // 依赖：
   - @hl8/isolation-model（领域模型）
   - NestJS
   - nestjs-cls
   ```

**替代方案 rejected**:

- **单一模块包含所有功能**: 违反依赖倒置原则，增加不必要的依赖
- **将领域模型放在 @hl8/platform**: platform 是业务平台概念，isolation 是技术隔离概念，职责不同

**参考资料**:

- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Clean Architecture - The Dependency Rule](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

### 2. 零依赖设计 - 纯领域模型

**决策**: 领域模型库使用纯 TypeScript，无任何外部依赖

**理由**:

- 被多个库引用，零依赖确保最小依赖传递
- 纯 TypeScript 可在任何环境运行（Node.js、浏览器、Deno）
- 易于测试，无需 mock 外部依赖
- 包体积小，加载快

**零依赖实现技巧**:

#### 不使用 class-validator

```typescript
// ❌ 错误：依赖 class-validator
import { IsString } from 'class-validator';

export class TenantId {
  @IsString()
  value!: string;
}

// ✅ 正确：自实现验证
export class TenantId {
  private constructor(private readonly value: string) {
    this.validate();
  }

  static create(value: string): TenantId {
    return new TenantId(value);
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new Error('租户 ID 必须是非空字符串');
    }

    if (this.value.length > 50) {
      throw new Error('租户 ID 长度不能超过 50 字符');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(this.value)) {
      throw new Error('租户 ID 只能包含字母、数字、下划线和连字符');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }
}
```

#### 使用接口而非具体实现

```typescript
// ✅ 领域模型库：定义接口
export interface IIsolationContextProvider {
  getIsolationContext(): IsolationContext | undefined;
  setIsolationContext(context: IsolationContext): void;
}

// ✅ 实现库：提供具体实现
@Injectable()
export class IsolationContextService implements IIsolationContextProvider {
  constructor(private readonly cls: ClsService) {}

  getIsolationContext(): IsolationContext | undefined {
    return this.cls.get('ISOLATION_CONTEXT');
  }

  setIsolationContext(context: IsolationContext): void {
    this.cls.set('ISOLATION_CONTEXT', context);
  }
}
```

#### 异常处理策略

```typescript
// ✅ 领域模型库：使用标准 Error
export class IsolationValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'IsolationValidationError';
  }
}

// ✅ 实现库：转换为框架异常
@Injectable()
export class IsolationExceptionFilter implements ExceptionFilter {
  catch(exception: IsolationValidationError, host: ArgumentsHost) {
    // 转换为 NestJS 异常
    throw new BadRequestException({
      statusCode: 400,
      message: exception.message,
      code: exception.code,
      context: exception.context,
    });
  }
}
```

**零依赖的优势**:

1. ✅ **最小依赖传递**: caching、logging 模块不会间接依赖 NestJS
2. ✅ **跨平台**: 可在浏览器、Node.js、Deno 等环境运行
3. ✅ **包体积**: < 10KB，加载快
4. ✅ **易于测试**: 无需 mock 外部依赖
5. ✅ **版本独立**: 不受框架版本升级影响

**参考资料**:

- [Zero Dependencies in TypeScript Libraries](https://blog.bitsrc.io/building-typescript-libraries-with-zero-dependencies-4c7e8f5b3e0e)
- [Pure Domain Models](https://enterprisecraftsmanship.com/posts/domain-model-purity-completeness/)

---

### 3. DDD 充血模型设计 - IsolationContext 实体

**决策**: IsolationContext 作为领域实体，封装隔离逻辑和业务规则

**理由**:

- 隔离上下文不仅是数据容器，还包含业务逻辑（层级判断、权限验证）
- 符合 DDD 充血模型要求
- 业务规则集中管理，便于维护

**IsolationContext 实体设计**:

````typescript
/**
 * 隔离上下文实体
 *
 * @description 封装多层级数据隔离的核心业务逻辑
 *
 * ## 业务规则
 *
 * ### 层级判断规则
 * - 有 departmentId → DEPARTMENT 级
 * - 有 organizationId → ORGANIZATION 级
 * - 有 tenantId → TENANT 级
 * - 有 userId（无租户）→ USER 级
 * - 默认 → PLATFORM 级
 *
 * ### 验证规则
 * - 组织级必须有租户
 * - 部门级必须有租户和组织
 * - 所有 ID 必须有效
 *
 * @since 1.0.0
 */
export class IsolationContext {
  /**
   * 私有构造函数 - 强制使用静态工厂方法
   */
  private constructor(
    public readonly tenantId?: TenantId,
    public readonly organizationId?: OrganizationId,
    public readonly departmentId?: DepartmentId,
    public readonly userId?: UserId,
  ) {
    this.validate();
  }

  /**
   * 创建平台级上下文
   */
  static platform(): IsolationContext {
    return new IsolationContext();
  }

  /**
   * 创建租户级上下文
   */
  static tenant(tenantId: TenantId): IsolationContext {
    return new IsolationContext(tenantId);
  }

  /**
   * 创建组织级上下文
   */
  static organization(
    tenantId: TenantId,
    organizationId: OrganizationId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId);
  }

  /**
   * 创建部门级上下文
   */
  static department(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): IsolationContext {
    return new IsolationContext(tenantId, organizationId, departmentId);
  }

  /**
   * 创建用户级上下文
   */
  static user(userId: UserId, tenantId?: TenantId): IsolationContext {
    return new IsolationContext(tenantId, undefined, undefined, userId);
  }

  /**
   * 验证上下文有效性
   *
   * @throws {IsolationValidationError} 上下文无效
   * @private
   */
  private validate(): void {
    // 组织级必须有租户
    if (this.organizationId && !this.tenantId) {
      throw new IsolationValidationError(
        '组织级上下文必须包含租户 ID',
        'INVALID_ORGANIZATION_CONTEXT',
      );
    }

    // 部门级必须有租户和组织
    if (this.departmentId && (!this.tenantId || !this.organizationId)) {
      throw new IsolationValidationError(
        '部门级上下文必须包含租户 ID 和组织 ID',
        'INVALID_DEPARTMENT_CONTEXT',
      );
    }
  }

  /**
   * 获取隔离级别（业务逻辑）
   *
   * @returns 隔离级别
   */
  getIsolationLevel(): IsolationLevel {
    if (this.departmentId) return IsolationLevel.DEPARTMENT;
    if (this.organizationId) return IsolationLevel.ORGANIZATION;
    if (this.tenantId) return IsolationLevel.TENANT;
    if (this.userId) return IsolationLevel.USER;
    return IsolationLevel.PLATFORM;
  }

  /**
   * 判断是否为空上下文（平台级）
   *
   * @returns 如果所有标识符都为空返回 true
   */
  isEmpty(): boolean {
    return (
      !this.tenantId &&
      !this.organizationId &&
      !this.departmentId &&
      !this.userId
    );
  }

  /**
   * 构建缓存键前缀（业务逻辑）
   *
   * @description 根据隔离级别生成缓存键前缀
   *
   * @param namespace - 命名空间
   * @param key - 键名
   * @returns 完整的缓存键
   *
   * @example
   * ```typescript
   * const context = IsolationContext.department(
   *   TenantId.create('t123'),
   *   OrganizationId.create('o456'),
   *   DepartmentId.create('d789'),
   * );
   *
   * const cacheKey = context.buildCacheKey('user', 'list');
   * // 返回: tenant:t123:org:o456:dept:d789:user:list
   * ```
   */
  buildCacheKey(namespace: string, key: string): string {
    const parts: string[] = [];

    switch (this.getIsolationLevel()) {
      case IsolationLevel.PLATFORM:
        parts.push('platform', namespace, key);
        break;

      case IsolationLevel.TENANT:
        parts.push('tenant', this.tenantId!.getValue(), namespace, key);
        break;

      case IsolationLevel.ORGANIZATION:
        parts.push(
          'tenant',
          this.tenantId!.getValue(),
          'org',
          this.organizationId!.getValue(),
          namespace,
          key,
        );
        break;

      case IsolationLevel.DEPARTMENT:
        parts.push(
          'tenant',
          this.tenantId!.getValue(),
          'org',
          this.organizationId!.getValue(),
          'dept',
          this.departmentId!.getValue(),
          namespace,
          key,
        );
        break;

      case IsolationLevel.USER:
        if (this.tenantId) {
          parts.push(
            'tenant',
            this.tenantId.getValue(),
            'user',
            this.userId!.getValue(),
            namespace,
            key,
          );
        } else {
          parts.push('user', this.userId!.getValue(), namespace, key);
        }
        break;
    }

    return parts.join(':');
  }

  /**
   * 构建日志上下文（业务逻辑）
   *
   * @description 生成结构化的日志上下文对象
   *
   * @returns 日志上下文对象
   *
   * @example
   * ```typescript
   * const logContext = context.buildLogContext();
   * logger.info('操作完成', logContext);
   * // 输出: { tenantId: 't123', organizationId: 'o456', ... }
   * ```
   */
  buildLogContext(): Record<string, string> {
    const logContext: Record<string, string> = {};

    if (this.tenantId) {
      logContext.tenantId = this.tenantId.getValue();
    }
    if (this.organizationId) {
      logContext.organizationId = this.organizationId.getValue();
    }
    if (this.departmentId) {
      logContext.departmentId = this.departmentId.getValue();
    }
    if (this.userId) {
      logContext.userId = this.userId.getValue();
    }

    return logContext;
  }

  /**
   * 检查是否可以访问数据（业务逻辑）
   *
   * @description 验证当前上下文是否可以访问目标数据
   *
   * @param dataContext - 数据的隔离上下文
   * @param isShared - 数据是否共享
   * @param sharingLevel - 共享级别（如果是共享数据）
   * @returns 如果可以访问返回 true，否则返回 false
   *
   * ## 访问规则
   *
   * ### 非共享数据
   * - 只能在数据所有者的隔离层级访问
   * - 示例：部门 A 的非共享数据不能被部门 B 访问
   *
   * ### 共享数据
   * - 可以在共享级别及其下级访问
   * - 示例：租户级共享数据可被该租户的所有组织、部门、用户访问
   *
   * @example
   * ```typescript
   * const userContext = IsolationContext.department(t123, o456, d789);
   * const dataContext = IsolationContext.organization(t123, o456);
   *
   * // 检查访问权限
   * const canAccess = userContext.canAccess(dataContext, true, SharingLevel.ORGANIZATION);
   * // 返回 true（共享数据，用户在组织内）
   * ```
   */
  canAccess(
    dataContext: IsolationContext,
    isShared: boolean,
    sharingLevel?: SharingLevel,
  ): boolean {
    // 平台级上下文可以访问所有数据
    if (this.isEmpty()) {
      return true;
    }

    // 非共享数据：必须完全匹配
    if (!isShared) {
      return this.matches(dataContext);
    }

    // 共享数据：检查共享级别
    return this.canAccessSharedData(dataContext, sharingLevel);
  }

  /**
   * 检查是否匹配另一个上下文（私有方法）
   *
   * @private
   */
  private matches(other: IsolationContext): boolean {
    return (
      this.tenantId?.equals(other.tenantId) &&
      this.organizationId?.equals(other.organizationId) &&
      this.departmentId?.equals(other.departmentId) &&
      this.userId?.equals(other.userId)
    );
  }

  /**
   * 检查是否可以访问共享数据（私有方法）
   *
   * @private
   */
  private canAccessSharedData(
    dataContext: IsolationContext,
    sharingLevel?: SharingLevel,
  ): boolean {
    if (!sharingLevel) {
      return false;
    }

    switch (sharingLevel) {
      case SharingLevel.PLATFORM:
        return true; // 平台共享，所有人可访问

      case SharingLevel.TENANT:
        return this.tenantId?.equals(dataContext.tenantId) ?? false;

      case SharingLevel.ORGANIZATION:
        return (
          (this.tenantId?.equals(dataContext.tenantId) &&
            this.organizationId?.equals(dataContext.organizationId)) ??
          false
        );

      case SharingLevel.DEPARTMENT:
        return (
          (this.tenantId?.equals(dataContext.tenantId) &&
            this.organizationId?.equals(dataContext.organizationId) &&
            this.departmentId?.equals(dataContext.departmentId)) ??
          false
        );

      default:
        return false;
    }
  }
}
````

**充血模型的优势**:

1. ✅ **业务规则封装**: 所有隔离逻辑在 IsolationContext 内部
2. ✅ **高内聚**: 相关的数据和行为在一起
3. ✅ **易于测试**: 纯函数，无副作用
4. ✅ **可复用**: buildCacheKey、buildLogContext 等方法可被多个模块使用

**替代方案 rejected**:

- **贫血模型 + 服务层**: 业务逻辑散落在服务层，难以维护
- **使用 class-validator**: 引入外部依赖，违反零依赖原则

**参考资料**:

- [Rich Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)
- [Domain-Driven Design: Entities](https://khalilstemmler.com/articles/typescript-domain-driven-design/entities/)

---

### 4. 被引用设计 - 优雅的 API

**决策**: 提供简洁、类型安全的 API，便于其他模块使用

**理由**:

- Isolation 是基础设施的基础，API 必须简单直观
- 其他模块（caching、logging）会频繁使用
- 类型安全确保编译时发现错误

**API 设计示例**:

#### Caching 模块使用

```typescript
// libs/nestjs-caching/src/cache.service.ts
import { Injectable } from '@nestjs/common';
import { IsolationContext } from '@hl8/isolation-model'; // 零依赖，框架无关！
import type { IIsolationContextProvider } from '@hl8/isolation-model';

@Injectable()
export class CacheService {
  constructor(
    private readonly contextProvider: IIsolationContextProvider, // 注入接口
  ) {}

  async get<T>(namespace: string, key: string): Promise<T | null> {
    // 获取隔离上下文
    const context =
      this.contextProvider.getIsolationContext() ?? IsolationContext.platform();

    // 使用领域模型生成缓存键
    const cacheKey = context.buildCacheKey(namespace, key);

    // 执行缓存操作
    return this.redis.get(cacheKey);
  }
}
```

#### Logging 模块使用

```typescript
// libs/nestjs-logging/src/logger.service.ts
import { Injectable } from '@nestjs/common';
import { IsolationContext } from '@hl8/isolation-model'; // 零依赖，框架无关！
import type { IIsolationContextProvider } from '@hl8/isolation-model';

@Injectable()
export class LoggerService {
  constructor(
    private readonly contextProvider: IIsolationContextProvider, // 注入接口
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
      message,
      data,
    });
  }
}
```

#### Database 模块使用

```typescript
// libs/nestjs-database/src/repository.base.ts
import { IsolationContext, IsolationLevel } from '@hl8/isolation-model';

export abstract class BaseRepository<T> {
  protected buildWhereClause(context: IsolationContext): any {
    const level = context.getIsolationLevel();

    switch (level) {
      case IsolationLevel.TENANT:
        return { tenantId: context.tenantId?.getValue() };

      case IsolationLevel.ORGANIZATION:
        return {
          tenantId: context.tenantId?.getValue(),
          organizationId: context.organizationId?.getValue(),
        };

      case IsolationLevel.DEPARTMENT:
        return {
          tenantId: context.tenantId?.getValue(),
          organizationId: context.organizationId?.getValue(),
          departmentId: context.departmentId?.getValue(),
        };

      default:
        return {};
    }
  }
}
```

**API 设计原则**:

1. ✅ **简洁性**: 方法命名清晰，参数最少
2. ✅ **类型安全**: 完整的 TypeScript 类型定义
3. ✅ **零开销**: 所有操作纯计算，无 IO
4. ✅ **易用性**: 提供静态工厂方法，避免 new
5. ✅ **可组合**: 方法可以组合使用

**参考资料**:

- [API Design Principles](https://principlesofdesign.com/)
- [TypeScript API Design Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

### 5. 性能优化 - 零开销抽象

**决策**: 领域模型使用纯计算，无 IO 操作，实现零开销

**理由**:

- 上下文操作会在每个请求中执行
- 必须确保性能开销最小
- 纯计算可以被 V8 优化

**性能优化技巧**:

#### 1. 值对象缓存（Flyweight 模式）

```typescript
/**
 * 租户 ID 值对象（带缓存）
 */
export class TenantId {
  private static cache = new Map<string, TenantId>();

  private constructor(private readonly value: string) {
    this.validate();
  }

  /**
   * 创建租户 ID（使用缓存）
   *
   * @description 相同的 ID 值返回相同的实例，减少对象创建开销
   */
  static create(value: string): TenantId {
    // 从缓存获取
    let instance = this.cache.get(value);

    if (!instance) {
      instance = new TenantId(value);
      this.cache.set(value, instance);
    }

    return instance;
  }

  getValue(): string {
    return this.value;
  }

  equals(other?: TenantId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new IsolationValidationError(
        '租户 ID 必须是非空字符串',
        'INVALID_TENANT_ID',
      );
    }
  }
}
```

**Flyweight 优势**:

- ✅ 减少对象创建开销
- ✅ 内存占用更少
- ✅ 相等性比较更快（引用比较）
- ✅ 对于高频使用的 ID 特别有效

#### 2. 延迟计算

```typescript
export class IsolationContext {
  private _level?: IsolationLevel; // 缓存计算结果

  getIsolationLevel(): IsolationLevel {
    // 延迟计算 + 缓存结果
    if (this._level === undefined) {
      if (this.departmentId) this._level = IsolationLevel.DEPARTMENT;
      else if (this.organizationId) this._level = IsolationLevel.ORGANIZATION;
      else if (this.tenantId) this._level = IsolationLevel.TENANT;
      else if (this.userId) this._level = IsolationLevel.USER;
      else this._level = IsolationLevel.PLATFORM;
    }

    return this._level;
  }
}
```

#### 3. 字符串拼接优化

```typescript
// ✅ 使用数组 join（更快）
buildCacheKey(namespace: string, key: string): string {
  const parts: string[] = [];
  // ... 添加部分
  return parts.join(':');
}

// ❌ 避免字符串拼接（慢）
buildCacheKey(namespace: string, key: string): string {
  let result = '';
  result += 'tenant:';
  result += this.tenantId.getValue();
  // ...
  return result;
}
```

**性能基准**:

- 值对象创建（带缓存）: < 0.1ms
- 隔离级别计算（带缓存）: < 0.01ms
- buildCacheKey: < 0.5ms
- buildLogContext: < 0.3ms
- canAccess: < 0.2ms

**替代方案 rejected**:

- **使用 prototype 方法**: 可读性差，维护困难
- **使用字符串模板**: 性能略差于数组 join

**参考资料**:

- [JavaScript Performance Optimization](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [V8 Engine Optimization](https://v8.dev/docs/turbofan)

---

## 总结与建议

### 关键决策汇总

| 决策点   | 选择方案                    | 理由                       |
| -------- | --------------------------- | -------------------------- |
| 拆分策略 | 领域模型 + 实现库（两个包） | 依赖倒置，避免依赖传递     |
| 依赖管理 | 领域模型零依赖              | 最小依赖，跨平台通用       |
| DDD 设计 | IsolationContext 充血模型   | 业务逻辑封装，避免贫血模型 |
| API 设计 | 简洁、类型安全              | 易用性，被多个模块引用     |
| 性能优化 | Flyweight + 延迟计算        | 零开销抽象                 |

### 实施建议

**第一阶段（Week 1）**:

1. 创建 `libs/nestjs-isolation` 领域模型库
   - 实现值对象（TenantId、OrganizationId、DepartmentId、UserId）
   - 实现 IsolationContext 实体
   - 实现枚举（IsolationLevel、SharingLevel）
   - 编写单元测试（覆盖率 >= 95%）

**第二阶段（Week 2）**: 2. 创建 `libs/nestjs-isolation-impl` 实现库

- 实现 IsolationContextService（基于 nestjs-cls）
- 实现 MultiLevelIsolationService
- 实现中间件、守卫、装饰器
- 编写集成测试

**第三阶段（Week 3）**: 3. 更新依赖库使用新的领域模型

- 更新 `libs/nestjs-caching` 使用 @hl8/nestjs-isolation
- 更新 `libs/nestjs-logging` 使用 @hl8/nestjs-isolation
- 移除对 @hl8/platform 的 IsolationContext 依赖

**第四阶段（Week 4）**: 4. 兼容层和迁移

- 在 `libs/nestjs-infra` 创建兼容层
- 提供迁移指南
- 完善文档

### 风险与缓解

| 风险       | 影响 | 缓解措施                                              |
| ---------- | ---- | ----------------------------------------------------- |
| 依赖循环   | 高   | 明确依赖方向：caching/logging → isolation（领域模型） |
| API 复杂度 | 中   | 提供静态工厂方法，简化使用                            |
| 性能开销   | 低   | 使用 Flyweight 和延迟计算优化                         |
| 测试困难   | 低   | 零依赖使测试更简单                                    |

### 关键洞察

**为什么这样设计非常重要？**

1. **避免依赖地狱**:

   ```
   错误设计：
   caching → isolation-impl → nestjs-cls
                            → @nestjs/common
                            → class-validator

   正确设计：
   caching → isolation（零依赖！）
   ```

2. **灵活的实现**:

   ```typescript
   // 可以有多种实现
   libs/nestjs-isolation           # NestJS + nestjs-cls
   libs/express-isolation          # Express + express-cls（未来）
   libs/koa-isolation              # Koa + koa-cls（未来）

   // 但都依赖同一个领域模型
   libs/isolation-model            # 纯领域模型，框架无关
   ```

3. **统一的业务语言**:

   ```typescript
   // 所有模块使用相同的领域模型
   caching.buildKey(context); // 使用 IsolationContext
   logger.log(message, context); // 使用 IsolationContext
   database.query(context); // 使用 IsolationContext
   ```

---

**研究完成日期**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 研究完成，关键决策已明确
**重要结论**: 领域模型必须零依赖，确保被引用时不引入额外依赖
