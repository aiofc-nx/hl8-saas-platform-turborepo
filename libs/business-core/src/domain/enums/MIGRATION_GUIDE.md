# 枚举集中管理迁移指南

## 概述

本文档说明如何将散落在各个文件中的枚举迁移到统一的枚举管理结构中。

## 迁移前后对比

### 迁移前（散落分布）

```typescript
// 用户角色 - 在 value-objects/types/user-role.vo.ts
import { UserRoleValue } from "../value-objects/types/user-role.vo.js";

// 用户状态 - 在 value-objects/types/user-status.vo.ts
import { UserStatusValue } from "../value-objects/types/user-status.vo.js";

// 权限动作 - 在 value-objects/types/permission-action.vo.ts
import { PermissionActionValue } from "../value-objects/types/permission-action.vo.js";

// 业务规则类型 - 在 rules/base-business-rule.interface.ts
import { BusinessRuleType } from "../rules/base-business-rule.interface.js";

// 错误代码 - 在 constants/error-codes.ts
import { ErrorCodes } from "../constants/error-codes.js";
```

### 迁移后（集中管理）

```typescript
// 统一从枚举模块导入
import {
  UserRole,
  UserRoleUtils,
  UserStatus,
  UserStatusUtils,
  PermissionAction,
  PermissionActionUtils,
  BusinessRuleType,
  BusinessRuleTypeUtils,
  ErrorCodes,
  ErrorCodesUtils,
} from "../enums/index.js";
```

## 具体迁移步骤

### 1. 用户相关枚举迁移

**迁移前：**

```typescript
// 在 value-objects/types/user-role.vo.ts
export enum UserRoleValue {
  SUPER_ADMIN = "SUPER_ADMIN",
  // ...
}

// 在 value-objects/types/user-status.vo.ts
export enum UserStatusValue {
  ACTIVE = "ACTIVE",
  // ...
}
```

**迁移后：**

```typescript
// 在 enums/user/user-role.enum.ts
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  // ...
}

// 在 enums/user/user-status.enum.ts
export enum UserStatus {
  ACTIVE = "ACTIVE",
  // ...
}
```

### 2. 权限相关枚举迁移

**迁移前：**

```typescript
// 在 value-objects/types/permission-action.vo.ts
export enum PermissionActionValue {
  CREATE = "CREATE",
  // ...
}

// 在 security/base-permission.interface.ts
export enum PermissionScope {
  SYSTEM = "system",
  // ...
}
```

**迁移后：**

```typescript
// 在 enums/permission/permission-action.enum.ts
export enum PermissionAction {
  CREATE = "CREATE",
  // ...
}

// 在 enums/permission/permission-scope.enum.ts
export enum PermissionScope {
  SYSTEM = "system",
  // ...
}
```

### 3. 业务规则相关枚举迁移

**迁移前：**

```typescript
// 在 rules/base-business-rule.interface.ts
export enum BusinessRuleType {
  FORMAT_VALIDATION = "format_validation",
  // ...
}
```

**迁移后：**

```typescript
// 在 enums/business/business-rule-type.enum.ts
export enum BusinessRuleType {
  FORMAT_VALIDATION = "format_validation",
  // ...
}
```

### 4. 异常相关枚举迁移

**迁移前：**

```typescript
// 在 exceptions/base/base-domain-exception.ts
export enum DomainExceptionType {
  BUSINESS_RULE = "business_rule",
  // ...
}

// 在 constants/error-codes.ts
export enum ErrorCodes {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  // ...
}
```

**迁移后：**

```typescript
// 在 enums/exception/domain-exception-type.enum.ts
export enum DomainExceptionType {
  BUSINESS_RULE = "business_rule",
  // ...
}

// 在 enums/exception/error-codes.enum.ts
export enum ErrorCodes {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  // ...
}
```

## 更新导入路径

### 1. 更新值对象文件

**用户角色值对象：**

```typescript
// 更新前
import { UserRoleValue } from "../base-value-object.js";

// 更新后
import { UserRole } from "../../enums/index.js";
```

**用户状态值对象：**

```typescript
// 更新前
import { UserStatusValue } from "../base-value-object.js";

// 更新后
import { UserStatus } from "../../enums/index.js";
```

### 2. 更新业务规则文件

```typescript
// 更新前
import {
  BusinessRuleType,
  BusinessRuleScope,
} from "./base-business-rule.interface.js";

// 更新后
import { BusinessRuleType, BusinessRuleScope } from "../enums/index.js";
```

### 3. 更新异常文件

```typescript
// 更新前
import {
  DomainExceptionType,
  DomainExceptionSeverity,
} from "./base-domain-exception.js";
import { ErrorCodes } from "../constants/error-codes.js";

// 更新后
import {
  DomainExceptionType,
  DomainExceptionSeverity,
  ErrorCodes,
} from "../enums/index.js";
```

## 工具类使用

### 1. 用户角色工具类

```typescript
import { UserRole, UserRoleUtils } from "../enums/index.js";

// 检查角色
const isAdmin = UserRoleUtils.isAdmin(UserRole.TENANT_ADMIN);

// 角色比较
const hasHigherRole = UserRoleUtils.hasHigherRole(
  UserRole.SUPER_ADMIN,
  UserRole.USER,
);

// 获取角色描述
const description = UserRoleUtils.getDescription(UserRole.TENANT_ADMIN);
```

### 2. 权限动作工具类

```typescript
import { PermissionAction, PermissionActionUtils } from "../enums/index.js";

// 检查动作
const isCreate = PermissionActionUtils.isCreateAction(PermissionAction.CREATE);

// 动作比较
const hasHigherPermission = PermissionActionUtils.hasHigherPermission(
  PermissionAction.MANAGE,
  PermissionAction.READ,
);

// 获取动作描述
const description = PermissionActionUtils.getDescription(
  PermissionAction.CREATE,
);
```

### 3. 错误代码工具类

```typescript
import { ErrorCodes, ErrorCodesUtils } from "../enums/index.js";

// 检查错误代码
const isValidationFailed = ErrorCodesUtils.isValidationFailed(
  ErrorCodes.VALIDATION_FAILED,
);

// 获取错误描述
const description = ErrorCodesUtils.getDescription(
  ErrorCodes.VALIDATION_FAILED,
);

// 获取所有验证错误代码
const validationCodes = ErrorCodesUtils.getValidationCodes();
```

## 迁移检查清单

- [ ] 更新所有值对象文件中的枚举导入
- [ ] 更新所有业务规则文件中的枚举导入
- [ ] 更新所有异常文件中的枚举导入
- [ ] 更新所有安全相关文件中的枚举导入
- [ ] 更新所有审计相关文件中的枚举导入
- [ ] 更新所有测试文件中的枚举导入
- [ ] 验证所有枚举工具类的使用
- [ ] 运行测试确保功能正常
- [ ] 更新文档和注释

## 注意事项

1. **向后兼容性**：在迁移过程中，保持原有的枚举值不变
2. **工具类增强**：新的工具类提供了更多便利方法
3. **类型安全**：所有枚举都保持强类型
4. **文档完整**：每个枚举都有完整的TSDoc注释
5. **分类清晰**：按业务领域分类，便于维护

## 迁移完成后的优势

1. **集中管理**：所有枚举都在一个地方管理
2. **分类清晰**：按业务领域分类，便于查找
3. **工具丰富**：每个枚举都有对应的工具类
4. **文档完整**：完整的TSDoc注释和示例
5. **类型安全**：强类型枚举，避免错误
6. **易于维护**：统一的目录结构，便于维护和扩展
