# ESLint 配置使用指南

本文档说明 HL8 SAAS Platform 的 ESLint 配置及其使用方法。

## 概述

项目使用 ESLint 9+ 的 Flat Config 格式，配置文件位于根目录的 `eslint.config.mjs`。

该配置严格遵循项目宪章（Constitution v1.4.0）的所有质量保证原则，特别是：

- **TypeScript `any` 类型使用原则**：严格限制 `any` 类型的使用
- **代码即文档原则**：强制 TSDoc 注释规范
- **质量保证原则**：统一的代码规范和检查

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行 ESLint

```bash
# 检查所有项目
pnpm lint

# 检查特定项目
pnpm lint:api
pnpm lint:web

# 自动修复（如果可能）
pnpm lint --fix
```

## 核心规则

### 1. TypeScript `any` 类型限制（ERROR 级别）

以下规则在所有代码中启用（**ERROR** 级别）：

- `@typescript-eslint/no-explicit-any`: 禁止显式使用 `any` 类型
- `@typescript-eslint/no-unsafe-assignment`: 禁止不安全的赋值
- `@typescript-eslint/no-unsafe-call`: 禁止不安全的函数调用
- `@typescript-eslint/no-unsafe-member-access`: 禁止不安全的成员访问
- `@typescript-eslint/no-unsafe-return`: 禁止不安全的返回值
- `@typescript-eslint/no-unsafe-argument`: 禁止不安全的参数类型

#### 何时可以使用 `any`

参见 [docs/any-except.md](./any-except.md) 了解详细说明。简要来说：

**✅ 允许的场景**：

1. **泛型约束中的函数类型**：

```typescript
type ReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;
```

2. **需要配合单元测试验证行为**：

```typescript
function parseJSON<T = unknown>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 配合单元测试验证行为
    return null as any;
  }
}
```

**❌ 禁止的场景**：

```typescript
// 仅为避免类型错误而使用 any
function process(data: any): any {
  // ❌ 应该使用 unknown 或具体类型
  return data.value;
}
```

### 2. TSDoc 注释规范

所有公共 API、类、方法、接口必须添加 TSDoc 注释：

````typescript
/**
 * 用户服务
 *
 * 负责用户相关的业务逻辑处理
 *
 * @description 提供用户的创建、查询、更新、删除等功能
 */
export class UserService {
  /**
   * 根据用户ID查询用户信息
   *
   * @param userId - 用户ID
   * @returns 用户信息，如果不存在则返回 null
   * @throws {UserNotFoundException} 当用户不存在时抛出
   *
   * @example
   * ```typescript
   * const user = await userService.findById('user-123');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  async findById(userId: string): Promise<User | null> {
    // ...
  }
}
````

### 3. 代码质量规则

- **未使用的变量**：使用 `_` 前缀忽略
- **圈复杂度**：限制为 15（warning）
- **最大嵌套深度**：4 层（warning）
- **函数最大行数**：100 行（warning）
- **函数参数数量**：5 个（warning）

## 特殊配置

### 测试文件

测试文件（`*.spec.ts`、`*.test.ts`、`__tests__/**`）中：

- `any` 类型规则降低为 **WARNING**
- 可以使用 `console`
- 函数长度限制放宽

**注意**：项目处于重新开发初期，所有非测试代码都必须严格遵循宪章原则，不提供遗留代码的宽松配置。

## 子项目集成

### 创建子项目配置

在子项目中创建 `eslint.config.mjs`：

```javascript
import rootConfig from "../../eslint.config.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 继承根配置
  ...rootConfig,

  // 子项目特定配置
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // 子项目特定规则（如果需要）
    },
  },
);
```

### package.json 配置

在子项目的 `package.json` 中添加：

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## 禁用规则的正确方式

### 单行禁用

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 原因说明
const data: any = JSON.parse(jsonString);
```

### 代码块禁用

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any -- 原因说明 */
function legacyFunction(data: any): any {
  return data;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### 文件级禁用（强烈不推荐）

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any -- 必须有充分理由和明确的修复计划 */

// 整个文件的代码...
// 注意：项目处于重新开发初期，不应该出现需要文件级禁用的情况
```

## 代码审查检查清单

在代码审查时，检查以下项：

- [ ] 是否有新增的 `any` 使用？
  - [ ] 是否有充分的理由说明？
  - [ ] 是否考虑了 `unknown`、泛型等替代方案？
  - [ ] 是否有对应的单元测试？（测试覆盖率 ≥ 90%）

- [ ] 公共 API 是否有完整的 TSDoc 注释？
  - [ ] 是否包含 `@description`、`@param`、`@returns`？
  - [ ] 是否有使用示例 `@example`？

- [ ] 代码复杂度是否合理？
  - [ ] 函数是否过长（> 100 行）？
  - [ ] 圈复杂度是否过高（> 15）？
  - [ ] 嵌套层级是否过深（> 4 层）？

## VS Code 集成

### 安装插件

1. 安装 **ESLint** 插件
2. 安装 **Prettier** 插件

### 配置（.vscode/settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 度量目标

根据项目宪章，我们设定以下度量目标：

- **`any` 使用率**：< 1%
- **测试覆盖率**（使用 `any` 的代码）：≥ 90%
- **TSDoc 注释覆盖率**（公共 API）：100%

## 故障排除

### 问题：ESLint 报告找不到 TypeScript 配置

**解决方案**：确保 `tsconfig.json` 在正确的位置，并且 `eslint.config.mjs` 中的 `projectService` 配置正确。

### 问题：某些文件被意外检查

**解决方案**：检查 `ignores` 配置，确保忽略了正确的目录和文件。

### 问题：性能问题（ESLint 运行缓慢）

**解决方案**：

1. 确保 `node_modules`、`dist` 等目录被正确忽略
2. 考虑使用 `--cache` 选项
3. 限制检查的文件范围

## 参考资料

- [项目宪章](../.specify/memory/constitution.md) - 查看完整的代码质量原则
- [TypeScript `any` 类型说明](./any-except.md) - 了解 `any` 类型的详细使用指南
- [ESLint 官方文档](https://eslint.org/)
- [TypeScript ESLint 文档](https://typescript-eslint.io/)
- [TSDoc 规范](https://tsdoc.org/)
