# 配置架构完整说明

---

## ⚠️ 避免混淆：两种独立的缓存

本项目中存在**两种缓存**，它们完全独立，互不相关：

```
libs/config 的配置缓存
  ├─ 用途：缓存配置加载结果（AppConfig）
  ├─ 实现：自己实现（CacheManager）
  ├─ 使用：框架内部自动使用，透明
  └─ 依赖：❌ 不依赖 libs/caching

libs/caching 的业务数据缓存
  ├─ 用途：缓存业务数据（用户、商品等）
  ├─ 实现：自己实现（基于 Redis）
  ├─ 使用：应用显式调用 CacheService
  └─ 依赖：❌ 不依赖 libs/config
```

**关键点**：两个模块各自实现自己的缓存，互不依赖！

详见：[两种缓存的区别](./CONFIG_TWO_CACHES.md)

---

## 🎯 核心概念

### 配置架构的三个层次

```
┌─────────────────────────────────────────────────────────────┐
│  应用层 (Application Layer)                                  │
│  apps/fastify-api/src/config/app.config.ts                  │
│  - 定义应用配置类 (AppConfig)                                │
│  - 组合使用库级配置类                                         │
│  - 添加应用特有配置                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ 组合使用
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  业务库层 (Business Library Layer)                           │
│  libs/nestjs-fastify/src/config/                            │
│  libs/caching/src/config/                                   │
│  libs/xxx/src/config/                                       │
│  - 定义各业务模块的配置类                                     │
│  - 提供默认值和验证规则                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ 使用框架
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  配置框架层 (Configuration Framework Layer)                  │
│  libs/config/                                               │
│  - 提供 TypedConfigModule                                   │
│  - 提供配置加载器 (dotenvLoader, fileLoader...)             │
│  - 提供配置验证能力                                          │
│  - 不定义具体配置类                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 各层职责详解

### 第一层：配置框架层 (`libs/config`)

**职责**：提供配置管理基础设施

#### 是什么？

- 一个**通用的配置管理框架**
- 类似于 `@nestjs/config`，但提供更强的类型安全

#### 提供什么？

1. **TypedConfigModule** - NestJS 配置模块

   ```typescript
   TypedConfigModule.forRoot({
     schema: AppConfig, // 传入配置类
     load: [dotenvLoader()], // 配置加载器
   });
   ```

2. **配置加载器**
   - `dotenvLoader()` - 从 .env 文件加载
   - `fileLoader()` - 从文件加载
   - `remoteLoader()` - 从远程服务加载
   - `directoryLoader()` - 从目录批量加载

3. **配置验证**
   - 基于 `class-validator`
   - 类型转换（基于 `class-transformer`）
   - 详细的错误信息

4. **配置扩展**
   - 环境变量替换 `${VAR}`
   - 默认值语法 `${VAR:-DEFAULT}`
   - 嵌套配置支持

#### 不提供什么？

- ❌ **不定义任何具体的配置类**
- ❌ 不关心你的业务配置是什么
- ❌ 只是一个工具框架

#### 类比

就像 Express 框架：

- Express 提供路由、中间件等基础设施
- 但不定义你的具体路由和业务逻辑
- `libs/config` 提供配置加载和验证
- 但不定义你的具体配置类

---

### 第二层：业务库层 (各业务库的 `src/config/`)

**职责**：定义各业务模块的配置类

#### 示例 1: `libs/nestjs-fastify/src/config/`

**提供的配置类**：

```typescript
// libs/nestjs-fastify/src/config/logging.config.ts
export class LoggingConfig {
  level: string = 'info';
  prettyPrint: boolean = false;
  // ...
}

// libs/nestjs-fastify/src/config/fastify-modules.config.ts
export class MetricsModuleConfig {
  path: string = '/metrics';
  includeTenantMetrics: boolean = true;
  // ...
}

export class RateLimitModuleConfig {
  max: number = 1000;
  timeWindow: number = 60000;
  // ...
}
```

**为什么在这里定义？**

- 这些配置是 Fastify 模块特有的
- 可以被多个使用 Fastify 的应用复用
- 保证配置结构的一致性

#### 示例 2: `libs/caching/src/config/`

**提供的配置类**：

```typescript
// libs/caching/src/config/caching.config.ts
export class RedisConfig {
  host!: string;
  port!: number;
  password?: string;
  // ...
}

export class CachingModuleConfig {
  redis!: RedisConfig;
  ttl?: number;
  keyPrefix?: string;
  // ...
}
```

**为什么在这里定义？**

- 这些配置是缓存模块特有的
- 可以被多个使用缓存的应用复用
- 包含 Redis 连接配置和缓存选项

#### 规则

✅ **应该在业务库中定义配置类的情况**：

- 配置是该业务模块特有的
- 配置可以被多个应用复用
- 配置有明确的验证规则和默认值

❌ **不应该在业务库中定义配置类的情况**：

- 应用特有的业务配置
- 与业务库无关的配置

---

### 第三层：应用层 (`apps/*/src/config/`)

**职责**：组合库级配置，添加应用特有配置

#### 示例: `apps/fastify-api/src/config/app.config.ts`

```typescript
// 1. 导入配置框架
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

// 2. 导入业务库的配置类（不重新定义！）
import {
  LoggingConfig,
  MetricsModuleConfig,
  RateLimitModuleConfig,
} from '@hl8/nestjs-fastify';

import { CachingModuleConfig } from '@hl8/caching';

// 3. 定义应用配置类
export class AppConfig {
  // 应用基础配置
  NODE_ENV: string = 'development';
  PORT: number = 3000;

  // 组合使用库级配置（导入，不重新定义）
  @ValidateNested()
  @Type(() => LoggingConfig)
  logging: LoggingConfig = new LoggingConfig();

  @ValidateNested()
  @Type(() => CachingModuleConfig)
  caching: CachingModuleConfig = new CachingModuleConfig();

  @ValidateNested()
  @Type(() => MetricsModuleConfig)
  metrics: MetricsModuleConfig = new MetricsModuleConfig();

  // 应用特有的配置（如果有的话）
  // customConfig: CustomConfig = new CustomConfig();

  // 辅助方法
  get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}
```

#### 规则

✅ **应该在应用层做的**：

- 导入并组合库级配置类
- 定义应用特有的配置
- 提供应用级的辅助方法

❌ **不应该在应用层做的**：

- ❌ 重新定义库级配置类
- ❌ 复制粘贴库级配置类的代码

---

## 🔄 配置流程

### 完整的配置加载流程

```
1. 定义配置类
   └─> AppConfig (组合 LoggingConfig, CachingModuleConfig...)

2. 注册配置模块
   └─> TypedConfigModule.forRoot({
         schema: AppConfig,
         load: [dotenvLoader()]
       })

3. 加载环境变量
   └─> .env 文件 → dotenvLoader 读取

4. 类型转换
   └─> class-transformer 转换类型

5. 验证配置
   └─> class-validator 验证规则

6. 注入使用
   └─> constructor(private config: AppConfig) {}
```

---

## 📁 目录结构说明

```
hl8-saas-platform-turborepo/
│
├── libs/
│   ├── config/                           # 配置框架层
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── typed-config.module.ts    # 配置模块
│   │   │   │   └── loader/
│   │   │   │       ├── dotenv.loader.ts      # .env 加载器
│   │   │   │       ├── file.loader.ts        # 文件加载器
│   │   │   │       └── remote.loader.ts      # 远程加载器
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── nestjs-fastify/                   # 业务库层
│   │   ├── src/
│   │   │   ├── config/                   # 定义 Fastify 相关配置类
│   │   │   │   ├── logging.config.ts    # ← 配置类定义
│   │   │   │   ├── fastify-modules.config.ts  # ← 配置类定义
│   │   │   │   └── index.ts
│   │   │   └── index.ts                  # 导出配置类
│   │   └── package.json
│   │
│   └── caching/                          # 业务库层
│       ├── src/
│       │   ├── config/                   # 定义缓存相关配置类
│       │   │   └── caching.config.ts    # ← 配置类定义
│       │   └── index.ts                  # 导出配置类
│       └── package.json
│
└── apps/
    └── fastify-api/                      # 应用层
        └── src/
            ├── config/
            │   └── app.config.ts         # ← 组合使用，不重新定义
            └── app.module.ts             # 注册 TypedConfigModule
```

---

## ✅ 最佳实践

### 1. 单一配置源原则

**规则**：每个配置类只在一个地方定义

```typescript
// ✅ 正确：在业务库中定义
// libs/caching/src/config/caching.config.ts
export class CachingModuleConfig {
  /* ... */
}

// ✅ 正确：在应用中导入使用
// apps/fastify-api/src/config/app.config.ts
import { CachingModuleConfig } from '@hl8/caching';

// ❌ 错误：在应用中重新定义
// apps/fastify-api/src/config/app.config.ts
export class CachingModuleConfig {
  /* ... */
} // ❌ 不要这样！
```

### 2. 配置分层原则

**规则**：清晰的职责分离

- **框架层** - 提供工具，不定义配置
- **业务库层** - 定义可复用的配置类
- **应用层** - 组合配置，添加应用特有配置

### 3. 配置类的归属原则

**决策树**：

```
这个配置类应该定义在哪里？
│
├─> 是配置加载/验证的通用功能吗？
│   └─> Yes → libs/config（配置框架层）
│
├─> 是某个业务库特有的配置吗？
│   └─> Yes → libs/xxx/src/config/（业务库层）
│
└─> 是应用特有的配置吗？
    └─> Yes → apps/xxx/src/config/（应用层）
```

---

## 🔍 常见问题

### Q1: 为什么需要三个层次？

**A**: 职责分离和复用

- **配置框架层**：提供通用的配置管理能力，可以用于任何项目
- **业务库层**：定义可复用的业务配置，多个应用可以共享
- **应用层**：组合配置，适配特定应用的需求

### Q2: `libs/config` 和 `@nestjs/config` 有什么区别？

**A**: 类型安全程度不同

| 特性     | @nestjs/config       | @hl8/config            |
| -------- | -------------------- | ---------------------- |
| 类型安全 | 运行时（需手动获取） | 编译时 + 运行时        |
| 配置验证 | 需手动实现           | 基于 class-validator   |
| 智能提示 | 有限                 | 完整的 TypeScript 支持 |
| 嵌套配置 | 需手动处理           | 自动支持（使用 `__`）  |

### Q3: 为什么不把所有配置类都放在 `libs/config`？

**A**: `libs/config` 是框架，不是配置仓库

- `libs/config` 提供配置管理的**工具**
- 各业务库负责定义自己的配置类
- 这样保持了模块的独立性和可维护性

### Q4: 如果两个业务库需要相同的配置怎么办？

**A**: 提取到共享配置库

```typescript
// 创建共享配置库
libs/shared-config/
  └── src/
      └── redis.config.ts  // 共享的 Redis 配置

// 业务库导入使用
import { RedisConfig } from '@hl8/shared-config';
```

---

## 📊 配置层次对比

| 层次       | 职责                       | 示例                                   | 能否被其他模块导入    |
| ---------- | -------------------------- | -------------------------------------- | --------------------- |
| 配置框架层 | 提供配置管理工具           | `TypedConfigModule`, `dotenvLoader`    | ✅ 所有模块都可以使用 |
| 业务库层   | 定义业务模块配置类         | `LoggingConfig`, `CachingModuleConfig` | ✅ 可以被应用层导入   |
| 应用层     | 组合配置，定义应用特有配置 | `AppConfig`                            | ❌ 仅供当前应用使用   |

---

## 🎯 总结

### 配置架构的核心思想

```
配置框架 (libs/config)
    ↓ 提供工具
业务库配置 (libs/*/src/config/)
    ↓ 定义可复用的配置类
应用配置 (apps/*/src/config/)
    ↓ 组合使用
环境变量 (.env)
    ↓ 提供具体值
运行时配置实例
```

### 关键原则

1. **职责分离** - 框架、业务、应用各司其职
2. **单一配置源** - 每个配置类只在一个地方定义
3. **导入复用** - 应用层导入使用，不重新定义
4. **类型安全** - 充分利用 TypeScript 类型系统

通过遵循这些原则，我们实现了清晰、可维护、类型安全的配置管理架构。
