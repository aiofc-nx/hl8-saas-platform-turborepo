# Tasks: SAAS平台核心业务模块扩展

**Feature**: SAAS平台核心业务模块扩展  
**Branch**: `005-libs-business-core`  
**Date**: 2024-12-19  
**Phase**: Implementation Tasks

## 概述

基于现有的libs/business-core混合架构框架，扩展SAAS平台核心业务模块，实现Platform、Tenant、Organization、Department、User等核心领域实体，为未来的进销存、人力资源管理、财务管理、客户关系管理等业务系统提供统一的架构基础和通用功能组件。

## 技术栈

- **Language**: TypeScript 5.9.3, Node.js >=20
- **Framework**: NestJS 11.1.6
- **Dependencies**: @hl8/business-core, @hl8/isolation-model, @hl8/database, @hl8/messaging, @casl/ability
- **Storage**: PostgreSQL with multi-tenant isolation, Redis for caching
- **Testing**: Jest 30.2.0, ts-jest 29.4.5
- **Architecture**: Clean Architecture + DDD + CQRS + ES + EDA

## 任务组织

### Phase 1: 项目初始化 (Setup)

**目标**: 建立项目基础架构和开发环境

#### T001: 项目结构初始化
- **文件**: `libs/business-core/`
- **描述**: 创建libs/business-core扩展的基础目录结构
- **任务**: 
  - 创建src/domain/entities/目录结构
  - 创建src/domain/value-objects/目录结构
  - 创建src/domain/aggregates/目录结构
  - 创建src/application/use-cases/目录结构
  - 创建src/infrastructure/adapters/目录结构
  - 创建__tests__/目录结构

#### T002: 依赖配置
- **文件**: `libs/business-core/package.json`
- **描述**: 配置项目依赖和脚本
- **任务**:
  - 添加@casl/ability依赖
  - 配置TypeScript编译选项
  - 配置Jest测试环境
  - 配置ESLint规则

#### T003: 基础类型定义
- **文件**: `libs/business-core/src/shared/types/`
- **描述**: 定义共享类型和接口
- **任务**:
  - 创建EntityId类型
  - 创建AuditInfo接口
  - 创建BaseEntity抽象类
  - 创建BaseValueObject抽象类
  - 创建BaseAggregateRoot抽象类

### Phase 2: 基础设施任务 (Foundational)

**目标**: 建立所有用户故事依赖的基础设施

#### T004: 数据库模式设计
- **文件**: `libs/business-core/src/infrastructure/database/schema/`
- **描述**: 设计多租户数据库模式
- **任务**:
  - 设计Platform表结构
  - 设计Tenant表结构
  - 设计Organization表结构
  - 设计Department表结构
  - 设计User表结构
  - 设计Authentication表结构
  - 设计Permission表结构
  - 设计Role表结构
  - 设计多租户隔离字段

#### T005: 事件存储基础设施
- **文件**: `libs/business-core/src/infrastructure/event-sourcing/`
- **描述**: 实现事件溯源基础设施
- **任务**:
  - 实现EventStore接口
  - 实现PostgreSQLEventStore
  - 实现SnapshotStore接口
  - 实现RedisSnapshotStore
  - 实现EventMigrator

#### T006: 消息队列基础设施
- **文件**: `libs/business-core/src/infrastructure/messaging/`
- **描述**: 实现事件驱动架构基础设施
- **任务**:
  - 实现MessageQueue接口
  - 实现RabbitMQMessageQueue
  - 实现DeadLetterQueue
  - 实现EventMonitor

#### T007: 权限系统基础设施
- **文件**: `libs/business-core/src/infrastructure/security/`
- **描述**: 实现基于CASL的权限系统基础设施
- **任务**:
  - 实现PermissionService
  - 实现RoleService
  - 实现PermissionMergeService
  - 实现PermissionInheritanceService

### Phase 3: 用户故事1 - 平台管理员管理租户 (US1)

**目标**: 实现平台管理员创建和管理租户功能

**独立测试标准**: 可以通过创建租户、分配资源、验证数据隔离来独立测试，确保每个租户拥有独立的数据空间。

#### T008: 租户值对象实现
- **文件**: `libs/business-core/src/domain/value-objects/tenant-type.ts`
- **描述**: 实现租户类型值对象
- **任务**:
  - 实现TenantType枚举
  - 实现租户类型验证逻辑
  - 实现租户类型转换方法
- **[P]**: 可与其他值对象并行开发

#### T009: 租户实体实现
- **文件**: `libs/business-core/src/domain/entities/tenant/tenant.entity.ts`
- **描述**: 实现租户实体
- **任务**:
  - 实现Tenant实体类
  - 实现租户创建业务逻辑
  - 实现租户状态管理
  - 实现租户配置管理

#### T010: 租户聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/tenant-aggregate.ts`
- **描述**: 实现租户聚合根
- **任务**:
  - 实现TenantAggregate类
  - 实现租户创建指令
  - 实现租户更新指令
  - 实现租户删除指令
  - 实现租户事件发布

#### T011: 租户仓储接口
- **文件**: `libs/business-core/src/domain/repositories/tenant.repository.ts`
- **描述**: 定义租户仓储接口
- **任务**:
  - 定义ITenantRepository接口
  - 定义租户查询方法
  - 定义租户保存方法
  - 定义租户删除方法

#### T012: 租户仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/tenant.repository.adapter.ts`
- **描述**: 实现租户仓储适配器
- **任务**:
  - 实现TenantRepositoryAdapter
  - 实现租户数据持久化
  - 实现租户数据查询
  - 实现多租户数据隔离

#### T013: 创建租户用例
- **文件**: `libs/business-core/src/application/use-cases/tenant/create-tenant.use-case.ts`
- **描述**: 实现创建租户用例
- **任务**:
  - 实现CreateTenantUseCase
  - 实现租户创建业务逻辑
  - 实现租户创建事件发布
  - 实现租户创建验证

#### T014: 更新租户用例
- **文件**: `libs/business-core/src/application/use-cases/tenant/update-tenant.use-case.ts`
- **描述**: 实现更新租户用例
- **任务**:
  - 实现UpdateTenantUseCase
  - 实现租户更新业务逻辑
  - 实现租户更新事件发布
  - 实现租户更新验证

#### T015: 租户查询用例
- **文件**: `libs/business-core/src/application/use-cases/tenant/get-tenants.use-case.ts`
- **描述**: 实现租户查询用例
- **任务**:
  - 实现GetTenantsUseCase
  - 实现租户列表查询
  - 实现租户过滤和分页
  - 实现租户详情查询

#### T016: 租户API端点
- **文件**: `libs/business-core/src/infrastructure/adapters/port-adapters/tenant.controller.ts`
- **描述**: 实现租户API端点
- **任务**:
  - 实现租户创建端点
  - 实现租户更新端点
  - 实现租户查询端点
  - 实现租户删除端点
  - 实现权限验证

#### T017: 租户领域事件
- **文件**: `libs/business-core/src/domain/events/tenant-events.ts`
- **描述**: 实现租户相关领域事件
- **任务**:
  - 实现TenantCreatedEvent
  - 实现TenantUpdatedEvent
  - 实现TenantDeletedEvent
  - 实现租户事件处理器

### Phase 4: 用户故事2 - 租户管理员管理组织架构 (US2)

**目标**: 实现租户管理员创建和管理组织架构功能

**独立测试标准**: 可以通过创建组织、部门、设置层级关系来独立测试，验证组织架构的完整性和权限继承。

#### T018: 组织类型值对象
- **文件**: `libs/business-core/src/domain/value-objects/organization-type.ts`
- **描述**: 实现组织类型值对象
- **任务**:
  - 实现OrganizationType枚举
  - 实现组织类型验证逻辑
  - 实现组织类型转换方法
- **[P]**: 可与其他值对象并行开发

#### T019: 部门层级值对象
- **文件**: `libs/business-core/src/domain/value-objects/department-level.ts`
- **描述**: 实现部门层级值对象
- **任务**:
  - 实现DepartmentLevel枚举
  - 实现部门层级验证逻辑
  - 实现部门层级转换方法
- **[P]**: 可与其他值对象并行开发

#### T020: 组织实体实现
- **文件**: `libs/business-core/src/domain/entities/organization/organization.entity.ts`
- **描述**: 实现组织实体
- **任务**:
  - 实现Organization实体类
  - 实现组织创建业务逻辑
  - 实现组织状态管理
  - 实现组织配置管理

#### T021: 部门实体实现
- **文件**: `libs/business-core/src/domain/entities/department/department.entity.ts`
- **描述**: 实现部门实体
- **任务**:
  - 实现Department实体类
  - 实现部门创建业务逻辑
  - 实现部门层级管理
  - 实现部门路径管理

#### T022: 组织聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/organization-aggregate.ts`
- **描述**: 实现组织聚合根
- **任务**:
  - 实现OrganizationAggregate类
  - 实现组织创建指令
  - 实现组织更新指令
  - 实现组织删除指令
  - 实现组织事件发布

#### T023: 部门聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/department-aggregate.ts`
- **描述**: 实现部门聚合根
- **任务**:
  - 实现DepartmentAggregate类
  - 实现部门创建指令
  - 实现部门更新指令
  - 实现部门删除指令
  - 实现部门事件发布

#### T024: 组织仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/organization.repository.adapter.ts`
- **描述**: 实现组织仓储适配器
- **任务**:
  - 实现OrganizationRepositoryAdapter
  - 实现组织数据持久化
  - 实现组织数据查询
  - 实现多租户数据隔离

#### T025: 部门仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/department.repository.adapter.ts`
- **描述**: 实现部门仓储适配器
- **任务**:
  - 实现DepartmentRepositoryAdapter
  - 实现部门数据持久化
  - 实现部门数据查询
  - 实现多租户数据隔离

#### T026: 组织用例实现
- **文件**: `libs/business-core/src/application/use-cases/organization/`
- **描述**: 实现组织相关用例
- **任务**:
  - 实现CreateOrganizationUseCase
  - 实现UpdateOrganizationUseCase
  - 实现GetOrganizationsUseCase
  - 实现DeleteOrganizationUseCase

#### T027: 部门用例实现
- **文件**: `libs/business-core/src/application/use-cases/department/`
- **描述**: 实现部门相关用例
- **任务**:
  - 实现CreateDepartmentUseCase
  - 实现UpdateDepartmentUseCase
  - 实现GetDepartmentsUseCase
  - 实现DeleteDepartmentUseCase

#### T028: 组织架构API端点
- **文件**: `libs/business-core/src/infrastructure/adapters/port-adapters/organization.controller.ts`
- **描述**: 实现组织架构API端点
- **任务**:
  - 实现组织管理端点
  - 实现部门管理端点
  - 实现组织架构查询端点
  - 实现权限验证

### Phase 5: 用户故事3 - 用户管理和权限分配 (US3)

**目标**: 实现用户管理和权限分配功能

**独立测试标准**: 可以通过用户注册、分配角色、设置权限来独立测试，验证权限控制的准确性和安全性。

#### T029: 用户状态值对象
- **文件**: `libs/business-core/src/domain/value-objects/user-status.ts`
- **描述**: 实现用户状态值对象
- **任务**:
  - 实现UserStatus枚举
  - 实现用户状态验证逻辑
  - 实现用户状态转换方法
- **[P]**: 可与其他值对象并行开发

#### T030: 用户角色值对象
- **文件**: `libs/business-core/src/domain/value-objects/user-role.ts`
- **描述**: 实现用户角色值对象
- **任务**:
  - 实现UserRole枚举
  - 实现用户角色验证逻辑
  - 实现用户角色转换方法
- **[P]**: 可与其他值对象并行开发

#### T031: 用户实体实现
- **文件**: `libs/business-core/src/domain/entities/user/user.entity.ts`
- **描述**: 实现用户实体
- **任务**:
  - 实现User实体类
  - 实现用户创建业务逻辑
  - 实现用户状态管理
  - 实现用户角色管理
  - 实现用户权限管理

#### T032: 身份认证实体实现
- **文件**: `libs/business-core/src/domain/entities/authentication/authentication.entity.ts`
- **描述**: 实现身份认证实体
- **任务**:
  - 实现Authentication实体类
  - 实现认证凭据管理
  - 实现认证状态管理
  - 实现登录失败锁定

#### T033: 认证会话实体实现
- **文件**: `libs/business-core/src/domain/entities/authentication/auth-session.entity.ts`
- **描述**: 实现认证会话实体
- **任务**:
  - 实现AuthSession实体类
  - 实现会话令牌管理
  - 实现会话状态管理
  - 实现设备信息管理

#### T034: 权限实体实现
- **文件**: `libs/business-core/src/domain/entities/permission/permission.entity.ts`
- **描述**: 实现权限实体
- **任务**:
  - 实现Permission实体类
  - 实现权限定义管理
  - 实现权限范围管理
  - 实现权限状态管理

#### T035: 角色实体实现
- **文件**: `libs/business-core/src/domain/entities/role/role.entity.ts`
- **描述**: 实现角色实体
- **任务**:
  - 实现Role实体类
  - 实现角色定义管理
  - 实现角色权限管理
  - 实现角色继承管理

#### T036: 用户聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/user-aggregate.ts`
- **描述**: 实现用户聚合根
- **任务**:
  - 实现UserAggregate类
  - 实现用户创建指令
  - 实现用户更新指令
  - 实现用户角色分配指令
  - 实现用户权限分配指令

#### T037: 身份认证聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/authentication-aggregate.ts`
- **描述**: 实现身份认证聚合根
- **任务**:
  - 实现AuthenticationAggregate类
  - 实现用户认证指令
  - 实现会话管理指令
  - 实现密码管理指令

#### T038: 权限聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/permission-aggregate.ts`
- **描述**: 实现权限聚合根
- **任务**:
  - 实现PermissionAggregate类
  - 实现权限创建指令
  - 实现权限更新指令
  - 实现权限删除指令

#### T039: 角色聚合根实现
- **文件**: `libs/business-core/src/domain/aggregates/role-aggregate.ts`
- **描述**: 实现角色聚合根
- **任务**:
  - 实现RoleAggregate类
  - 实现角色创建指令
  - 实现角色更新指令
  - 实现角色权限分配指令

#### T040: 用户仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/user.repository.adapter.ts`
- **描述**: 实现用户仓储适配器
- **任务**:
  - 实现UserRepositoryAdapter
  - 实现用户数据持久化
  - 实现用户数据查询
  - 实现多租户数据隔离

#### T041: 身份认证仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/authentication.repository.adapter.ts`
- **描述**: 实现身份认证仓储适配器
- **任务**:
  - 实现AuthenticationRepositoryAdapter
  - 实现认证数据持久化
  - 实现认证数据查询
  - 实现多租户数据隔离

#### T042: 权限仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/permission.repository.adapter.ts`
- **描述**: 实现权限仓储适配器
- **任务**:
  - 实现PermissionRepositoryAdapter
  - 实现权限数据持久化
  - 实现权限数据查询
  - 实现多租户数据隔离

#### T043: 角色仓储实现
- **文件**: `libs/business-core/src/infrastructure/adapters/repository-adapters/role.repository.adapter.ts`
- **描述**: 实现角色仓储适配器
- **任务**:
  - 实现RoleRepositoryAdapter
  - 实现角色数据持久化
  - 实现角色数据查询
  - 实现多租户数据隔离

#### T044: 用户用例实现
- **文件**: `libs/business-core/src/application/use-cases/user/`
- **描述**: 实现用户相关用例
- **任务**:
  - 实现CreateUserUseCase
  - 实现UpdateUserUseCase
  - 实现GetUsersUseCase
  - 实现DeleteUserUseCase
  - 实现AssignUserRoleUseCase

#### T045: 身份认证用例实现
- **文件**: `libs/business-core/src/application/use-cases/authentication/`
- **描述**: 实现身份认证相关用例
- **任务**:
  - 实现AuthenticateUserUseCase
  - 实现CreateSessionUseCase
  - 实现ValidateSessionUseCase
  - 实现RefreshTokenUseCase

#### T046: 权限用例实现
- **file**: `libs/business-core/src/application/use-cases/permission/`
- **描述**: 实现权限相关用例
- **任务**:
  - 实现CreatePermissionUseCase
  - 实现UpdatePermissionUseCase
  - 实现GetPermissionsUseCase
  - 实现DeletePermissionUseCase

#### T047: 角色用例实现
- **文件**: `libs/business-core/src/application/use-cases/role/`
- **描述**: 实现角色相关用例
- **任务**:
  - 实现CreateRoleUseCase
  - 实现UpdateRoleUseCase
  - 实现GetRolesUseCase
  - 实现DeleteRoleUseCase
  - 实现AssignRolePermissionUseCase

#### T048: 用户管理API端点
- **文件**: `libs/business-core/src/infrastructure/adapters/port-adapters/user.controller.ts`
- **描述**: 实现用户管理API端点
- **任务**:
  - 实现用户管理端点
  - 实现身份认证端点
  - 实现权限管理端点
  - 实现角色管理端点
  - 实现权限验证

### Phase 6: 用户故事4 - 业务系统集成准备 (US4)

**目标**: 为未来的业务系统提供统一的架构基础和通用功能组件

**独立测试标准**: 可以通过创建业务实体、定义业务规则、实现通用服务来独立测试，验证架构的可扩展性。

#### T049: 通用业务实体基类
- **文件**: `libs/business-core/src/domain/entities/base/`
- **描述**: 实现通用业务实体基类
- **任务**:
  - 实现BaseBusinessEntity
  - 实现BaseBusinessAggregate
  - 实现通用业务规则验证
  - 实现通用业务事件发布

#### T050: 通用服务接口
- **文件**: `libs/business-core/src/domain/services/base/`
- **描述**: 实现通用服务接口
- **任务**:
  - 实现IBusinessService接口
  - 实现IValidationService接口
  - 实现IAuditService接口
  - 实现ISecurityService接口

#### T051: 通用验证服务
- **文件**: `libs/business-core/src/domain/services/validation.service.ts`
- **描述**: 实现通用验证服务
- **任务**:
  - 实现数据验证逻辑
  - 实现业务规则验证
  - 实现权限验证
  - 实现多租户验证

#### T052: 通用审计服务
- **文件**: `libs/business-core/src/domain/services/audit.service.ts`
- **描述**: 实现通用审计服务
- **任务**:
  - 实现操作审计记录
  - 实现数据变更追踪
  - 实现安全事件记录
  - 实现审计日志管理

#### T053: 通用安全服务
- **文件**: `libs/business-core/src/domain/services/security.service.ts`
- **描述**: 实现通用安全服务
- **任务**:
  - 实现数据加密服务
  - 实现权限验证服务
  - 实现安全策略管理
  - 实现威胁检测服务

#### T054: 通用事件服务
- **文件**: `libs/business-core/src/domain/services/event.service.ts`
- **描述**: 实现通用事件服务
- **任务**:
  - 实现事件发布服务
  - 实现事件订阅服务
  - 实现事件路由服务
  - 实现事件监控服务

#### T055: 通用配置服务
- **文件**: `libs/business-core/src/domain/services/config.service.ts`
- **描述**: 实现通用配置服务
- **任务**:
  - 实现配置管理服务
  - 实现配置验证服务
  - 实现配置更新服务
  - 实现配置审计服务

#### T056: 业务规则引擎
- **文件**: `libs/business-core/src/domain/services/rule-engine.service.ts`
- **描述**: 实现业务规则引擎
- **任务**:
  - 实现规则定义服务
  - 实现规则执行服务
  - 实现规则验证服务
  - 实现规则监控服务

#### T057: 通用API端点
- **文件**: `libs/business-core/src/infrastructure/adapters/port-adapters/business.controller.ts`
- **描述**: 实现通用业务API端点
- **任务**:
  - 实现通用CRUD端点
  - 实现通用查询端点
  - 实现通用验证端点
  - 实现通用审计端点

### Phase 7: 集成和优化 (Polish & Integration)

**目标**: 实现跨功能集成和系统优化

#### T058: 事件驱动集成
- **文件**: `libs/business-core/src/infrastructure/event-driven/`
- **描述**: 实现事件驱动架构集成
- **任务**:
  - 实现事件总线集成
  - 实现事件处理器集成
  - 实现事件监控集成
  - 实现事件重试机制

#### T059: 多租户数据隔离集成
- **文件**: `libs/business-core/src/infrastructure/security/`
- **描述**: 实现多租户数据隔离集成
- **任务**:
  - 实现数据隔离中间件
  - 实现权限验证中间件
  - 实现审计日志中间件
  - 实现安全策略中间件

#### T060: 性能优化
- **文件**: `libs/business-core/src/infrastructure/performance/`
- **描述**: 实现性能优化
- **任务**:
  - 实现缓存策略
  - 实现查询优化
  - 实现事件处理优化
  - 实现数据库优化

#### T061: 监控和告警
- **文件**: `libs/business-core/src/infrastructure/monitoring/`
- **描述**: 实现监控和告警
- **任务**:
  - 实现系统监控
  - 实现性能监控
  - 实现安全监控
  - 实现告警机制

#### T062: 文档和测试
- **文件**: `libs/business-core/docs/`
- **描述**: 实现文档和测试
- **任务**:
  - 实现API文档
  - 实现架构文档
  - 实现使用指南
  - 实现测试用例

## 依赖关系图

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Polish)
```

### 用户故事依赖关系

- **US1 (租户管理)**: 依赖Phase 1和Phase 2
- **US2 (组织架构)**: 依赖US1完成
- **US3 (用户管理)**: 依赖US1和US2完成
- **US4 (业务集成)**: 依赖US1、US2、US3完成

### 并行执行机会

**Phase 3 (US1) 内可并行**:
- T008, T009, T010 (值对象、实体、聚合根)
- T011, T012 (仓储接口和实现)
- T013, T014, T015 (用例实现)

**Phase 4 (US2) 内可并行**:
- T018, T019 (值对象实现)
- T020, T021 (实体实现)
- T022, T023 (聚合根实现)

**Phase 5 (US3) 内可并行**:
- T029, T030 (值对象实现)
- T031, T032, T033, T034, T035 (实体实现)
- T036, T037, T038, T039 (聚合根实现)

## 实施策略

### MVP范围
- **Phase 1-3**: 实现租户管理功能 (US1)
- **Phase 4**: 实现组织架构管理功能 (US2)
- **Phase 5**: 实现用户管理和权限分配功能 (US3)
- **Phase 6-7**: 实现业务系统集成准备和优化

### 增量交付
1. **Sprint 1**: 完成Phase 1-2 (基础设施)
2. **Sprint 2**: 完成Phase 3 (租户管理)
3. **Sprint 3**: 完成Phase 4 (组织架构)
4. **Sprint 4**: 完成Phase 5 (用户管理)
5. **Sprint 5**: 完成Phase 6-7 (集成优化)

### 质量保证
- 每个用户故事完成后进行独立测试
- 每个阶段完成后进行集成测试
- 持续集成和持续部署
- 代码审查和架构审查

## 总结

- **总任务数**: 62个任务
- **用户故事任务数**: 
  - US1: 10个任务
  - US2: 11个任务  
  - US3: 20个任务
  - US4: 9个任务
- **并行机会**: 每个阶段内都有多个并行执行机会
- **独立测试标准**: 每个用户故事都有明确的独立测试标准
- **建议MVP范围**: Phase 1-3 (租户管理功能)

每个任务都足够具体，可以直接由LLM执行，无需额外上下文。
