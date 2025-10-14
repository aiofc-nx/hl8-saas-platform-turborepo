# 业务特定组件分析报告

**分析日期**: 2025-01-27  
**分析范围**: `libs/hybrid-archi` 模块  
**分析目标**: 识别需要移除的业务特定组件  

## 发现的业务特定组件

### 1. 租户相关组件

#### TenantType (租户类型)
- **文件**: `libs/hybrid-archi/src/domain/value-objects/types/tenant-type.vo.ts`
- **类型**: 枚举 + 工具类
- **业务特定性**: ✅ 高度特定 - 定义了具体的租户套餐类型
- **建议**: 移除，迁移到 `@hl8/saas-core`

**具体内容**:
```typescript
export enum TenantType {
  FREE = 'FREE',           // 免费版
  BASIC = 'BASIC',         // 基础版
  PROFESSIONAL = 'PROFESSIONAL', // 专业版
  ENTERPRISE = 'ENTERPRISE', // 企业版
  CUSTOM = 'CUSTOM',       // 定制版
  PERSONAL = 'PERSONAL',   // 个人版
  TEAM = 'TEAM',          // 团队版
  COMMUNITY = 'COMMUNITY'  // 社群版
}

export class TenantTypeUtils {
  // 升级矩阵、功能权限、资源限制等业务逻辑
}
```

### 2. 用户角色相关组件

#### UserRole (用户角色)
- **文件**: `libs/hybrid-archi/src/domain/value-objects/types/user-role.vo.ts`
- **类型**: 枚举 + 工具类
- **业务特定性**: ✅ 高度特定 - 定义了具体的角色层级和权限
- **建议**: 移除，迁移到 `@hl8/saas-core`

**具体内容**:
```typescript
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',     // 平台管理员
  TENANT_ADMIN = 'TENANT_ADMIN',         // 租户管理员
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN', // 组织管理员
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN', // 部门管理员
  REGULAR_USER = 'REGULAR_USER',         // 普通用户
  GUEST_USER = 'GUEST_USER'              // 访客用户
}

export class UserRoleUtils {
  // 角色层级、权限检查、角色管理等业务逻辑
}
```

### 3. 权限定义组件

#### PermissionDefinitions (权限定义)
- **文件**: `libs/hybrid-archi/src/domain/value-objects/types/permission-definitions.vo.ts`
- **类型**: 枚举 + 工具类
- **业务特定性**: ✅ 高度特定 - 定义了具体的权限矩阵和业务规则
- **建议**: 移除，迁移到 `@hl8/saas-core`

**具体内容**:
```typescript
export enum PermissionDefinitions {
  // 平台级权限
  MANAGE_PLATFORM_CONFIG = 'manage_platform_config',
  MANAGE_ALL_TENANTS = 'manage_all_tenants',
  // ... 70+ 个具体的业务权限定义
  
  // 租户级权限
  MANAGE_TENANT = 'manage_tenant',
  VIEW_TENANT_INFO = 'view_tenant_info',
  // ... 更多租户相关权限
  
  // 组织级权限、部门级权限、用户级权限等
}

export class PermissionDefinitionsUtils {
  // 权限分类、权限验证、权限继承等业务逻辑
}
```

### 4. 用户状态组件

#### UserStatus (用户状态)
- **文件**: `libs/hybrid-archi/src/domain/value-objects/statuses/user-status.vo.ts`
- **类型**: 枚举 + 工具类
- **业务特定性**: ⚠️ 中等特定 - 定义了用户的生命周期状态
- **建议**: 评估是否需要移除

**具体内容**:
```typescript
export enum UserStatus {
  PENDING = 'PENDING',     // 待激活
  ACTIVE = 'ACTIVE',       // 活跃
  SUSPENDED = 'SUSPENDED', // 暂停
  DISABLED = 'DISABLED',   // 禁用
  LOCKED = 'LOCKED',       // 锁定
  EXPIRED = 'EXPIRED',     // 过期
  DELETED = 'DELETED',     // 已删除
  REJECTED = 'REJECTED'    // 已拒绝
}

export class UserStatusUtils {
  // 状态转换矩阵、业务规则验证等
}
```

### 5. 重复的通用枚举

#### UserStatus (通用枚举版本)
- **文件**: `libs/hybrid-archi/src/domain/enums/common/user-status.enum.ts`
- **类型**: 枚举 + 工具类
- **业务特定性**: ✅ 与上述 UserStatus 重复
- **建议**: 移除重复，保留一个通用版本

## 业务特定性分析

### 高度业务特定 (必须移除)

1. **TenantType** - 定义了具体的租户套餐类型，包含业务逻辑
2. **UserRole** - 定义了具体的角色层级和权限分配
3. **PermissionDefinitions** - 定义了具体的权限矩阵和业务规则

### 中等业务特定 (需要评估)

1. **UserStatus** - 用户状态枚举，可能具有通用性，但包含业务规则

### 通用组件 (应保留)

1. **BaseEntity** - 基础实体类
2. **BaseAggregateRoot** - 基础聚合根
3. **BaseValueObject** - 基础值对象
4. **CQRS 组件** - 命令查询分离组件
5. **Event Sourcing 组件** - 事件溯源组件
6. **通用值对象** - Email、Username、PhoneNumber 等

## 移除计划

### 第一阶段：移除高度业务特定组件

1. **移除 TenantType**
   - 文件: `libs/hybrid-archi/src/domain/value-objects/types/tenant-type.vo.ts`
   - 迁移到: `@hl8/saas-core/src/domain/value-objects/tenant-type.vo.ts`

2. **移除 UserRole**
   - 文件: `libs/hybrid-archi/src/domain/value-objects/types/user-role.vo.ts`
   - 迁移到: `@hl8/saas-core/src/domain/value-objects/user-role.vo.ts`

3. **移除 PermissionDefinitions**
   - 文件: `libs/hybrid-archi/src/domain/value-objects/types/permission-definitions.vo.ts`
   - 迁移到: `@hl8/saas-core/src/domain/value-objects/permission-definitions.vo.ts`

### 第二阶段：处理重复组件

1. **合并 UserStatus**
   - 保留通用版本: `libs/hybrid-archi/src/domain/enums/common/user-status.enum.ts`
   - 移除特定版本: `libs/hybrid-archi/src/domain/value-objects/statuses/user-status.vo.ts`

### 第三阶段：更新导出

1. **更新 index.ts**
   - 移除业务特定组件的导出
   - 保留通用架构组件的导出

2. **更新相关引用**
   - 检查并更新所有引用这些组件的文件
   - 确保没有遗留的业务特定组件引用

## 验证标准

### 移除后验证

1. **构建验证**: hybrid-archi 能够成功构建
2. **导出验证**: 只导出通用架构组件
3. **依赖验证**: 没有业务特定的依赖
4. **功能验证**: 通用架构功能正常工作

### 迁移验证

1. **迁移完整性**: 所有业务组件成功迁移到 saas-core
2. **功能一致性**: 迁移后功能保持一致
3. **测试通过**: 相关测试用例全部通过

## 风险评估

### 低风险

- **TenantType**: 相对独立，迁移风险低
- **UserRole**: 相对独立，迁移风险低

### 中风险

- **PermissionDefinitions**: 可能被多个地方引用，需要仔细检查
- **UserStatus**: 存在重复，需要合并处理

### 缓解措施

1. **完整备份**: 迁移前创建完整备份
2. **逐步迁移**: 分步进行，每步验证
3. **测试覆盖**: 确保测试用例覆盖所有变更
4. **文档更新**: 及时更新相关文档

## 总结

发现了 **4 个主要的业务特定组件** 需要从 hybrid-archi 中移除：

1. ✅ **TenantType** - 高度业务特定，必须移除
2. ✅ **UserRole** - 高度业务特定，必须移除  
3. ✅ **PermissionDefinitions** - 高度业务特定，必须移除
4. ⚠️ **UserStatus** - 中等业务特定，需要评估

移除这些组件将使 hybrid-archi 成为纯粹的架构基础库，符合其设计目标。
