## 值对象开发规范（Value Object Development Guide）

适用范围：`libs/business-core` 全部值对象开发；与标识符相关的值对象需与 `libs/isolation-model` 保持一致并优先复用。

### 设计目标

- 一致性：统一放置、统一命名、统一导出、统一验证方式。
- 强约束：创建即校验、不可变、可比较、可序列化。
- 业务表达力：用类型承载业务规则，避免散落在服务或控制器中的“字符串约定”。

### 目录与归口

- 放置路径：`libs/business-core/src/domain/value-objects/`
  - 基类与通用工具：`base-value-object.ts`（已存在）
  - 类型类（业务分类/类型枚举/标签等）：`types/*`
  - 身份标识/层级隔离 ID：全部来源于 `@hl8/isolation-model`，不要在本库重复实现。

导出规则：
- 分组导出：在对应 `index.ts` 中统一导出，例如 `types/index.ts` 中 `export * from "./tenant-type.vo.js";`。
- 顶层导出：`value-objects/index.ts` 只做编目与分组转发，不直接实现类型。

### 基类与继承

- 一律继承 `BaseValueObject<T>`：
  - 必须实现：`protected validate(value: T): void`
  - 可选实现：`protected transform(value: T): T`（归一化，例如 trim/upper/lower）
  - 使用工厂：优先通过 `Class.create(value)` 创建实例（由基类提供）

示例（已实现）：

```ts
// libs/business-core/src/domain/value-objects/types/tenant-type.vo.ts
import { BaseValueObject } from '../base-value-object.js';

export class TenantType extends BaseValueObject<string> {
  protected validate(value: string): void {
    this.validateNotEmpty(value, '租户类型');
    const valid = ['ENTERPRISE', 'COMMUNITY', 'TEAM', 'PERSONAL'];
    if (!valid.includes(value.toUpperCase())) {
      throw new Error(`无效的租户类型: ${value}`);
    }
  }

  protected transform(value: string): string {
    return value.toUpperCase();
  }
}
```

### 与 isolation-model 的协同

- ID/隔离相关值对象全部使用 `@hl8/isolation-model`：`EntityId`, `TenantId`, `OrganizationId`, `DepartmentId`, `UserId` 等。
- 若值对象需要持有 ID 字段，请以 `@hl8/isolation-model` 的类型为准，禁止定义平行的本地副本。

### 命名规范

- 文件名：`kebab-case`，后缀 `.vo.ts`，如 `tenant-type.vo.ts`。
- 类名：`PascalCase`，以业务名 + `Type`/`Code`/`Status`/`Policy` 等后缀。
- 枚举型值对象优先用类封装 + 受控常量（避免裸 `enum` 的可序列化问题）。

### 不可变性与相等性

- 值对象创建后不可修改内部值；所有“变更”应返回新实例。
- 相等性：使用 `value` 比较；不要比较引用地址。

### 验证与转换

- 在构造函数中自动校验（通过 `validate`）。
- 常用校验助手（来自基类）：
  - `validateNotEmpty`, `validateLength`, `validatePattern`, `validateIn`, `validateRange`, `validateJSON` 等。
- `transform` 用于归一化：大小写、去空格、排序、去重等。

### 序列化与日志

- 默认通过 `value` 序列化；复合值对象提供 `toJSON()` 明确输出结构。
- 日志与异常消息必须避免泄露敏感信息（如凭据、令牌、密钥）。

### TSDoc 注释规范（强制）

- 所有公开类与方法必须有完整中文 TSDoc：
  - `@description` 描述业务语义
  - 业务规则：前置条件、边界、异常
  - `@example` 至少一个可运行示例
  - 必要时补充 `@throws`、使用场景与限制

示例片段：

```ts
/**
 * @description 租户类型值对象，决定功能与配额边界
 * @example
 * const t = TenantType.create('enterprise');
 * assert(t.value === 'ENTERPRISE');
 */
```

### 放置与导出清单

- 新增值对象：
  1) 放置到合适子目录（多数“类型类”放在 `types/`）
  2) 在该子目录的 `index.ts` 导出
  3) 在 `value-objects/index.ts` 汇总导出（如需）

### 测试要求（建议 ≥80% 覆盖率）

- 单元测试覆盖：
  - 创建成功/失败（边界、非法参数）
  - `equals`/`toString`/`toJSON`
  - `transform` 行为
  - 性能与大输入样本（必要时）

测试放置：紧邻实现文件或统一在 `src/__tests__/domain/value-objects/...`，遵循项目现有测试布局。

### 反模式清单（禁止）

- 在服务/控制器中用裸字符串表达业务类型；应下沉为值对象。
- 在本库重复实现 `EntityId` 或各类 `*Id` 值对象。
- 可变值对象（创建后可写）。
- 无校验的“宽松”值对象；或把校验放到值对象之外。

### 常见类型建议

- 类型类（如 `TenantType`、`RoleType`、`AuthType`）：使用受控集合 + 归一化（`upper/lower`）。
- 代码/编号类（如 `TenantCode`）：校验长度、字符集、唯一性（唯一性通常在仓储/服务层落实）。
- 状态类（如 `UserStatus`）：受控集合 + 可迁移状态关系（可选提供 `canTransitionTo()`）。

### 最佳实践示例清单

- `types/tenant-type.vo.ts`（已实现）：基于 `BaseValueObject<string>` 的受控集合。
- `security/permission-action.vo.ts`（建议）：CASL 动作封装，统一动作命名、归一化与校验。
- `identities/*`：全部引用 `@hl8/isolation-model`，不在本库实现。

---

变更影响：新增或修改值对象时，请同步更新对应子目录 `index.ts` 的导出，并在需要时补充到 `value-objects/index.ts` 的分组导出。


