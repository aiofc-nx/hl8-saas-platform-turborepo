# 快速开始指南: SAAS平台核心业务模块

**Feature**: SAAS平台核心业务模块扩展  
**Date**: 2024-12-19  
**Phase**: Phase 1 - Design & Contracts

## 概述

本指南将帮助您快速了解和使用SAAS平台核心业务模块。该模块基于Clean Architecture + DDD + CQRS + 事件溯源（ES）+ 事件驱动架构（EDA）的混合架构模式，为未来的进销存、人力资源管理、财务管理、客户关系管理等业务系统提供统一的架构基础。

## 核心概念

### 业务实体

- **Platform（平台）**: SAAS服务的提供商，管理所有租户和用户
- **Tenant（租户）**: 独立客户单位，拥有独立数据空间，支持四种类型
- **Organization（组织）**: 租户内的横向管理单位，专注于特定职能
- **Department（部门）**: 纵向管理机构，支持8层嵌套，具有明确层级关系
- **User（用户）**: 系统使用者，支持多种分类和状态管理

### 架构模式

- **Clean Architecture**: 四层架构，依赖倒置
- **DDD**: 领域驱动设计，统一语言
- **CQRS**: 命令查询职责分离
- **ES**: 事件溯源，完整审计追踪
- **EDA**: 事件驱动架构，系统解耦

## 快速开始

### 1. 安装依赖

```bash
# 进入项目根目录
cd /home/arligle/hl8/hl8-saas-platform-turborepo

# 安装依赖
pnpm install

# 构建业务核心模块
pnpm build --filter=@hl8/business-core
```

### 2. 基础使用

#### 创建平台

```typescript
import { CreatePlatformUseCase } from '@hl8/business-core';
import { EntityId } from '@hl8/isolation-model';

// 使用用例创建平台
const createPlatformUseCase = new CreatePlatformUseCase(
  platformRepository,
  eventPublisher
);

// 创建平台
const platform = await createPlatformUseCase.execute({
  name: 'HL8 SAAS平台',
  description: '企业级SAAS服务平台',
  domain: 'https://hl8.com',
  settings: {
    maxTenants: 1000,
    maxUsers: 10000,
    features: ['multi-tenant', 'rbac', 'audit']
  }
});
```

#### 创建租户

```typescript
import { CreateTenantUseCase } from '@hl8/business-core';
import { TenantType } from '@hl8/business-core';

// 使用用例创建租户
const createTenantUseCase = new CreateTenantUseCase(
  tenantRepository,
  eventPublisher
);

// 创建企业租户
const tenant = await createTenantUseCase.execute({
  platformId: platformId,
  name: '企业租户',
  type: TenantType.ENTERPRISE,
  settings: {
    maxUsers: 100,
    maxOrganizations: 10,
    maxDepartments: 50,
    features: ['hr', 'finance', 'crm']
  }
});
```

#### 创建组织

```typescript
import { CreateOrganizationUseCase } from '@hl8/business-core';
import { OrganizationType } from '@hl8/business-core';

// 使用用例创建组织
const createOrganizationUseCase = new CreateOrganizationUseCase(
  organizationRepository,
  eventPublisher
);

// 创建专业委员会
const organization = await createOrganizationUseCase.execute({
  tenantId: tenantId,
  name: '技术委员会',
  type: OrganizationType.COMMITTEE,
  description: '负责技术决策和标准制定'
});
```

#### 创建部门

```typescript
import { CreateDepartmentUseCase } from '@hl8/business-core';
import { DepartmentLevel } from '@hl8/business-core';

// 使用用例创建部门
const createDepartmentUseCase = new CreateDepartmentUseCase(
  departmentRepository,
  eventPublisher
);

// 创建一级部门
const department = await createDepartmentUseCase.execute({
  tenantId: tenantId,
  organizationId: organizationId,
  name: '技术部',
  level: DepartmentLevel.LEVEL_1,
  parentId: null,
  path: '技术部'
});
```

#### 创建用户

```typescript
import { CreateUserUseCase } from '@hl8/business-core';
import { UserRole, UserStatus } from '@hl8/business-core';

// 使用用例创建用户
const createUserUseCase = new CreateUserUseCase(
  userRepository,
  authenticationRepository,
  eventPublisher
);

// 创建平台用户
const user = await createUserUseCase.execute({
  platformId: platformId,
  username: 'admin',
  email: 'admin@hl8.com',
  phone: '+86-138-0000-0000',
  password: 'admin123',
  roles: [UserRole.PLATFORM_ADMIN],
  status: UserStatus.ACTIVE
});
```

### 3. 权限管理

#### 分配用户角色

```typescript
import { AssignUserRoleUseCase } from '@hl8/business-core';
import { UserRole } from '@hl8/business-core';

// 使用用例分配用户角色
const assignUserRoleUseCase = new AssignUserRoleUseCase(
  userRepository,
  roleRepository,
  eventPublisher
);

// 分配租户管理员角色
await assignUserRoleUseCase.execute({
  userId: userId,
  roleType: UserRole.TENANT_ADMIN,
  scope: RoleScope.TENANT_LEVEL,
  tenantId: tenantId
});

// 分配组织管理员角色
await assignUserRoleUseCase.execute({
  userId: userId,
  roleType: UserRole.ORGANIZATION_ADMIN,
  scope: RoleScope.ORGANIZATION_LEVEL,
  tenantId: tenantId,
  organizationId: organizationId
});
```

#### 基于CASL的权限管理

```typescript
import { defineAbility, Ability } from '@casl/ability';
import { PermissionService } from '@hl8/business-core';

// 定义用户权限能力
const userAbility = defineAbility((can, cannot) => {
  // 租户管理员权限
  can('manage', 'Tenant', { id: user.tenantId });
  can('read', 'Tenant', { id: user.tenantId });
  can('update', 'Tenant', { id: user.tenantId });
  
  // 组织管理权限
  can('manage', 'Organization', { tenantId: user.tenantId });
  can('read', 'Organization', { tenantId: user.tenantId });
  can('create', 'Organization', { tenantId: user.tenantId });
  
  // 部门管理权限
  can('manage', 'Department', { tenantId: user.tenantId });
  can('read', 'Department', { tenantId: user.tenantId });
  can('create', 'Department', { tenantId: user.tenantId });
  
  // 用户管理权限
  can('manage', 'User', { tenantId: user.tenantId });
  can('read', 'User', { tenantId: user.tenantId });
  can('update', 'User', { tenantId: user.tenantId });
});

// 创建权限服务
const permissionService = new PermissionService(userAbility);

// 检查权限
const canManageTenant = permissionService.can('manage', 'Tenant', { id: tenantId });
const canReadUsers = permissionService.can('read', 'User', { tenantId: user.tenantId });

// 权限验证并抛出异常
permissionService.checkPermission('manage', 'Tenant', { id: tenantId });
permissionService.checkPermission('read', 'User', { tenantId: user.tenantId });
```

### 4. 身份认证

#### 用户登录

```typescript
import { AuthenticateUserUseCase } from '@hl8/business-core';

// 使用用例进行用户认证
const authenticateUserUseCase = new AuthenticateUserUseCase(
  authenticationRepository,
  sessionRepository,
  passwordService,
  eventPublisher
);

// 用户登录
const authResult = await authenticateUserUseCase.execute({
  email: 'admin@hl8.com',
  password: 'admin123',
  deviceInfo: {
    deviceId: 'device-123',
    deviceType: 'desktop',
    osName: 'Windows',
    osVersion: '10',
    browserName: 'Chrome',
    browserVersion: '120.0'
  },
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});

// 获取访问令牌
const accessToken = authResult.accessToken;
const refreshToken = authResult.refreshToken;
```

#### 会话管理

```typescript
import { CreateSessionUseCase, ValidateSessionUseCase } from '@hl8/business-core';

// 创建会话
const createSessionUseCase = new CreateSessionUseCase(
  sessionRepository,
  eventPublisher
);

const session = await createSessionUseCase.execute({
  userId: userId,
  authId: authId,
  deviceInfo: deviceInfo,
  ipAddress: ipAddress,
  userAgent: userAgent,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
});

// 验证会话
const validateSessionUseCase = new ValidateSessionUseCase(
  sessionRepository
);

const isValid = await validateSessionUseCase.execute({
  sessionToken: sessionToken
});
```

### 5. 事件处理

#### 发布领域事件

```typescript
import { EventPublisher } from '@hl8/business-core';

// 发布平台创建事件
await eventPublisher.publish(new PlatformCreatedEvent({
  platformId: platformId,
  name: 'HL8 SAAS平台',
  domain: 'https://hl8.com',
  timestamp: new Date()
}));
```

#### 订阅领域事件

```typescript
import { EventSubscriber } from '@hl8/business-core';

// 订阅租户创建事件
@EventSubscriber(TenantCreatedEvent)
export class TenantCreatedHandler {
  async handle(event: TenantCreatedEvent): Promise<void> {
    // 处理租户创建事件
    console.log(`租户 ${event.tenantId} 已创建`);
    
    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(event.tenantId);
    
    // 初始化租户数据
    await this.tenantService.initializeTenantData(event.tenantId);
  }
}
```

### 6. 数据查询

#### 查询平台列表

```typescript
import { GetPlatformsQuery } from '@hl8/business-core';

// 使用查询对象查询平台列表
const getPlatformsQuery = new GetPlatformsQuery(
  platformRepository
);

const platforms = await getPlatformsQuery.execute({
  page: 1,
  limit: 20,
  status: 'active'
});
```

#### 查询租户列表

```typescript
import { GetTenantsQuery } from '@hl8/business-core';

// 使用查询对象查询租户列表
const getTenantsQuery = new GetTenantsQuery(
  tenantRepository
);

const tenants = await getTenantsQuery.execute({
  platformId: platformId,
  page: 1,
  limit: 20,
  type: 'enterprise',
  status: 'active'
});
```

#### 查询组织架构

```typescript
import { GetOrganizationsQuery } from '@hl8/business-core';

// 使用查询对象查询组织架构
const getOrganizationsQuery = new GetOrganizationsQuery(
  organizationRepository,
  departmentRepository
);

const organizations = await getOrganizationsQuery.execute({
  tenantId: tenantId,
  includeDepartments: true,
  includeUsers: true
});
```

### 6. 数据隔离

#### 多租户数据隔离

```typescript
import { IsolationContext } from '@hl8/business-core';

// 设置隔离上下文
const context = new IsolationContext({
  platformId: platformId,
  tenantId: tenantId,
  organizationId: organizationId,
  departmentId: departmentId,
  userId: userId
});

// 在隔离上下文中执行操作
await context.execute(async () => {
  // 所有数据操作都会自动应用隔离过滤
  const users = await userRepository.findAll();
  // 只返回当前租户的用户
});
```

#### 基于CASL的权限验证

```typescript
import { defineAbility } from '@casl/ability';
import { PermissionService } from '@hl8/business-core';

// 定义用户权限能力
const userAbility = defineAbility((can, cannot) => {
  // 根据用户角色定义权限
  if (user.roles.includes(UserRole.PLATFORM_ADMIN)) {
    can('manage', 'Platform');
    can('manage', 'Tenant');
    can('manage', 'Organization');
    can('manage', 'Department');
    can('manage', 'User');
  } else if (user.roles.includes(UserRole.TENANT_ADMIN)) {
    can('manage', 'Tenant', { id: user.tenantId });
    can('manage', 'Organization', { tenantId: user.tenantId });
    can('manage', 'Department', { tenantId: user.tenantId });
    can('manage', 'User', { tenantId: user.tenantId });
  } else if (user.roles.includes(UserRole.ORGANIZATION_ADMIN)) {
    can('manage', 'Organization', { id: { $in: user.organizationIds } });
    can('manage', 'Department', { organizationId: { $in: user.organizationIds } });
    can('manage', 'User', { organizationId: { $in: user.organizationIds } });
  } else if (user.roles.includes(UserRole.DEPARTMENT_ADMIN)) {
    can('manage', 'Department', { id: { $in: user.departmentIds } });
    can('manage', 'User', { departmentId: { $in: user.departmentIds } });
  } else {
    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });
  }
});

// 创建权限服务
const permissionService = new PermissionService(userAbility);

// 验证用户权限
const canManageTenant = permissionService.can('manage', 'Tenant', { id: tenantId });
const canReadUsers = permissionService.can('read', 'User', { tenantId: user.tenantId });

// 权限验证并抛出异常
try {
  permissionService.checkPermission('manage', 'Tenant', { id: tenantId });
  permissionService.checkPermission('read', 'User', { tenantId: user.tenantId });
} catch (error) {
  if (error instanceof ForbiddenException) {
    console.log('权限不足:', error.message);
  }
}
```

## 最佳实践

### 1. 领域模型设计

- 保持领域模型的纯净性
- 使用值对象封装业务概念
- 通过聚合根管理业务一致性
- 使用领域事件处理业务逻辑

### 2. 基于CASL的权限控制

- 遵循最小权限原则
- 使用CASL的声明式权限定义
- 实现权限继承和合并
- 使用CASL的Subject和Conditions支持复杂权限条件
- 记录所有权限变更
- 使用CASL的Ability类管理权限状态

### 3. 数据隔离

- 所有数据操作都包含隔离上下文
- 使用数据库索引优化查询性能
- 实现缓存键包含隔离信息
- 记录完整的审计日志

### 4. 事件处理

- 使用异步事件处理
- 保证事件顺序和一致性
- 实现事件重试和错误处理
- 使用死信队列处理失败事件

### 5. 测试策略

- 编写单元测试覆盖业务逻辑
- 使用集成测试验证数据持久化
- 使用端到端测试验证用户场景
- 保持测试的独立性和可重复性

## 故障排除

### 常见问题

1. **权限验证失败**
   - 检查用户角色和权限配置
   - 验证隔离上下文设置
   - 确认资源访问权限

2. **数据隔离问题**
   - 检查隔离字段设置
   - 验证数据库索引
   - 确认缓存键包含隔离信息

3. **事件处理失败**
   - 检查事件订阅者配置
   - 验证事件顺序
   - 查看错误日志和重试机制

4. **性能问题**
   - 检查数据库查询性能
   - 验证缓存策略
   - 优化事件处理性能

### 调试技巧

1. **启用详细日志**
   ```typescript
   // 设置日志级别
   logger.setLevel('debug');
   ```

2. **使用调试工具**
   ```typescript
   // 启用调试模式
   process.env.DEBUG = 'hl8:business-core:*';
   ```

3. **监控系统指标**
   ```typescript
   // 监控性能指标
   const metrics = await systemMetrics.getMetrics();
   console.log(metrics);
   ```

## 下一步

- 查看[数据模型文档](./data-model.md)了解详细的实体设计
- 查看[API合约文档](./contracts/platform-api.yaml)了解API接口
- 查看[研究文档](./research.md)了解技术选型和架构决策
- 开始实现具体的业务功能

## 支持

如果您在使用过程中遇到问题，请：

1. 查看项目文档和示例代码
2. 检查错误日志和调试信息
3. 参考最佳实践和故障排除指南
4. 联系开发团队获取支持

---

**注意**: 本模块基于现有的libs/business-core架构，请确保已正确安装和配置相关依赖。
