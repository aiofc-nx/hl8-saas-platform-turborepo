# 值对象库文档

**版本**: 1.1.0  
**最后更新**: 2025-10-10  
**状态**: ✅ 已优化

---

## 📖 概述

hybrid-archi 的值对象库提供了完整的值对象基础设施，包括：

1. **基础值对象基类** - BaseValueObject (泛型)
2. **通用值对象库** - 可复用的抽象基类
3. **身份值对象** - Email, Username, PhoneNumber, Password
4. **状态值对象** - UserStatus 等
5. **安全相关值对象** - PasswordPolicy, MFA 等

---

## 🎯 新特性 (v1.1.0)

### 1. 泛型 API (OPT-002)

**BaseValueObject 现在支持泛型**：

```typescript
export abstract class BaseValueObject<T = any> {
  constructor(protected readonly _value: T) {
    this.validate(this._value);
  }

  public get value(): T {
    return this._value;
  }

  public static create<V extends BaseValueObject<any>>(value: any): V {
    return new (this as any)(value);
  }

  protected abstract validate(value: T): void;
  protected transform(value: T): T {
    return value;
  }
}
```

**优势**：

- ✅ 自动提供 `value` 属性
- ✅ 自动提供 `create` 方法
- ✅ 类型安全
- ✅ 减少 50-60% 样板代码

### 2. 通用值对象库 (OPT-003)

**新增 5 个可复用的抽象基类**：

```typescript
// 通用代码值对象
export abstract class Code extends BaseValueObject<string> {
  // 自动验证：小写字母、数字、连字符
  // 自动转换：toLowerCase()
}

// 通用域名值对象
export abstract class Domain extends BaseValueObject<string> {
  // 自动验证：标准域名格式
  // 自动转换：toLowerCase()
}

// 通用级别值对象
export abstract class Level extends BaseValueObject<number> {
  constructor(value: number, minLevel = 1, maxLevel = 10) {
    super(value);
  }
  // 提供层级导航方法
}

// 通用名称值对象
export abstract class Name extends BaseValueObject<string> {
  constructor(value: string, minLength = 2, maxLength = 100) {
    super(value);
  }
  // 自动验证：长度、非空
}

// 通用描述值对象
export abstract class Description extends BaseValueObject<string> {
  constructor(value: string, minLength = 0, maxLength = 500) {
    super(value);
  }
  // 允许为空
}
```

**使用示例**：

```typescript
// 继承通用基类，只添加业务特定规则
export class TenantCode extends Code {
  protected override validate(value: string): void {
    super.validate(value); // 通用验证
    this.validateLength(value, 3, 20, "租户代码");

    // 业务特定验证
    const reserved = ["admin", "api", "www"];
    if (reserved.includes(value)) {
      throw new Error("不能使用保留词");
    }
  }
}

// 使用
const code = TenantCode.create("my-tenant");
console.log(code.value); // 'my-tenant'
```

---

## 📂 目录结构

```
packages/hybrid-archi/src/domain/value-objects/
├── base-value-object.ts          # 基础值对象（泛型）
├── entity-id.ts                   # 实体ID
├── common/                        # 通用值对象库 (NEW v1.1.0)
│   ├── code.vo.ts                # Code 抽象基类
│   ├── domain.vo.ts              # Domain 抽象基类
│   ├── level.vo.ts               # Level 抽象基类
│   ├── name.vo.ts                # Name 抽象基类
│   ├── description.vo.ts         # Description 抽象基类
│   └── index.ts
├── identities/                    # 身份相关值对象
│   ├── email.vo.ts               # 邮箱（使用新API）
│   ├── username.vo.ts            # 用户名（使用新API）
│   ├── phone-number.vo.ts        # 电话号码（使用新API）
│   └── password.vo.ts            # 密码（使用新API）
├── statuses/                      # 状态相关值对象
│   ├── user-status.vo.ts         # 用户状态（通用）
│   └── index.ts
├── security/                      # 安全相关值对象
│   ├── mfa-type.vo.ts            # MFA 类型
│   ├── mfa-status.vo.ts          # MFA 状态
│   ├── password-policy.vo.ts     # 密码策略（使用新API）
│   └── index.ts
├── audit/                         # 审计相关值对象
│   ├── audit-event-type.vo.ts    # 审计事件类型
│   └── index.ts
├── types/                         # 类型相关值对象
│   ├── permission-definitions.vo.ts
│   └── index.ts
└── index.ts                       # 统一导出
```

---

## 🚀 使用指南

### 1. 使用新的泛型 API

**基础用法**：

```typescript
import { BaseValueObject } from "@hl8/business-core";

// 简单值对象
export class ProductCode extends BaseValueObject<string> {
  protected override validate(value: string): void {
    this.validateNotEmpty(value, "产品代码");
    this.validateLength(value, 5, 20, "产品代码");
    this.validatePattern(value, /^PROD-[0-9]+$/, "格式：PROD-数字");
  }
}

// 复杂值对象
export class Address extends BaseValueObject<AddressProps> {
  protected override validate(props: AddressProps): void {
    this.validateNotEmpty(props.street, "街道");
    this.validateNotEmpty(props.city, "城市");
  }
}

// 使用
const code = ProductCode.create("PROD-12345");
console.log(code.value); // 'PROD-12345'

const address = Address.create({
  street: "123 Main St",
  city: "Beijing",
});
console.log(address.value.city); // 'Beijing'
```

### 2. 继承通用值对象基类

**推荐方式**：

```typescript
import { Code, Domain, Level, Name, Description } from "@hl8/business-core";

// 1. 直接使用（无额外验证）
export class ProductCode extends Code {
  // 自动验证小写字母、数字、连字符
}

// 2. 添加业务规则
export class TenantCode extends Code {
  protected override validate(value: string): void {
    super.validate(value); // 通用验证
    this.validateLength(value, 3, 20, "租户代码");
  }
}

// 3. 配置参数
export class DepartmentLevel extends Level {
  constructor(value: number) {
    super(value, 1, 6); // 范围 1-6
  }
}

// 4. 组合使用
export class ProductName extends Name {
  constructor(value: string) {
    super(value, 3, 100); // 长度 3-100
  }

  protected override validate(value: string): void {
    super.validate(value);
    // 添加特定规则
  }
}
```

### 3. 使用内置值对象

```typescript
import { Email, Username, PhoneNumber, Password } from "@hl8/business-core";

// 邮箱验证
const email = Email.create("user@example.com");
console.log(email.getDomain()); // 'example.com'

// 用户名验证
const username = Username.create("john-doe");
console.log(username.value); // 'john-doe'

// 电话号码
const phone = PhoneNumber.create("+86-13800138000");
console.log(phone.getCountryCode()); // '+86'

// 密码强度验证
const password = Password.create("SecurePass123!");
```

---

## 🔧 验证辅助方法

BaseValueObject 提供了丰富的验证辅助方法：

```typescript
protected override validate(value: any): void {
  // 字符串验证
  this.validateNotEmpty(value, '字段名');
  this.validateLength(value, min, max, '字段名');
  this.validatePattern(value, regex, '错误消息');

  // 数值验证
  this.validateRange(value, min, max, '字段名');
  this.validateInteger(value, '字段名');
  this.validatePositive(value, '字段名');

  // 枚举验证
  this.validateEnum(value, allowedValues, '字段名');
}
```

---

## 📊 值对象分类

### 通用值对象（可复用）

| 类别         | 值对象                                 | 用途                               |
| ------------ | -------------------------------------- | ---------------------------------- |
| **抽象基类** | Code, Domain, Level, Name, Description | 业务值对象继承                     |
| **身份**     | Email, Username, PhoneNumber, Password | 用户身份验证                       |
| **状态**     | UserStatus                             | 通用用户状态 (domain/enums/common) |
| **安全**     | PasswordPolicy, MfaType, MfaStatus     | 安全策略                           |
| **审计**     | AuditEventType                         | 审计日志                           |

### 业务值对象（已移除）

**已从 hybrid-archi 中移除** (重构 v1.1.0):

- ❌ ~~TenantStatus~~ → 已移至 saas-core
- ❌ ~~OrganizationStatus~~ → 已移至 saas-core
- ❌ ~~TenantType~~ → 已移至 saas-core
- ❌ ~~UserRole~~ → 已移至 saas-core
- ❌ ~~PermissionDefinitions~~ → 已移至 saas-core
- ❌ ~~UserStatus~~ → 已移至通用枚举 (domain/enums/common/user-status.enum.ts)

**原因**: hybrid-archi 是架构基础库，不应包含业务特定概念

---

## 🎯 最佳实践

### 1. 选择合适的基类

```typescript
// 场景1: 代码类字段 → 继承 Code
export class OrderCode extends Code {
  // 自动获得代码验证逻辑
}

// 场景2: 域名类字段 → 继承 Domain
export class ApiDomain extends Domain {
  // 自动获得域名验证逻辑
}

// 场景3: 层级类字段 → 继承 Level
export class MemberLevel extends Level {
  constructor(value: number) {
    super(value, 1, 5); // VIP1-VIP5
  }
}

// 场景4: 名称类字段 → 继承 Name
export class CategoryName extends Name {
  // 自动获得名称验证逻辑
}

// 场景5: 复杂对象 → 继承 BaseValueObject
export class Address extends BaseValueObject<AddressProps> {
  // 自定义复杂验证
}
```

### 2. 充分利用验证辅助方法

```typescript
export class Email extends BaseValueObject<string> {
  protected override validate(value: string): void {
    // 使用辅助方法，避免重复代码
    this.validateNotEmpty(value, "邮箱");
    this.validateLength(value, 5, 254, "邮箱");
    this.validatePattern(value, EMAIL_REGEX, "邮箱格式不正确");

    // 业务特定规则
    const [local, domain] = value.split("@");
    if (local.length > 64) {
      throw new Error("邮箱本地部分不能超过64字符");
    }
  }
}
```

### 3. 适当使用 transform

```typescript
export class Email extends BaseValueObject<string> {
  // transform 在 validate 之前执行
  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }

  protected override validate(value: string): void {
    // 验证已转换后的值
    this.validatePattern(value, EMAIL_REGEX, "邮箱格式不正确");
  }
}
```

---

## 🔄 迁移指南 (v1.0 → v1.1)

### 从旧 API 迁移

**Before (v1.0)**:

```typescript
export class TenantCode extends BaseValueObject {
  private readonly _value: string;

  get value(): string {
    return this._value;
  }

  static create(code: string): TenantCode {
    // 手动验证
    if (!code) throw new Error("不能为空");
    return new TenantCode(code);
  }

  private constructor(value: string) {
    super();
    this._value = value;
  }
}
```

**After (v1.1)**:

```typescript
export class TenantCode extends BaseValueObject<string> {
  // value 和 create 自动继承

  protected override validate(value: string): void {
    this.validateNotEmpty(value, "租户代码");
    this.validateLength(value, 3, 20, "租户代码");
    this.validatePattern(value, /^[a-z0-9-]+$/, "格式不正确");
  }
}
```

**减少**: ~30 行样板代码 (67%)

### 迁移到通用基类

**推荐迁移**：

```typescript
// 如果你的值对象符合通用模式，考虑迁移

// Before: 独立实现
export class ProductCode extends BaseValueObject<string> {
  protected override validate(value: string): void {
    this.validateNotEmpty(value, "产品代码");
    this.validatePattern(value, /^[a-z0-9-]+$/, "...");
  }

  protected override transform(value: string): string {
    return value.toLowerCase().trim();
  }
}

// After: 继承通用基类
export class ProductCode extends Code {
  // 通用验证和转换自动继承
  // 仅需添加业务特定规则（如有）
}
```

---

## 📋 组件清单

### 核心组件

| 组件                | 类型     | 状态    | 说明           |
| ------------------- | -------- | ------- | -------------- |
| **BaseValueObject** | 泛型基类 | ✅ v1.1 | 支持泛型 `<T>` |
| **EntityId**        | 实体ID   | ✅      | 全局唯一标识符 |

### 通用抽象基类 (NEW v1.1)

| 组件            | 用途     | 示例                       |
| --------------- | -------- | -------------------------- |
| **Code**        | 代码字段 | TenantCode, ProductCode    |
| **Domain**      | 域名字段 | TenantDomain, ApiDomain    |
| **Level**       | 层级字段 | UserLevel, DepartmentLevel |
| **Name**        | 名称字段 | RoleName, CategoryName     |
| **Description** | 描述字段 | RoleDescription            |

### 身份值对象

| 组件            | 说明         | API版本     |
| --------------- | ------------ | ----------- |
| **Email**       | 邮箱验证     | v1.1 (泛型) |
| **Username**    | 用户名验证   | v1.1 (泛型) |
| **PhoneNumber** | 电话号码验证 | v1.1 (泛型) |
| **Password**    | 密码验证     | v1.1 (泛型) |

### 状态值对象

| 组件                   | 说明     | 备注                       |
| ---------------------- | -------- | -------------------------- |
| **UserStatus**         | 用户状态 | 通用，保留                 |
| ~~TenantStatus~~       | 租户状态 | 已移至 saas-core (OPT-004) |
| ~~OrganizationStatus~~ | 组织状态 | 已移至 saas-core (OPT-004) |

### 安全值对象

| 组件               | 说明     | API版本     |
| ------------------ | -------- | ----------- |
| **PasswordPolicy** | 密码策略 | v1.1 (泛型) |
| **MfaType**        | MFA 类型 | v1.0        |
| **MfaStatus**      | MFA 状态 | v1.0        |

---

## 📚 导入方式

### 导入基础组件

```typescript
// 基础值对象
import { BaseValueObject, EntityId } from "@hl8/business-core";

// 通用抽象基类
import { Code, Domain, Level, Name, Description } from "@hl8/business-core";

// 身份值对象
import { Email, Username, PhoneNumber, Password } from "@hl8/business-core";

// 状态值对象
import { UserStatus, UserStatusUtils } from "@hl8/business-core";

// 安全值对象
import { PasswordPolicy, MfaType, MfaStatus } from "@hl8/business-core";
```

### 不再支持的导入 (v1.1)

```typescript
// ❌ 不再支持（已移除）
import { TenantStatus } from "@hl8/business-core"; // 请从 @hl8/saas-core 导入
import { OrganizationStatus } from "@hl8/business-core"; // 请从 @hl8/saas-core 导入

// ✅ 新的导入方式
import { TenantStatus } from "@hl8/saas-core";
import { OrganizationStatus } from "@hl8/saas-core";
```

---

## 🎯 开发建议

### 1. 优先使用通用基类

如果你的值对象符合以下模式，优先继承通用基类：

- 代码类字段 → `Code`
- 域名类字段 → `Domain`
- 层级类字段 → `Level`
- 名称类字段 → `Name`
- 描述类字段 → `Description`

### 2. 充分利用验证方法

不要重复实现验证逻辑，使用内置的验证辅助方法。

### 3. 保持值对象简洁

值对象应该只包含验证和转换逻辑，不要包含业务逻辑。

---

## 📝 版本历史

### v1.1.0 (2025-10-10)

**重大更新**：

- ✅ BaseValueObject 支持泛型 `<T>`
- ✅ 新增通用值对象库（5个抽象基类）
- ✅ 所有内置值对象迁移到新API
- ✅ 移除业务特定组件（TenantStatus, OrganizationStatus）

**破坏性变更**：

- ⚠️ BaseValueObject 现在需要泛型参数
- ⚠️ TenantStatus 和 OrganizationStatus 已移除

**迁移指南**: 参见上方"迁移指南"部分

### v1.0.0 (2025-10-01)

**初始版本**：

- ✅ BaseValueObject 基础实现
- ✅ 身份值对象（Email, Username, PhoneNumber, Password）
- ✅ 状态值对象（UserStatus, TenantStatus, OrganizationStatus）
- ✅ 安全值对象（PasswordPolicy, MFA）

---

## 🔗 相关文档

- **架构概述**: `docs/hybrid-archi/README.md`
- **领域层指南**: `docs/hybrid-archi/01-domain-layer.md`
- **优化记录**: `specs/002-hybrid-archi-optimization/`

---

**最后更新**: 2025-10-10  
**版本**: 1.1.0  
**状态**: ✅ 已优化
