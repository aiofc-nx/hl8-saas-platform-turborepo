# 配置架构快速参考

## 一句话说明

> **`libs/config` 是配置管理框架（工具），提供读取、验证、缓存能力，不定义具体配置类；具体配置类在各业务库中定义，由应用组合使用。**

### ⚠️ 重要区分

**两种缓存，职责不同**：

| 缓存类型         | 提供者         | 用途             | 使用方式      |
| ---------------- | -------------- | ---------------- | ------------- |
| **配置缓存**     | `libs/config`  | 缓存配置加载结果 | 自动、透明 ✨ |
| **业务数据缓存** | `libs/caching` | 缓存用户数据等   | 手动调用 🔧   |

详见：[配置缓存机制详解](./CONFIG_CACHE_EXPLAINED.md)

---

## 三层架构速查

| 层次              | 位置                 | 职责                    | 示例                                   |
| ----------------- | -------------------- | ----------------------- | -------------------------------------- |
| **🔧 配置框架层** | `libs/config/`       | 提供配置管理工具        | `TypedConfigModule`, `dotenvLoader`    |
| **📦 业务库层**   | `libs/*/src/config/` | 定义业务模块的配置类    | `LoggingConfig`, `CachingModuleConfig` |
| **🏢 应用层**     | `apps/*/src/config/` | 组合使用 + 应用特有配置 | `AppConfig`                            |

---

## 各层详解

### 🔧 配置框架层 (`libs/config`)

**是什么？**

- 一个配置管理框架（类似 `@nestjs/config` 的增强版）

**提供什么？**

- ✅ `TypedConfigModule` - 配置模块
- ✅ `dotenvLoader` - 环境变量加载器
- ✅ `fileLoader` - 文件加载器
- ✅ 配置验证能力

**不提供什么？**

- ❌ 不定义任何具体的配置类
- ❌ 不关心你的业务配置是什么

**类比**：

- 就像 Express 提供路由框架，但不定义你的具体路由
- `libs/config` 提供配置框架，但不定义你的具体配置

---

### 📦 业务库层 (`libs/*/src/config/`)

**是什么？**

- 各业务库定义自己的配置类

**示例**：

| 业务库                | 配置文件                               | 定义的配置类                                   |
| --------------------- | -------------------------------------- | ---------------------------------------------- |
| `@hl8/nestjs-fastify` | `src/config/logging.config.ts`         | `LoggingConfig`                                |
|                       | `src/config/fastify-modules.config.ts` | `MetricsModuleConfig`, `RateLimitModuleConfig` |
| `@hl8/caching`        | `src/config/caching.config.ts`         | `RedisConfig`, `CachingModuleConfig`           |

**为什么在这里？**

- 这些配置是业务模块特有的
- 可以被多个应用复用
- 保证配置结构一致性

---

### 🏢 应用层 (`apps/*/src/config/`)

**是什么？**

- 应用配置类，组合使用业务库的配置

**做什么？**

```typescript
// apps/fastify-api/src/config/app.config.ts

// 1. 导入业务库的配置类
import { LoggingConfig } from "@hl8/nestjs-fastify";
import { CachingModuleConfig } from "@hl8/caching";

// 2. 组合使用（不重新定义！）
export class AppConfig {
  logging: LoggingConfig = new LoggingConfig();
  caching: CachingModuleConfig = new CachingModuleConfig();
}
```

**不做什么？**

- ❌ 不重新定义业务库的配置类
- ❌ 不复制粘贴配置类代码

---

## 决策树：配置类应该定义在哪里？

```
┌─────────────────────────────────────────┐
│ 这个配置类应该定义在哪里？               │
└───────────────┬─────────────────────────┘
                │
                ├─> 是配置加载/验证的通用功能？
                │   └─> ✅ libs/config（配置框架）
                │
                ├─> 是某个业务库特有的配置？
                │   └─> ✅ libs/xxx/src/config/（业务库）
                │
                └─> 是应用特有的配置？
                    └─> ✅ apps/xxx/src/config/（应用）
```

---

## 使用流程

### 1️⃣ 业务库定义配置类

```typescript
// libs/caching/src/config/caching.config.ts
export class CachingModuleConfig {
  redis!: RedisConfig;
  ttl?: number;
  keyPrefix?: string;
}
```

### 2️⃣ 导出配置类

```typescript
// libs/caching/src/index.ts
export { CachingModuleConfig, RedisConfig } from "./config/caching.config.js";
```

### 3️⃣ 应用导入使用

```typescript
// apps/fastify-api/src/config/app.config.ts
import { CachingModuleConfig } from "@hl8/caching";

export class AppConfig {
  caching: CachingModuleConfig = new CachingModuleConfig();
}
```

### 4️⃣ 注册配置模块

```typescript
// apps/fastify-api/src/app.module.ts
import { TypedConfigModule, dotenvLoader } from '@hl8/config';
import { AppConfig } from './config/app.config.js';

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: [dotenvLoader()],
    }),
  ],
})
```

### 5️⃣ 注入使用

```typescript
@Injectable()
export class MyService {
  constructor(private readonly config: AppConfig) {}

  someMethod() {
    const host = this.config.caching.redis.host;
  }
}
```

---

## ✅ 正确做法 vs ❌ 错误做法

### 场景：使用缓存配置

#### ❌ 错误做法（重复定义）

```typescript
// apps/fastify-api/src/config/app.config.ts

// ❌ 重新定义了 RedisConfig
export class RedisConfig {
  host: string = "localhost";
  port: number = 6379;
}

// ❌ 重新定义了缓存配置
export class CacheConfig {
  ttl: number = 3600;
}

export class AppConfig {
  redis: RedisConfig = new RedisConfig();
  cache: CacheConfig = new CacheConfig();
}
```

**问题**：

- 与 `libs/caching` 中的定义重复
- 需要在两个地方维护
- 容易不一致

#### ✅ 正确做法（导入使用）

```typescript
// apps/fastify-api/src/config/app.config.ts

// ✅ 从库中导入
import { CachingModuleConfig } from "@hl8/caching";

export class AppConfig {
  // ✅ 使用导入的配置类
  caching: CachingModuleConfig = new CachingModuleConfig();
}
```

**优势**：

- 单一配置源
- 零重复
- 类型一致
- 易于维护

---

## 常见问题速查

### Q: `libs/config` 应该定义配置类吗？

**A: ❌ 不应该**

- `libs/config` 只提供配置管理工具
- 具体的配置类在业务库中定义

### Q: 应用层可以重新定义配置类吗？

**A: ❌ 不可以**

- 应用层应该导入使用业务库的配置类
- 只有应用特有的配置才在应用层定义

### Q: 为什么不把所有配置都放在一个地方？

**A: 职责分离和模块独立性**

- 每个业务库管理自己的配置
- 保持模块的独立性
- 易于复用和维护

### Q: 如何添加新的配置？

**A: 根据配置的性质决定**

1. **通用的配置加载功能** → `libs/config`
2. **业务库特有的配置** → `libs/xxx/src/config/`
3. **应用特有的配置** → `apps/xxx/src/config/`

---

## 记住这些要点

### ✅ 应该做的

1. 在业务库中定义业务相关的配置类
2. 在应用层导入使用业务库的配置类
3. 只在应用层定义应用特有的配置
4. 遵循单一配置源原则

### ❌ 不应该做的

1. 在 `libs/config` 中定义具体的配置类
2. 在应用层重复定义业务库的配置类
3. 在多个地方维护相同的配置
4. 复制粘贴配置类代码

---

## 总结

```
libs/config          → 提供工具（TypedConfigModule, loaders）
     ↓
libs/*/src/config/   → 定义配置类（LoggingConfig, CachingModuleConfig）
     ↓
apps/*/src/config/   → 导入组合使用（AppConfig）
     ↓
.env                 → 提供具体值
     ↓
运行时配置实例       → 注入使用
```

**核心原则**：

- 🔧 框架提供工具
- 📦 业务定义配置
- 🏢 应用组合使用
- ♻️ 单一配置源
