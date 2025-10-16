# Data Model: SAAS平台核心业务模块

**Feature**: SAAS平台核心业务模块扩展  
**Date**: 2024-12-19  
**Phase**: Phase 1 - Design & Contracts

## 核心实体模型

### Authentication（身份认证实体）

**业务描述**: 用户身份认证的核心实体，管理用户的登录凭据和认证状态

**属性**:
- `id: EntityId` - 认证记录唯一标识符
- `userId: EntityId` - 关联的用户标识符
- `platformId: EntityId` - 所属平台标识符
- `tenantId: EntityId | null` - 所属租户标识符
- `authType: AuthType` - 认证类型（密码、OAuth、SSO、MFA等）
- `credentials: AuthCredentials` - 认证凭据（加密存储）
- `status: AuthStatus` - 认证状态（活跃、锁定、过期、禁用）
- `lastLoginAt: Date | null` - 最后登录时间
- `lastLoginIp: string | null` - 最后登录IP
- `loginAttempts: number` - 登录尝试次数
- `lockedUntil: Date | null` - 锁定到期时间
- `expiresAt: Date | null` - 认证过期时间
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 用户在同一平台内只能有一个活跃的认证记录
- 认证凭据必须加密存储
- 登录失败次数超过限制时自动锁定
- 认证过期时间必须大于当前时间
- 锁定时间必须大于当前时间
- 认证状态变更需要记录审计日志

**状态转换**:
- 创建 → 活跃
- 活跃 → 锁定（登录失败次数超限）
- 锁定 → 活跃（管理员解锁或锁定时间到期）
- 活跃 → 过期（认证过期）
- 活跃 → 禁用（管理员禁用）

### AuthCredentials（认证凭据值对象）

**业务描述**: 存储和管理用户的认证凭据信息

**属性**:
- `passwordHash: string | null` - 密码哈希值
- `salt: string | null` - 密码盐值
- `oauthProviders: OAuthProvider[]` - OAuth提供商信息
- `mfaSecret: string | null` - 多因素认证密钥
- `mfaEnabled: boolean` - 是否启用多因素认证
- `backupCodes: string[]` - 备用验证码
- `ssoProvider: string | null` - SSO提供商

**业务规则**:
- 密码必须使用强哈希算法加密
- OAuth凭据必须安全存储
- 多因素认证密钥必须加密存储
- 备用验证码必须一次性使用
- 凭据更新需要验证当前凭据

### AuthSession（认证会话实体）

**业务描述**: 管理用户的认证会话和令牌

**属性**:
- `id: EntityId` - 会话唯一标识符
- `userId: EntityId` - 关联的用户标识符
- `authId: EntityId` - 关联的认证记录标识符
- `sessionToken: string` - 会话令牌
- `refreshToken: string | null` - 刷新令牌
- `accessToken: string | null` - 访问令牌
- `deviceInfo: DeviceInfo` - 设备信息
- `ipAddress: string` - IP地址
- `userAgent: string` - 用户代理
- `status: SessionStatus` - 会话状态（活跃、过期、撤销）
- `expiresAt: Date` - 会话过期时间
- `lastActivityAt: Date` - 最后活动时间
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 会话令牌必须唯一且不可预测
- 刷新令牌用于获取新的访问令牌
- 会话过期时间必须大于当前时间
- 设备信息用于安全验证
- 会话状态变更需要记录审计日志

**状态转换**:
- 创建 → 活跃
- 活跃 → 过期（会话过期）
- 活跃 → 撤销（用户登出或管理员撤销）
- 过期 → 撤销（清理过期会话）

### Permission（权限实体）

**业务描述**: 系统权限的基础单位，定义用户可以执行的具体操作

**属性**:
- `id: EntityId` - 权限唯一标识符
- `platformId: EntityId` - 所属平台标识符
- `name: string` - 权限名称
- `code: string` - 权限代码（唯一标识）
- `description: string` - 权限描述
- `subject: string` - CASL Subject（资源类型）
- `action: string` - CASL Action（操作类型）
- `conditions: object` - CASL Conditions（权限条件）
- `scope: PermissionScope` - 权限范围（平台级、租户级、组织级、部门级）
- `fields: string[]` - 可访问的字段列表
- `status: PermissionStatus` - 权限状态（活跃、停用）
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 权限代码在同一平台内必须唯一
- 权限名称必须符合命名规范
- Subject和Action必须符合CASL规范
- 权限条件必须可序列化和验证
- 权限范围必须与Subject匹配
- 字段列表必须与Subject匹配

**状态转换**:
- 创建 → 活跃
- 活跃 → 停用（需要平台管理员权限）

### Role（角色实体）

**业务描述**: 权限的集合，定义用户在系统中的职责和权限范围

**属性**:
- `id: EntityId` - 角色唯一标识符
- `platformId: EntityId` - 所属平台标识符
- `tenantId: EntityId | null` - 所属租户标识符（租户级角色）
- `name: string` - 角色名称
- `code: string` - 角色代码（唯一标识）
- `description: string` - 角色描述
- `type: RoleType` - 角色类型（系统角色、租户角色、组织角色、部门角色）
- `level: RoleLevel` - 角色级别（平台级、租户级、组织级、部门级）
- `permissions: Permission[]` - 权限列表
- `inheritedRoles: Role[]` - 继承的角色列表
- `status: RoleStatus` - 角色状态（活跃、停用）
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 角色代码在同一范围内必须唯一
- 角色名称必须符合命名规范
- 角色类型必须与级别匹配
- 权限列表必须符合角色类型
- 继承的角色必须存在且有效
- 角色删除需要验证依赖关系

**状态转换**:
- 创建 → 活跃
- 活跃 → 停用（需要相应级别管理员权限）

### Platform（平台实体）

**业务描述**: SAAS服务的提供商，管理所有租户和用户

**属性**:
- `id: EntityId` - 平台唯一标识符
- `name: string` - 平台名称
- `description: string` - 平台描述
- `domain: string` - 平台域名
- `status: PlatformStatus` - 平台状态（活跃、维护、停用）
- `settings: PlatformSettings` - 平台配置
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 平台名称必须唯一
- 平台域名必须符合URL规范
- 平台状态变更需要记录审计日志
- 平台配置变更需要验证权限

**状态转换**:
- 创建 → 活跃
- 活跃 → 维护（需要管理员权限）
- 维护 → 活跃（需要管理员权限）
- 活跃 → 停用（需要超级管理员权限）

### Tenant（租户实体）

**业务描述**: 独立客户单位，拥有独立数据空间，支持四种类型

**属性**:
- `id: EntityId` - 租户唯一标识符
- `platformId: EntityId` - 所属平台标识符
- `name: string` - 租户名称
- `type: TenantType` - 租户类型（企业、社群、团队、个人）
- `status: TenantStatus` - 租户状态（活跃、暂停、停用）
- `settings: TenantSettings` - 租户配置
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 租户名称在同一平台内必须唯一
- 租户类型确定后不可变更
- 租户状态变更需要记录审计日志
- 租户配置变更需要验证权限

**状态转换**:
- 创建 → 活跃
- 活跃 → 暂停（需要平台管理员权限）
- 暂停 → 活跃（需要平台管理员权限）
- 活跃 → 停用（需要平台管理员权限）

### Organization（组织实体）

**业务描述**: 租户内的横向管理单位，专注于特定职能

**属性**:
- `id: EntityId` - 组织唯一标识符
- `tenantId: EntityId` - 所属租户标识符
- `name: string` - 组织名称
- `type: OrganizationType` - 组织类型（专业委员会、项目管理团队、质量控制小组、绩效管理小组）
- `description: string` - 组织描述
- `status: OrganizationStatus` - 组织状态（活跃、停用）
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 组织名称在同一租户内必须唯一
- 组织类型确定后不可变更
- 组织状态变更需要记录审计日志
- 组织创建需要租户管理员权限

**状态转换**:
- 创建 → 活跃
- 活跃 → 停用（需要租户管理员权限）

### Department（部门实体）

**业务描述**: 纵向管理机构，支持8层嵌套，具有明确层级关系

**属性**:
- `id: EntityId` - 部门唯一标识符
- `tenantId: EntityId` - 所属租户标识符
- `organizationId: EntityId` - 所属组织标识符
- `parentId: EntityId | null` - 上级部门标识符
- `name: string` - 部门名称
- `level: DepartmentLevel` - 部门层级（1-8级）
- `path: string` - 部门路径（如：总部/事业部/区域）
- `status: DepartmentStatus` - 部门状态（活跃、停用）
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 部门名称在同一组织内必须唯一
- 部门层级必须符合8层嵌套规则
- 部门路径必须反映层级关系
- 部门状态变更需要记录审计日志
- 部门创建需要组织管理员权限

**状态转换**:
- 创建 → 活跃
- 活跃 → 停用（需要组织管理员权限）

### User（用户实体）

**业务描述**: 系统使用者，支持多种分类和状态管理

**属性**:
- `id: EntityId` - 用户唯一标识符
- `platformId: EntityId` - 所属平台标识符
- `tenantId: EntityId | null` - 所属租户标识符
- `username: string` - 用户名
- `email: string` - 邮箱地址
- `phone: string | null` - 手机号码
- `status: UserStatus` - 用户状态（活跃、待激活、禁用、锁定、过期）
- `roles: UserRole[]` - 用户角色列表
- `permissions: UserPermission[]` - 用户权限列表
- `lastLoginAt: Date | null` - 最后登录时间
- `lastLoginIp: string | null` - 最后登录IP
- `loginCount: number` - 登录次数
- `failedLoginAttempts: number` - 失败登录次数
- `lockedUntil: Date | null` - 锁定到期时间
- `passwordChangedAt: Date | null` - 密码最后修改时间
- `emailVerified: boolean` - 邮箱是否已验证
- `phoneVerified: boolean` - 手机是否已验证
- `twoFactorEnabled: boolean` - 是否启用双因素认证
- `auditInfo: AuditInfo` - 审计信息

**业务规则**:
- 用户名在同一平台内必须唯一
- 邮箱地址必须符合邮箱格式
- 用户状态变更需要记录审计日志
- 用户角色分配需要验证权限
- 用户权限继承上级权限
- 登录失败次数超限时自动锁定账户
- 密码必须定期更新
- 邮箱和手机验证后才能激活账户
- 双因素认证启用后必须验证

**状态转换**:
- 注册 → 待激活
- 待激活 → 活跃（需要激活验证）
- 活跃 → 禁用（需要管理员权限）
- 禁用 → 活跃（需要管理员权限）
- 活跃 → 锁定（需要管理员权限）
- 锁定 → 活跃（需要管理员权限）
- 活跃 → 过期（权限过期）

## 值对象模型

### AuthType（认证类型）

**业务描述**: 定义不同的身份认证方式

**属性**:
- `type: TypeValue` - 类型值（密码、OAuth、SSO、MFA、生物识别等）
- `description: string` - 类型描述
- `securityLevel: SecurityLevel` - 安全级别（低、中、高）
- `features: Feature[]` - 功能特性
- `constraints: Constraint[]` - 约束条件

**业务规则**:
- 类型值确定后不可变更
- 安全级别必须符合业务要求
- 功能特性必须符合类型
- 约束条件必须可验证

### AuthStatus（认证状态）

**业务描述**: 管理认证记录的生命周期状态

**属性**:
- `status: StatusType` - 状态类型（活跃、锁定、过期、禁用）
- `reason: string | null` - 状态变更原因
- `changedAt: Date` - 状态变更时间
- `changedBy: EntityId` - 状态变更者
- `lockReason: string | null` - 锁定原因
- `unlockAt: Date | null` - 自动解锁时间

**业务规则**:
- 状态变更需要记录原因
- 锁定状态需要记录锁定原因
- 自动解锁时间必须大于当前时间
- 状态变更需要验证权限

### SessionStatus（会话状态）

**业务描述**: 管理认证会话的生命周期状态

**属性**:
- `status: StatusType` - 状态类型（活跃、过期、撤销）
- `reason: string | null` - 状态变更原因
- `changedAt: Date` - 状态变更时间
- `expiresAt: Date` - 过期时间
- `lastActivityAt: Date` - 最后活动时间

**业务规则**:
- 状态变更需要记录原因
- 过期时间必须大于当前时间
- 最后活动时间必须小于等于当前时间
- 会话撤销需要记录撤销原因

### DeviceInfo（设备信息）

**业务描述**: 记录用户登录设备的相关信息

**属性**:
- `deviceId: string` - 设备唯一标识符
- `deviceType: DeviceType` - 设备类型（桌面、移动、平板）
- `osName: string` - 操作系统名称
- `osVersion: string` - 操作系统版本
- `browserName: string` - 浏览器名称
- `browserVersion: string` - 浏览器版本
- `isTrusted: boolean` - 是否为受信任设备

**业务规则**:
- 设备标识符必须唯一
- 设备类型必须有效
- 操作系统和浏览器信息必须准确
- 受信任设备需要额外验证

### OAuthProvider（OAuth提供商）

**业务描述**: 管理OAuth认证的提供商信息

**属性**:
- `provider: string` - 提供商名称（Google、GitHub、Microsoft等）
- `providerId: string` - 提供商用户ID
- `accessToken: string` - 访问令牌
- `refreshToken: string | null` - 刷新令牌
- `expiresAt: Date | null` - 令牌过期时间
- `scope: string[]` - 授权范围

**业务规则**:
- 提供商名称必须有效
- 访问令牌必须加密存储
- 刷新令牌用于获取新的访问令牌
- 授权范围必须符合业务要求

### PermissionScope（权限范围）

**业务描述**: 定义权限的作用范围

**属性**:
- `scope: ScopeType` - 范围类型（平台级、租户级、组织级、部门级）
- `platformId: EntityId` - 平台标识符
- `tenantId: EntityId | null` - 租户标识符
- `organizationId: EntityId | null` - 组织标识符
- `departmentId: EntityId | null` - 部门标识符

**业务规则**:
- 平台级权限：仅包含platformId
- 租户级权限：包含platformId + tenantId
- 组织级权限：包含platformId + tenantId + organizationId
- 部门级权限：包含platformId + tenantId + organizationId + departmentId

### PermissionStatus（权限状态）

**业务描述**: 管理权限的生命周期状态

**属性**:
- `status: StatusType` - 状态类型（活跃、停用）
- `reason: string | null` - 状态变更原因
- `changedAt: Date` - 状态变更时间
- `changedBy: EntityId` - 状态变更者

**业务规则**:
- 状态变更需要记录原因
- 状态变更需要验证权限
- 停用权限需要验证依赖关系

### RoleType（角色类型）

**业务描述**: 区分不同类型的角色

**属性**:
- `type: TypeValue` - 类型值（系统角色、租户角色、组织角色、部门角色）
- `description: string` - 类型描述
- `features: Feature[]` - 功能特性
- `constraints: Constraint[]` - 约束条件

**业务规则**:
- 类型值确定后不可变更
- 功能特性必须符合类型
- 约束条件必须可验证

### RoleLevel（角色级别）

**业务描述**: 定义角色的管理级别

**属性**:
- `level: LevelValue` - 级别值（平台级、租户级、组织级、部门级）
- `name: string` - 级别名称
- `parentLevel: LevelValue | null` - 上级级别
- `childrenLevels: LevelValue[]` - 下级级别

**业务规则**:
- 级别值必须在有效范围内
- 级别名称必须唯一
- 上级级别必须存在
- 下级级别必须有效

### RoleStatus（角色状态）

**业务描述**: 管理角色的生命周期状态

**属性**:
- `status: StatusType` - 状态类型（活跃、停用）
- `reason: string | null` - 状态变更原因
- `changedAt: Date` - 状态变更时间
- `changedBy: EntityId` - 状态变更者

**业务规则**:
- 状态变更需要记录原因
- 状态变更需要验证权限
- 停用角色需要验证依赖关系

### UserRole（用户角色）

**业务描述**: 定义用户权限级别

**属性**:
- `roleType: RoleType` - 角色类型（平台管理员、租户管理员、组织管理员、部门管理员、普通用户）
- `scope: RoleScope` - 角色范围（平台级、租户级、组织级、部门级）
- `permissions: Permission[]` - 权限列表
- `inheritedFrom: EntityId | null` - 继承来源

**业务规则**:
- 角色类型确定后不可变更
- 角色范围必须与角色类型匹配
- 权限列表必须符合角色类型
- 继承权限需要验证来源

### UserStatus（用户状态）

**业务描述**: 管理用户生命周期

**属性**:
- `status: StatusType` - 状态类型（活跃、待激活、禁用、锁定、过期）
- `reason: string | null` - 状态变更原因
- `expiresAt: Date | null` - 过期时间
- `lockedUntil: Date | null` - 锁定到期时间

**业务规则**:
- 状态变更需要记录原因
- 过期时间必须大于当前时间
- 锁定时间必须大于当前时间
- 状态变更需要验证权限

### UserPermission（用户权限）

**业务描述**: 基于CASL的权限系统，控制资源访问和操作权限

**属性**:
- `subject: string` - CASL Subject（资源类型）
- `action: string` - CASL Action（操作类型）
- `conditions: object` - CASL Conditions（权限条件）
- `scope: PermissionScope` - 权限范围（平台级、租户级、组织级、部门级）
- `fields: string[]` - 可访问的字段列表

**业务规则**:
- Subject必须符合CASL规范
- Action必须符合CASL规范
- Conditions必须可序列化和验证
- 权限范围必须与资源匹配
- 字段列表必须与Subject匹配

**CASL集成**:
- 使用CASL的Ability类定义权限
- 支持复杂的权限条件和规则
- 支持动态权限计算
- 支持权限继承和合并

### TenantType（租户类型）

**业务描述**: 区分企业、社群、团队、个人租户

**属性**:
- `type: TypeValue` - 类型值（企业、社群、团队、个人）
- `features: Feature[]` - 功能特性
- `limits: Limit[]` - 限制条件

**业务规则**:
- 类型值确定后不可变更
- 功能特性必须符合类型
- 限制条件必须可验证

### OrganizationType（组织类型）

**业务描述**: 区分专业委员会、项目管理团队、质量控制小组、绩效管理小组

**属性**:
- `type: TypeValue` - 类型值（专业委员会、项目管理团队、质量控制小组、绩效管理小组）
- `purpose: string` - 组织目的
- `authority: Authority[]` - 管理权限

**业务规则**:
- 类型值确定后不可变更
- 组织目的必须明确
- 管理权限必须符合类型

### DepartmentLevel（部门层级）

**业务描述**: 支持8层嵌套的部门结构

**属性**:
- `level: number` - 层级值（1-8）
- `name: string` - 层级名称
- `parentLevel: number | null` - 上级层级
- `childrenLevels: number[]` - 下级层级

**业务规则**:
- 层级值必须在1-8范围内
- 层级名称必须唯一
- 上级层级必须存在
- 下级层级必须有效

## 聚合根模型

### AuthenticationAggregate（身份认证聚合根）

**业务描述**: 身份认证管理聚合，负责用户认证相关的所有业务逻辑

**聚合根职责**:
- 管理认证一致性边界
- 协调内部实体操作
- 发布领域事件
- 验证业务规则
- 处理跨实体的业务逻辑

**包含实体**:
- Authentication（身份认证内部实体）
- AuthCredentials（认证凭据值对象）
- AuthSession（认证会话内部实体）

**业务规则**:
- 用户认证需要验证凭据有效性
- 登录失败次数超限时自动锁定账户
- 认证状态变更需要记录审计日志
- 会话管理需要验证设备信息
- 多因素认证需要额外验证步骤

**指令模式**:
- 聚合根发出指令：创建认证记录、验证凭据、管理会话
- 内部实体执行指令：执行具体认证逻辑、维护认证状态

### SessionAggregate（会话管理聚合根）

**业务描述**: 会话管理聚合，负责用户会话相关的所有业务逻辑

**聚合根职责**:
- 管理会话一致性边界
- 协调内部实体操作
- 发布领域事件
- 验证业务规则
- 处理跨实体的业务逻辑

**包含实体**:
- AuthSession（认证会话内部实体）
- DeviceInfo（设备信息值对象）

**业务规则**:
- 会话创建需要验证用户身份
- 会话令牌必须安全生成
- 会话过期需要自动清理
- 设备信息用于安全验证
- 会话撤销需要记录审计日志

**指令模式**:
- 聚合根发出指令：创建会话、验证令牌、管理设备
- 内部实体执行指令：执行具体会话逻辑、维护会话状态

### PermissionAggregate（权限聚合根）

**业务描述**: 权限管理聚合，负责权限相关的所有业务逻辑

**聚合根职责**:
- 管理权限一致性边界
- 协调内部实体操作
- 发布领域事件
- 验证业务规则
- 处理跨实体的业务逻辑

**包含实体**:
- Permission（权限内部实体）
- PermissionScope（权限范围值对象）
- PermissionStatus（权限状态值对象）

**业务规则**:
- 权限创建需要平台管理员权限
- 权限配置变更需要平台管理员权限
- 权限状态变更需要记录审计日志
- 权限删除需要验证依赖关系

**指令模式**:
- 聚合根发出指令：创建权限、配置权限、管理权限状态
- 内部实体执行指令：执行具体权限逻辑、维护权限状态

### RoleAggregate（角色聚合根）

**业务描述**: 角色管理聚合，负责角色相关的所有业务逻辑

**聚合根职责**:
- 管理角色一致性边界
- 协调内部实体操作
- 发布领域事件
- 验证业务规则
- 处理跨实体的业务逻辑

**包含实体**:
- Role（角色内部实体）
- RoleType（角色类型值对象）
- RoleLevel（角色级别值对象）
- RoleStatus（角色状态值对象）

**业务规则**:
- 角色创建需要相应级别管理员权限
- 角色配置变更需要相应级别管理员权限
- 角色状态变更需要记录审计日志
- 角色删除需要验证依赖关系
- 角色权限分配需要验证权限有效性

**指令模式**:
- 聚合根发出指令：创建角色、配置角色、管理角色权限
- 内部实体执行指令：执行具体角色逻辑、维护角色状态

### PlatformAggregate（平台聚合根）

**业务描述**: 平台管理聚合，负责平台相关的所有业务逻辑

**聚合根职责**:
- 管理平台一致性边界
- 协调内部实体操作
- 发布领域事件
- 验证业务规则
- 处理跨实体的业务逻辑

**包含实体**:
- Platform（平台内部实体）
- PlatformUser（平台用户内部实体）
- PlatformAdmin（平台管理员内部实体）

**业务规则**:
- 平台创建需要超级管理员权限
- 平台配置变更需要平台管理员权限
- 平台状态变更需要记录审计日志
- 平台删除需要验证依赖关系

**指令模式**:
- 聚合根发出指令：创建平台、配置平台、管理平台用户
- 内部实体执行指令：执行具体平台逻辑、维护平台状态

### TenantAggregate（租户聚合根）

**业务描述**: 租户管理聚合，负责租户相关的所有业务逻辑

**包含实体**:
- Tenant（租户实体）
- TenantUser（租户用户实体）
- TenantAdmin（租户管理员实体）

**业务规则**:
- 租户创建需要平台管理员权限
- 租户配置变更需要租户管理员权限
- 租户状态变更需要记录审计日志
- 租户删除需要验证依赖关系

### OrganizationAggregate（组织聚合根）

**业务描述**: 组织管理聚合，负责组织相关的所有业务逻辑

**包含实体**:
- Organization（组织实体）
- OrganizationUser（组织用户实体）
- OrganizationAdmin（组织管理员实体）

**业务规则**:
- 组织创建需要租户管理员权限
- 组织配置变更需要组织管理员权限
- 组织状态变更需要记录审计日志
- 组织删除需要验证依赖关系

### DepartmentAggregate（部门聚合根）

**业务描述**: 部门管理聚合，负责部门相关的所有业务逻辑

**包含实体**:
- Department（部门实体）
- DepartmentUser（部门用户实体）
- DepartmentAdmin（部门管理员实体）

**业务规则**:
- 部门创建需要组织管理员权限
- 部门配置变更需要部门管理员权限
- 部门状态变更需要记录审计日志
- 部门删除需要验证依赖关系

### UserAggregate（用户聚合根）

**业务描述**: 用户管理聚合，负责用户相关的所有业务逻辑

**包含实体**:
- User（用户实体）
- UserRole（用户角色）
- UserStatus（用户状态）
- UserPermission（用户权限）

**业务规则**:
- 用户注册需要验证唯一性
- 用户角色分配需要验证权限
- 用户状态变更需要记录审计日志
- 用户删除需要验证依赖关系

## 关系模型

### 层级关系

```
Platform (1) → (N) Tenant
Tenant (1) → (N) Organization
Tenant (1) → (N) Department
Organization (1) → (N) Department
Department (1) → (N) Department (自引用)
```

### 身份认证关系

```
User (1) → (1) Authentication (用户认证记录)
User (1) → (N) AuthSession (用户会话)
Authentication (1) → (N) AuthSession (认证会话)
Platform (1) → (N) Authentication (平台认证)
Tenant (1) → (N) Authentication (租户认证)
```

**关系说明**:
- 每个用户只能有一个活跃的认证记录
- 一个用户可以同时有多个活跃会话（多设备登录）
- 认证记录与会话是一对多关系
- 认证记录属于平台和租户

### 权限和角色关系

```
Platform (1) → (N) Permission
Platform (1) → (N) Role
Tenant (1) → (N) Role (租户级角色)
Role (1) → (N) Permission (角色权限分配)
Role (1) → (N) Role (角色继承关系)
```

### 用户关系

```
Platform (1) → (N) PlatformUser
Tenant (1) → (N) TenantUser
Organization (1) → (N) OrganizationUser
Department (1) → (N) DepartmentUser
User (1) → (N) UserRole
User (1) → (N) UserPermission
```

### 多对多关系

```
User (N) → (N) Tenant (通过TenantUser)
User (N) → (N) Organization (通过OrganizationUser)
User (N) → (N) Department (通过DepartmentUser)
User (N) → (N) Role (用户角色分配)
Role (N) → (N) Permission (角色权限分配)
Organization (N) → (N) Department (管理关系)
```

### 认证授权关系

```
User (1) → (1) Authentication (用户认证记录)
User (1) → (N) AuthSession (用户会话)
User (1) → (N) UserRole (用户角色分配)
User (1) → (N) UserPermission (用户权限分配)
Role (1) → (N) RolePermission (角色权限分配)
Role (1) → (N) Role (角色继承关系)
```

**认证授权关系说明**:
- 每个用户只能有一个活跃的认证记录
- 一个用户可以同时有多个活跃会话（多设备登录）
- 用户通过角色获得权限，支持角色继承
- 用户可以直接分配权限（绕过角色）
- 角色可以继承其他角色的权限
- 权限可以分配给多个角色

## 认证授权业务规则

### 认证业务规则

1. **身份验证规则**:
   - 用户必须通过身份验证才能访问系统
   - 支持多种认证方式：密码、OAuth、SSO、MFA
   - 认证失败次数超限时自动锁定账户
   - 认证会话必须定期刷新

2. **账户安全规则**:
   - 密码必须符合安全策略
   - 密码必须定期更新
   - 邮箱和手机必须验证后才能激活
   - 双因素认证启用后必须验证

3. **会话管理规则**:
   - 会话令牌必须安全生成
   - 会话必须设置过期时间
   - 支持多设备登录管理
   - 会话撤销必须记录审计日志

### 授权业务规则

1. **权限分配规则**:
   - 用户通过角色获得权限
   - 用户可以直接分配权限
   - 权限分配需要验证操作者权限
   - 权限变更需要记录审计日志

2. **角色管理规则**:
   - 角色可以继承其他角色的权限
   - 角色权限可以动态计算
   - 角色删除需要验证依赖关系
   - 角色变更需要记录审计日志

3. **权限验证规则**:
   - 基于CASL的权限验证
   - 支持资源、操作、条件权限
   - 支持字段级权限控制
   - 权限验证必须实时有效

### 多租户权限规则

1. **租户隔离规则**:
   - 租户间数据完全隔离
   - 租户管理员只能管理本租户
   - 平台管理员可以管理所有租户
   - 跨租户访问需要特殊权限

2. **层级权限规则**:
   - 上级权限包含下级权限
   - 部门管理员继承组织管理员权限
   - 组织管理员继承租户管理员权限
   - 租户管理员继承平台管理员权限

3. **权限继承规则**:
   - 用户权限 = 直接权限 + 角色权限 + 继承权限
   - 权限冲突时以最高权限为准
   - 权限撤销时自动清理相关权限
   - 权限变更时实时更新用户权限

## 数据隔离模型

### 隔离字段

所有业务实体必须包含以下隔离字段：
- `platformId: EntityId` - 平台标识符（必需）
- `tenantId: EntityId | null` - 租户标识符（租户级数据必需）
- `organizationId: EntityId | null` - 组织标识符（组织级数据必需）
- `departmentId: EntityId | null` - 部门标识符（部门级数据必需）
- `userId: EntityId | null` - 用户标识符（用户级数据必需）

**隔离字段规则**:
- 平台级数据：仅包含platformId
- 租户级数据：包含platformId + tenantId
- 组织级数据：包含platformId + tenantId + organizationId
- 部门级数据：包含platformId + tenantId + organizationId + departmentId
- 用户级数据：包含platformId + tenantId + organizationId + departmentId + userId

### 隔离级别

- **平台级**: 仅包含platformId
- **租户级**: 包含platformId + tenantId
- **组织级**: 包含platformId + tenantId + organizationId
- **部门级**: 包含platformId + tenantId + organizationId + departmentId
- **用户级**: 包含platformId + tenantId + organizationId + departmentId + userId

### 数据访问控制

- 平台级数据：仅平台管理员可访问
- 租户级数据：租户管理员和平台管理员可访问
- 组织级数据：组织管理员、租户管理员和平台管理员可访问
- 部门级数据：部门管理员、组织管理员、租户管理员和平台管理员可访问
- 用户级数据：用户本人、部门管理员、组织管理员、租户管理员和平台管理员可访问

## 事件模型

### 领域事件

- `PlatformCreated` - 平台创建事件
- `PlatformUpdated` - 平台更新事件
- `PlatformDeleted` - 平台删除事件
- `TenantCreated` - 租户创建事件
- `TenantUpdated` - 租户更新事件
- `TenantDeleted` - 租户删除事件
- `OrganizationCreated` - 组织创建事件
- `OrganizationUpdated` - 组织更新事件
- `OrganizationDeleted` - 组织删除事件
- `DepartmentCreated` - 部门创建事件
- `DepartmentUpdated` - 部门更新事件
- `DepartmentDeleted` - 部门删除事件
- `UserCreated` - 用户创建事件
- `UserUpdated` - 用户更新事件
- `UserDeleted` - 用户删除事件
- `UserRoleAssigned` - 用户角色分配事件
- `UserPermissionGranted` - 用户权限授予事件
- `AuthenticationCreated` - 身份认证创建事件
- `AuthenticationUpdated` - 身份认证更新事件
- `AuthenticationDeleted` - 身份认证删除事件
- `AuthenticationStatusChanged` - 身份认证状态变更事件
- `AuthenticationLocked` - 身份认证锁定事件
- `AuthenticationUnlocked` - 身份认证解锁事件
- `AuthSessionCreated` - 认证会话创建事件
- `AuthSessionUpdated` - 认证会话更新事件
- `AuthSessionDeleted` - 认证会话删除事件
- `AuthSessionExpired` - 认证会话过期事件
- `AuthSessionRevoked` - 认证会话撤销事件
- `LoginAttempted` - 登录尝试事件
- `LoginSucceeded` - 登录成功事件
- `LoginFailed` - 登录失败事件
- `LogoutSucceeded` - 登出成功事件
- `PasswordChanged` - 密码变更事件
- `MfaEnabled` - 多因素认证启用事件
- `MfaDisabled` - 多因素认证禁用事件
- `PermissionCreated` - 权限创建事件
- `PermissionUpdated` - 权限更新事件
- `PermissionDeleted` - 权限删除事件
- `PermissionStatusChanged` - 权限状态变更事件
- `RoleCreated` - 角色创建事件
- `RoleUpdated` - 角色更新事件
- `RoleDeleted` - 角色删除事件
- `RoleStatusChanged` - 角色状态变更事件
- `RolePermissionAssigned` - 角色权限分配事件
- `RolePermissionRevoked` - 角色权限撤销事件
- `RoleInheritanceChanged` - 角色继承关系变更事件

### 事件属性

每个事件包含以下属性：
- `eventId: EntityId` - 事件唯一标识符
- `aggregateId: EntityId` - 聚合根标识符
- `eventType: string` - 事件类型
- `eventData: object` - 事件数据
- `timestamp: Date` - 事件时间戳
- `version: number` - 事件版本
- `metadata: object` - 事件元数据

## CASL权限系统设计

### 权限定义

基于CASL的权限系统，使用声明式权限定义：

```typescript
// 平台管理员权限
const platformAdminAbility = defineAbility((can, cannot) => {
  // 平台级权限
  can('manage', 'Platform');
  can('read', 'Platform', { id: { $exists: true } });
  can('update', 'Platform', { status: 'active' });
  
  // 租户级权限
  can('manage', 'Tenant');
  can('read', 'Tenant', { platformId: user.platformId });
  can('create', 'Tenant', { platformId: user.platformId });
  
  // 组织级权限
  can('read', 'Organization', { tenantId: { $in: user.tenantIds } });
  can('create', 'Organization', { tenantId: { $in: user.tenantIds } });
  
  // 部门级权限
  can('read', 'Department', { tenantId: { $in: user.tenantIds } });
  can('create', 'Department', { tenantId: { $in: user.tenantIds } });
  
  // 用户级权限
  can('manage', 'User');
  can('read', 'User', { platformId: user.platformId });
  can('update', 'User', { platformId: user.platformId });
});

// 租户管理员权限
const tenantAdminAbility = defineAbility((can, cannot) => {
  // 租户级权限
  can('manage', 'Tenant', { id: user.tenantId });
  can('read', 'Tenant', { id: user.tenantId });
  can('update', 'Tenant', { id: user.tenantId });
  
  // 组织级权限
  can('manage', 'Organization', { tenantId: user.tenantId });
  can('read', 'Organization', { tenantId: user.tenantId });
  can('create', 'Organization', { tenantId: user.tenantId });
  
  // 部门级权限
  can('manage', 'Department', { tenantId: user.tenantId });
  can('read', 'Department', { tenantId: user.tenantId });
  can('create', 'Department', { tenantId: user.tenantId });
  
  // 用户级权限
  can('manage', 'User', { tenantId: user.tenantId });
  can('read', 'User', { tenantId: user.tenantId });
  can('update', 'User', { tenantId: user.tenantId });
});

// 组织管理员权限
const organizationAdminAbility = defineAbility((can, cannot) => {
  // 组织级权限
  can('manage', 'Organization', { id: { $in: user.organizationIds } });
  can('read', 'Organization', { id: { $in: user.organizationIds } });
  can('update', 'Organization', { id: { $in: user.organizationIds } });
  
  // 部门级权限
  can('manage', 'Department', { organizationId: { $in: user.organizationIds } });
  can('read', 'Department', { organizationId: { $in: user.organizationIds } });
  can('create', 'Department', { organizationId: { $in: user.organizationIds } });
  
  // 用户级权限
  can('manage', 'User', { organizationId: { $in: user.organizationIds } });
  can('read', 'User', { organizationId: { $in: user.organizationIds } });
  can('update', 'User', { organizationId: { $in: user.organizationIds } });
});

// 部门管理员权限
const departmentAdminAbility = defineAbility((can, cannot) => {
  // 部门级权限
  can('manage', 'Department', { id: { $in: user.departmentIds } });
  can('read', 'Department', { id: { $in: user.departmentIds } });
  can('update', 'Department', { id: { $in: user.departmentIds } });
  
  // 用户级权限
  can('manage', 'User', { departmentId: { $in: user.departmentIds } });
  can('read', 'User', { departmentId: { $in: user.departmentIds } });
  can('update', 'User', { departmentId: { $in: user.departmentIds } });
});

// 普通用户权限
const regularUserAbility = defineAbility((can, cannot) => {
  // 用户级权限
  can('read', 'User', { id: user.id });
  can('update', 'User', { id: user.id });
  
  // 部门级权限
  can('read', 'Department', { id: { $in: user.departmentIds } });
  
  // 组织级权限
  can('read', 'Organization', { id: { $in: user.organizationIds } });
  
  // 租户级权限
  can('read', 'Tenant', { id: user.tenantId });
});
```

### 权限合并

支持用户兼职时的权限合并：

```typescript
// 权限合并服务
class PermissionMergeService {
  mergeAbilities(userAbilities: Ability[]): Ability {
    return userAbilities.reduce((merged, ability) => {
      return merged.merge(ability);
    }, new Ability());
  }
  
  // 合并多个角色的权限
  mergeRoleAbilities(roles: UserRole[]): Ability {
    const abilities = roles.map(role => this.getRoleAbility(role));
    return this.mergeAbilities(abilities);
  }
  
  // 获取角色对应的权限
  getRoleAbility(role: UserRole): Ability {
    switch (role) {
      case UserRole.PLATFORM_ADMIN:
        return platformAdminAbility;
      case UserRole.TENANT_ADMIN:
        return tenantAdminAbility;
      case UserRole.ORGANIZATION_ADMIN:
        return organizationAdminAbility;
      case UserRole.DEPARTMENT_ADMIN:
        return departmentAdminAbility;
      case UserRole.REGULAR_USER:
        return regularUserAbility;
      default:
        return new Ability();
    }
  }
}
```

### 权限验证

基于CASL的权限验证：

```typescript
// 权限验证服务
class PermissionService {
  constructor(private ability: Ability) {}
  
  // 检查权限
  can(action: string, subject: string, conditions?: object): boolean {
    return this.ability.can(action, subject, conditions);
  }
  
  // 检查权限并抛出异常
  checkPermission(action: string, subject: string, conditions?: object): void {
    if (!this.can(action, subject, conditions)) {
      throw new ForbiddenException('权限不足');
    }
  }
  
  // 获取可访问的字段
  getAccessibleFields(subject: string): string[] {
    const rules = this.ability.rulesFor('read', subject);
    return rules.flatMap(rule => rule.fields || []);
  }
  
  // 过滤数据
  filterData<T>(data: T[], subject: string): T[] {
    return data.filter(item => this.can('read', subject, item));
  }
}
```

### 权限继承

支持多层级权限继承：

```typescript
// 权限继承服务
class PermissionInheritanceService {
  // 计算继承权限
  calculateInheritedPermissions(user: User): Ability {
    const abilities: Ability[] = [];
    
    // 平台级权限
    if (user.roles.includes(UserRole.PLATFORM_ADMIN)) {
      abilities.push(platformAdminAbility);
    }
    
    // 租户级权限
    if (user.roles.includes(UserRole.TENANT_ADMIN)) {
      abilities.push(tenantAdminAbility);
    }
    
    // 组织级权限
    if (user.roles.includes(UserRole.ORGANIZATION_ADMIN)) {
      abilities.push(organizationAdminAbility);
    }
    
    // 部门级权限
    if (user.roles.includes(UserRole.DEPARTMENT_ADMIN)) {
      abilities.push(departmentAdminAbility);
    }
    
    // 普通用户权限
    abilities.push(regularUserAbility);
    
    // 合并权限
    return abilities.reduce((merged, ability) => {
      return merged.merge(ability);
    }, new Ability());
  }
}
```

## 验证规则

### 实体验证

- 所有实体必须通过业务规则验证
- 所有实体必须通过数据完整性验证
- 所有实体必须通过CASL权限验证
- 所有实体必须通过状态转换验证

### 关系验证

- 层级关系必须符合业务规则
- 用户关系必须符合CASL权限规则
- 多对多关系必须符合约束条件
- 数据隔离必须符合安全规则

### 事件验证

- 所有事件必须通过业务规则验证
- 所有事件必须通过数据完整性验证
- 所有事件必须通过CASL权限验证
- 所有事件必须通过状态转换验证

### CASL权限验证

- 所有权限定义必须符合CASL规范
- 所有权限条件必须可序列化
- 所有权限继承必须正确计算
- 所有权限合并必须无冲突
