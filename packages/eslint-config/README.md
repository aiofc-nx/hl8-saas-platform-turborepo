# @repo/eslint-config

HL8 SAAS Platform 的共享 ESLint 配置包。

## 概述

本包提供符合项目宪章（Constitution v1.4.0）的 ESLint 配置，包括：

- **严格的 TypeScript `any` 类型限制**（宪章原则 IX）
- **TSDoc 注释规范检查**（宪章原则 II）
- **代码质量和复杂度控制**（宪章原则 V）

## 可用配置

### 基础配置（base）

适用于所有 TypeScript 项目的基础配置。

```javascript
import { config as baseConfig } from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  // 项目特定配置
];
```

**包含的规则**：

- TypeScript 推荐规则 + 类型检查
- `any` 类型严格限制（ERROR 级别）
- TSDoc 注释检查
- 代码质量和复杂度控制
- 命名约定
- Prettier 集成

### NestJS 配置（nest-js）

适用于 NestJS 后端项目。

```javascript
import { nestJsConfig } from '@repo/eslint-config/nest-js';

export default nestJsConfig;
```

**额外特性**：

- 继承基础配置的所有规则
- 添加 NestJS 特定规则
- 支持 NestJS 装饰器模式
- Node.js 全局变量

**⚠️ 重要变更**：

- **已修复**：移除了 `@typescript-eslint/no-explicit-any: 'off'`，现在严格遵循宪章原则
- 所有 NestJS 项目也必须遵守 `any` 类型使用规范

### Next.js 配置（next-js）

适用于 Next.js 前端项目。

```javascript
import { nextJsConfig } from '@repo/eslint-config/next-js';

export default nextJsConfig;
```

**额外特性**：

- 继承基础配置的所有规则
- Next.js 推荐规则
- React 和 React Hooks 规则
- 浏览器全局变量

## 辅助配置

### 测试文件配置（testConfig）

测试文件会自动应用特殊规则（已包含在 base.js 中）：

- `any` 类型规则降低为 WARNING
- 允许使用 `console`
- 放宽函数长度限制

测试文件模式：

- `**/*.spec.ts`、`**/*.spec.tsx`
- `**/*.test.ts`、`**/*.test.tsx`
- `**/__tests__/**/*.ts`、`**/__tests__/**/*.tsx`

## 在子项目中使用

### 1. NestJS 项目

在 `libs/*/eslint.config.mjs` 中：

```javascript
import { nestJsConfig } from '@repo/eslint-config/nest-js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...nestJsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

### 2. Next.js 项目

在 `apps/web/eslint.config.mjs` 中：

```javascript
import { nextJsConfig } from '@repo/eslint-config/next-js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...nextJsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

### 3. 通用库项目

在 `packages/*/eslint.config.mjs` 中：

```javascript
import { config as baseConfig, testConfig } from '@repo/eslint-config/base';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...baseConfig,
  ...testConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
```

**注意**：项目处于重新开发初期，所有代码都必须严格遵循宪章原则，不提供遗留代码的宽松配置。

## TypeScript `any` 类型使用指南

### ❌ 禁止的用法

```typescript
// 懒惰使用 any
function process(data: any): any {
  return data.value;
}

// 为避免类型错误而使用 any
const result: any = someFunction();
```

### ✅ 允许的用法

**1. 泛型约束中的函数类型**：

```typescript
type ReturnType<T extends (...args: any[]) => any> = 
  T extends (...args: any[]) => infer R ? R : never;
```

**2. 配合单元测试使用**：

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

**3. 高阶函数和装饰器**：

```typescript
function withLogging<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    console.log('Calling function');
    return fn(...args);
  };
}
```

### 使用 `any` 的正确流程

1. **优先考虑替代方案**：
   - 使用 `unknown` + 类型保护
   - 使用泛型约束
   - 使用联合类型

2. **如果必须使用 `any`**：
   - 添加 eslint-disable 注释并说明原因
   - 编写单元测试验证行为（测试覆盖率 ≥ 90%）
   - 将 `any` 限制在最小范围内

3. **代码审查时验证**：
   - 理由是否充分？
   - 是否有更安全的替代方案？
   - 测试覆盖率是否足够？

## 核心规则说明

### 类型安全规则（ERROR 级别）

- `@typescript-eslint/no-explicit-any`: 禁止显式使用 `any`
- `@typescript-eslint/no-unsafe-assignment`: 禁止不安全的赋值
- `@typescript-eslint/no-unsafe-call`: 禁止不安全的函数调用
- `@typescript-eslint/no-unsafe-member-access`: 禁止不安全的成员访问
- `@typescript-eslint/no-unsafe-return`: 禁止不安全的返回值
- `@typescript-eslint/no-unsafe-argument`: 禁止不安全的参数

### 代码质量规则

- `complexity`: 圈复杂度 ≤ 15 (WARNING)
- `max-depth`: 最大嵌套深度 ≤ 4 (WARNING)
- `max-lines`: 文件最大行数 ≤ 500 (WARNING)
- `max-lines-per-function`: 函数最大行数 ≤ 100 (WARNING)
- `max-params`: 函数参数数量 ≤ 5 (WARNING)

### TSDoc 规则

- `tsdoc/syntax`: TSDoc 注释语法检查 (WARNING)

## 安装

在 monorepo 根目录或子项目中，ESLint 依赖已通过 `@repo/eslint-config` 包管理。

```bash
# 安装所有依赖
pnpm install
```

## 运行 ESLint

```bash
# 检查所有项目
pnpm lint

# 检查特定项目
pnpm lint:api
pnpm lint:web

# 自动修复
turbo lint -- --fix
```

## 度量目标

根据项目宪章设定的目标：

- **`any` 使用率**：< 1%
- **使用 `any` 的代码测试覆盖率**：≥ 90%
- **公共 API TSDoc 覆盖率**：100%

## 参考资料

- [项目宪章](../../.specify/memory/constitution.md) - 查看完整的代码质量原则
- [ESLint 使用指南](../../docs/eslint-guide.md) - 详细的使用说明
- [TypeScript `any` 类型说明](../../docs/any-except.md) - `any` 类型的详细使用指南
- [TSDoc 规范](https://tsdoc.org/)

## 与宪章的对齐

本配置完全符合项目宪章 v1.4.0 的所有要求：

| 宪章原则 | ESLint 配置 | 状态 |
|---------|-----------|------|
| I. 中文优先原则 | 支持中文注释 | ✅ |
| II. 代码即文档原则 | TSDoc 插件 + 注释检查 | ✅ |
| V. 质量保证原则 | 子项目继承根配置 | ✅ |
| IX. TypeScript `any` 类型使用原则 | 严格的 `any` 检查规则 | ✅ |

## 版本历史

- **v0.0.0** (2025-10-11): 初始版本，遵循宪章 v1.4.0
  - 严格的 `any` 类型限制
  - TSDoc 注释检查
  - 代码质量和复杂度控制
  - 修复 NestJS 配置违反宪章的问题
