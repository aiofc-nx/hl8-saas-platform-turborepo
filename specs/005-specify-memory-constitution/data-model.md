# 数据模型设计: SAAS 平台核心模块重构

**Feature**: SAAS 平台核心模块重构  
**Date**: 2025-01-27  
**Branch**: `005-specify-memory-constitution`

## 核心实体模型

### 1. 模块实体 (Module Entities)

#### hybrid-archi 模块
```typescript
/**
 * 架构基础库模块
 * 
 * @description 提供通用的架构设计模式和基础组件
 * 包含 Clean Architecture、DDD、CQRS、ES、EDA 的核心实现
 * 
 * @example
 * ```typescript
 * import { BaseEntity, BaseAggregateRoot, CommandBus } from '@hl8/hybrid-archi';
 * ```
 */
interface HybridArchiModule {
  // 基础架构组件
  baseEntity: BaseEntity;
  baseAggregateRoot: BaseAggregateRoot;
  baseValueObject: BaseValueObject<T>;
  baseDomainEvent: BaseDomainEvent;
  
  // CQRS 组件
  commandBus: CommandBus;
  queryBus: QueryBus;
  eventBus: EventBus;
  baseCommand: BaseCommand;
  baseQuery: BaseQuery;
  
  // 通用值对象
  email: Email;
  username: Username;
  phoneNumber: PhoneNumber;
  password: Password;
}
```

#### libs/isolation-model 模块
```typescript
/**
 * 隔离模型模块
 * 
 * @description 提供多层级数据隔离的领域模型和业务规则
 * 与 hybrid-archi domain 层存在重叠内容，需要特别处理
 * 
 * @example
 * ```typescript
 * import { TenantIsolation, OrganizationIsolation } from '@hl8/isolation-model';
 * ```
 */
interface IsolationModelModule {
  // 隔离层级模型
  platformIsolation: PlatformIsolation;
  tenantIsolation: TenantIsolation;
  organizationIsolation: OrganizationIsolation;
  departmentIsolation: DepartmentIsolation;
  userIsolation: UserIsolation;
  
  // 数据分类模型
  sharedData: SharedData;
  nonSharedData: NonSharedData;
  
  // 访问控制模型
  accessContext: AccessContext;
  isolationContext: IsolationContext;
}
```

#### saas-core 模块
```typescript
/**
 * SAAS 核心业务模块
 * 
 * @description 实现 SAAS 平台的核心业务功能
 * 包括多租户管理、用户管理、组织架构、角色权限等
 * 
 * @example
 * ```typescript
 * import { TenantAggregate, UserAggregate } from '@hl8/saas-core';
 * ```
 */
interface SaasCoreModule {
  // 租户管理
  tenantAggregate: TenantAggregate;
  tenantCode: TenantCode;
  tenantDomain: TenantDomain;
  tenantQuota: TenantQuota;
  tenantType: TenantType;
  tenantStatus: TenantStatus;
  
  // 用户管理
  userAggregate: UserAggregate;
  userProfile: UserProfile;
  userCredentials: UserCredentials;
  
  // 组织架构
  organizationAggregate: OrganizationAggregate;
  departmentAggregate: DepartmentAggregate;
  
  // 角色权限
  roleAggregate: RoleAggregate;
  permissionAggregate: PermissionAggregate;
}
```

### 2. 基础设施模块实体

#### 数据库模块 (@hl8/database)
```typescript
/**
 * 数据库基础设施模块
 * 
 * @description 提供数据库操作和 ORM 支持
 * 基于 MikroORM 和 PostgreSQL
 */
interface DatabaseModule {
  entityManager: EntityManager;
  repository: Repository<T>;
  connection: Connection;
  migration: Migration;
}
```

#### 缓存模块 (@hl8/caching)
```typescript
/**
 * 缓存基础设施模块
 * 
 * @description 提供缓存管理和策略
 * 基于 Redis 实现多层级缓存
 */
interface CachingModule {
  cacheManager: CacheManager;
  cacheStrategy: CacheStrategy;
  cacheKey: CacheKey;
}
```

#### 日志模块 (@hl8/nestjs-fastify/logging)
```typescript
/**
 * 日志基础设施模块
 * 
 * @description 基于 NestJS 和 Fastify 的日志服务
 * 支持结构化日志和日志级别管理
 */
interface LoggingModule {
  logger: Logger;
  logLevel: LogLevel;
  logContext: LogContext;
}
```

#### 隔离服务模块 (@hl8/nestjs-isolation)
```typescript
/**
 * 多租户隔离服务模块
 * 
 * @description 提供多租户隔离和数据隔离支持
 * 实现数据访问的自动过滤和上下文管理
 */
interface IsolationModule {
  isolationService: IsolationService;
  tenantContext: TenantContext;
  dataFilter: DataFilter;
}
```

#### 异常处理模块 (@hl8/exceptions)
```typescript
/**
 * 异常处理基础设施模块
 * 
 * @description 统一异常处理和错误管理
 * 遵循"异常优先，日志辅助"原则
 */
interface ExceptionModule {
  businessException: BusinessException;
  technicalException: TechnicalException;
  exceptionHandler: ExceptionHandler;
}
```

## 数据关系模型

### 模块依赖关系
```mermaid
graph TD
    A[saas-core] --> B[hybrid-archi]
    A --> C[libs/isolation-model]
    A --> D[@hl8/database]
    A --> E[@hl8/caching]
    A --> F[@hl8/nestjs-fastify/logging]
    A --> G[@hl8/nestjs-isolation]
    A --> H[@hl8/exceptions]
    
    C --> B
    C --> I[@hl8/nestjs-isolation]
    
    B --> J[通用架构组件]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#e8f5e8
```

### 数据隔离层级关系
```typescript
/**
 * 数据隔离层级关系
 * 
 * @description 定义了五个层级的隔离关系
 * 支持共享数据和非共享数据的细粒度访问控制
 */
interface IsolationHierarchy {
  platform: {
    level: 'platform';
    scope: 'global';
    data: 'platform-management';
  };
  tenant: {
    level: 'tenant';
    scope: 'tenant-wide';
    data: 'tenant-specific';
  };
  organization: {
    level: 'organization';
    scope: 'organization-wide';
    data: 'organization-specific';
  };
  department: {
    level: 'department';
    scope: 'department-wide';
    data: 'department-specific';
  };
  user: {
    level: 'user';
    scope: 'user-private';
    data: 'user-specific';
  };
}
```

## 验证规则

### 模块边界验证
```typescript
/**
 * 模块边界验证规则
 * 
 * @description 确保模块职责清晰，依赖关系正确
 */
interface ModuleBoundaryValidation {
  // hybrid-archi 只能包含通用架构组件
  hybridArchiConstraints: {
    allowed: ['BaseEntity', 'BaseAggregateRoot', 'CQRS组件', '通用值对象'];
    forbidden: ['业务特定组件', 'TenantStatus', 'OrganizationStatus'];
  };
  
  // saas-core 只能包含 SAAS 业务逻辑
  saasCoreConstraints: {
    allowed: ['租户管理', '用户管理', '组织架构', '角色权限'];
    forbidden: ['通用架构组件', '基础设施实现'];
  };
  
  // isolation-model 只能包含隔离相关模型
  isolationModelConstraints: {
    allowed: ['隔离模型', '数据分类', '访问控制'];
    forbidden: ['业务逻辑', '基础设施实现'];
  };
}
```

### 依赖关系验证
```typescript
/**
 * 依赖关系验证规则
 * 
 * @description 确保依赖关系符合 Clean Architecture 原则
 */
interface DependencyValidation {
  // 依赖方向必须从外向内
  dependencyDirection: {
    saasCore: ['hybrid-archi', 'infrastructure-modules'];
    isolationModel: ['hybrid-archi', '@hl8/nestjs-isolation'];
    hybridArchi: ['none']; // 不依赖任何业务模块
  };
  
  // 禁止循环依赖
  circularDependencyCheck: {
    rule: 'no-circular-dependencies';
    validation: 'dependency-graph-analysis';
  };
}
```

## 状态转换模型

### 重构状态转换
```typescript
/**
 * 重构状态转换模型
 * 
 * @description 定义重构过程中的状态转换和验证点
 */
interface RefactoringStateMachine {
  states: {
    'analysis': '分析现有代码和重叠内容';
    'planning': '制定重构计划和策略';
    'cleaning': '清理 hybrid-archi 业务特定组件';
    'overlap-handling': '处理重叠内容';
    'migration': '迁移 saas-core 依赖';
    'testing': '测试和验证';
    'documentation': '更新文档和示例';
    'completed': '重构完成';
  };
  
  transitions: {
    'analysis': ['planning'];
    'planning': ['cleaning', 'overlap-handling'];
    'cleaning': ['overlap-handling'];
    'overlap-handling': ['migration'];
    'migration': ['testing'];
    'testing': ['documentation', 'migration']; // 测试失败可回退到迁移
    'documentation': ['completed'];
  };
}
```

## 业务规则

### 重叠内容处理规则
```typescript
/**
 * 重叠内容处理业务规则
 * 
 * @description 定义如何处理 libs/isolation-model 与 hybrid-archi 的重叠内容
 */
interface OverlapHandlingRules {
  // 保留规则：通用架构组件保留在 hybrid-archi
  preserve: {
    condition: '通用架构组件';
    action: '保留在 hybrid-archi';
    examples: ['BaseEntity', 'BaseAggregateRoot', 'CQRS组件'];
  };
  
  // 迁移规则：业务特定组件迁移到 saas-core
  migrate: {
    condition: 'SAAS 业务特定组件';
    action: '迁移到 saas-core';
    examples: ['TenantStatus', 'OrganizationStatus'];
  };
  
  // 重构规则：隔离相关组件重构到 isolation-model
  refactor: {
    condition: '隔离模型相关组件';
    action: '重构到 isolation-model';
    examples: ['隔离策略', '数据分类模型'];
  };
}
```

### 数据完整性规则
```typescript
/**
 * 数据完整性业务规则
 * 
 * @description 确保重构过程中数据的完整性和一致性
 */
interface DataIntegrityRules {
  // 业务功能完整性
  businessFunctionIntegrity: {
    rule: '所有现有业务功能必须保持完整';
    validation: '端到端测试验证';
  };
  
  // 模块接口兼容性
  moduleInterfaceCompatibility: {
    rule: '模块接口变更必须向后兼容';
    validation: '接口兼容性测试';
  };
  
  // 数据迁移完整性
  dataMigrationIntegrity: {
    rule: '数据迁移过程不能丢失或损坏数据';
    validation: '数据完整性检查';
  };
}
```

## 约束条件

### 技术约束
- 必须遵循 Clean Architecture + DDD + CQRS + ES + EDA 架构模式
- 必须使用 TypeScript 5.9.2 和 Node.js >= 20
- 必须使用 pnpm 作为包管理工具
- 必须遵循中文优先原则和代码即文档原则

### 业务约束
- 重构过程中系统停机时间不超过 2 小时
- 必须保持现有业务功能的完整性
- 必须使用统一语言原则，确保术语使用的一致性
- 核心业务逻辑测试覆盖率必须达到 80% 以上

### 性能约束
- 重构后系统性能不能低于重构前
- 模块加载时间不能显著增加
- 内存使用不能显著增加
- 构建时间目标减少 50%
