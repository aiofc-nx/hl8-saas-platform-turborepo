# HL8 SAAS 平台配置使用指南

> 本文档介绍 HL8 SAAS 平台的配置管理机制和使用方法

---

## ⚠️ 重要提示：两种缓存的区别

本项目中存在**两种完全不同的缓存**，请不要混淆：

| 缓存类型         | 模块           | 用途             | 使用方式       | 依赖关系 |
| ---------------- | -------------- | ---------------- | -------------- | -------- |
| **配置缓存**     | `libs/config`  | 缓存配置加载结果 | 框架自动、透明 | 独立实现 |
| **业务数据缓存** | `libs/caching` | 缓存用户数据等   | 应用手动调用   | 独立实现 |

**关键点**：

- ✅ `libs/config` 内置配置缓存，**自己实现**，不依赖 `libs/caching`
- ✅ `libs/caching` 提供业务数据缓存，**自己实现**，不依赖 `libs/config`
- ✅ **两者完全独立，互不依赖**
- ❌ 不要认为配置缓存需要使用 `libs/caching`

详见：[两种缓存的区别](./CONFIG_TWO_CACHES.md)

---

## 📚 目录

- [配置机制概述](#配置机制概述)
- [快速开始](#快速开始)
- [配置文件说明](#配置文件说明)
- [环境变量配置](#环境变量配置)
- [配置类说明](#配置类说明)
- [如何使用配置](#如何使用配置)
- [添加新配置](#添加新配置)
- [配置安全](#配置安全)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 配置机制概述

### 配置架构三层结构

```
┌─────────────────────────────────────────┐
│  应用配置层                              │
│  定义应用的完整配置结构                  │
│  apps/fastify-api/src/config/          │
└──────────────┬──────────────────────────┘
               ↓ 组合使用
┌─────────────────────────────────────────┐
│  业务库配置层                            │
│  各业务模块定义自己的配置类              │
│  libs/*/src/config/                     │
└──────────────┬──────────────────────────┘
               ↓ 使用框架
┌─────────────────────────────────────────┐
│  配置框架层                              │
│  提供配置加载、验证、注入能力            │
│  libs/config/                           │
└─────────────────────────────────────────┘
```

### 核心特性

- ✅ **类型安全** - 完整的 TypeScript 类型支持
- ✅ **运行时验证** - 基于 class-validator 的配置验证
- ✅ **环境变量** - 支持 .env 文件和环境变量覆盖
- ✅ **嵌套配置** - 支持多层嵌套的配置结构
- ✅ **默认值** - 所有配置都有合理的默认值
- ✅ **智能提示** - IDE 完整的自动补全和类型提示
- ✅ **配置缓存** - 自动缓存配置加载结果，优化性能（对使用者透明）

---

## 快速开始

### 1. 创建 .env 文件

在项目根目录或应用目录创建 `.env` 或 `.env.local` 文件：

```bash
# apps/fastify-api/.env

# 应用配置
NODE_ENV=development
PORT=3000

# 日志配置
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=true

# Redis 配置
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379

# 缓存配置
CACHING__TTL=3600
CACHING__KEY_PREFIX=hl8:cache:

# Metrics 配置
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
```

### 2. 在服务中使用配置

```typescript
import { Injectable } from "@nestjs/common";
import { AppConfig } from "./config/app.config.js";

@Injectable()
export class MyService {
  constructor(
    // 注入配置
    private readonly config: AppConfig,
  ) {}

  someMethod() {
    // 使用配置 - 完整的类型支持和智能提示
    const port = this.config.PORT;
    const logLevel = this.config.logging.level;
    const redisHost = this.config.caching.redis.host;

    console.log(`App running on port ${port}`);
    console.log(`Log level: ${logLevel}`);
  }
}
```

---

## 配置文件说明

### .env 文件优先级

配置加载优先级（从高到低）：

1. `.env.local` - 本地开发配置（不应提交到 git）
2. `.env` - 默认配置（可以提交到 git）
3. 配置类中的默认值

### 环境变量命名规则

使用 `__`（双下划线）作为嵌套分隔符：

```bash
# 一级配置
NODE_ENV=production

# 嵌套配置
LOGGING__LEVEL=info                  # config.logging.level
LOGGING__PRETTY_PRINT=false          # config.logging.prettyPrint

# 多层嵌套
CACHING__REDIS__HOST=localhost       # config.caching.redis.host
CACHING__REDIS__PORT=6379            # config.caching.redis.port
```

### 类型转换

环境变量是字符串，会自动转换为正确的类型：

```bash
PORT=3000                            # 转换为 number
LOGGING__PRETTY_PRINT=true           # 转换为 boolean
CACHING__REDIS__PORT=6379            # 转换为 number
```

---

## 环境变量配置

### 应用基础配置

```bash
# 运行环境
NODE_ENV=development                 # development | production | test

# 应用端口
PORT=3000                            # 默认：3000
```

### 日志配置

```bash
# 日志级别
LOGGING__LEVEL=info                  # fatal | error | warn | info | debug | trace | silent

# 是否美化输出（开发环境建议 true）
LOGGING__PRETTY_PRINT=true           # 默认：false

# 是否包含隔离上下文（租户、组织等信息）
LOGGING__INCLUDE_ISOLATION_CONTEXT=true  # 默认：true

# 是否包含时间戳
LOGGING__TIMESTAMP=true              # 默认：true

# 是否启用日志
LOGGING__ENABLED=true                # 默认：true
```

### 缓存配置

```bash
# Redis 连接配置
CACHING__REDIS__HOST=localhost       # Redis 主机
CACHING__REDIS__PORT=6379            # Redis 端口
CACHING__REDIS__PASSWORD=            # Redis 密码（可选）
CACHING__REDIS__DB=0                 # Redis 数据库编号

# 缓存选项
CACHING__TTL=3600                    # 缓存过期时间（秒）
CACHING__KEY_PREFIX=hl8:cache:       # 缓存键前缀
CACHING__DEBUG=false                 # 是否启用调试日志
```

### Metrics 配置

```bash
# Metrics 端点路径
METRICS__PATH=/metrics               # 默认：/metrics

# 是否包含租户级别指标
METRICS__INCLUDE_TENANT_METRICS=true # 默认：true

# 是否启用默认指标
METRICS__ENABLE_DEFAULT_METRICS=true # 默认：true
```

### 速率限制配置（可选）

```bash
# 时间窗口内最大请求数
RATE_LIMIT__MAX=1000                 # 默认：1000

# 时间窗口（毫秒）
RATE_LIMIT__TIME_WINDOW=60000        # 默认：60000（1分钟）

# 限流策略
RATE_LIMIT__STRATEGY=tenant          # ip | tenant | user | custom
```

---

## 配置类说明

### AppConfig - 应用根配置

应用的完整配置结构，位于 `apps/fastify-api/src/config/app.config.ts`

```typescript
export class AppConfig {
  // 应用基础配置
  NODE_ENV: string; // 运行环境
  PORT: number; // 应用端口

  // 日志配置
  logging: LoggingConfig; // from @hl8/nestjs-fastify

  // 缓存配置
  caching: CachingModuleConfig; // from @hl8/caching

  // Metrics 配置
  metrics: MetricsModuleConfig; // from @hl8/nestjs-fastify

  // 速率限制配置（可选）
  rateLimit?: RateLimitModuleConfig; // from @hl8/nestjs-fastify

  // 辅助方法
  get isProduction(): boolean; // 是否生产环境
  get isDevelopment(): boolean; // 是否开发环境
}
```

### LoggingConfig - 日志配置

来自 `@hl8/nestjs-fastify`，定义日志行为：

```typescript
export class LoggingConfig {
  level: string; // 日志级别
  prettyPrint: boolean; // 是否美化输出
  includeIsolationContext: boolean; // 是否包含隔离上下文
  timestamp: boolean; // 是否包含时间戳
  enabled: boolean; // 是否启用日志
}
```

### CachingModuleConfig - 缓存配置

来自 `@hl8/caching`，定义缓存和 Redis 配置：

```typescript
export class CachingModuleConfig {
  redis: RedisConfig; // Redis 连接配置
  ttl?: number; // 缓存过期时间（秒）
  keyPrefix?: string; // 缓存键前缀
  debug?: boolean; // 调试日志
}

export class RedisConfig {
  host: string; // Redis 主机
  port: number; // Redis 端口
  password?: string; // Redis 密码
  db?: number; // 数据库编号
}
```

---

## 如何使用配置

### 在服务中注入配置

```typescript
import { Injectable } from "@nestjs/common";
import { AppConfig } from "./config/app.config.js";

@Injectable()
export class UserService {
  constructor(private readonly config: AppConfig) {}

  async getUsers() {
    // 访问应用配置
    if (this.config.isProduction) {
      // 生产环境逻辑
    }

    // 访问日志配置
    const logLevel = this.config.logging.level;

    // 访问缓存配置
    const redisHost = this.config.caching.redis.host;
    const cacheTtl = this.config.caching.ttl;

    // 访问 Metrics 配置
    const metricsPath = this.config.metrics.path;
  }
}
```

### 在模块中使用配置

```typescript
import { Module } from "@nestjs/common";
import { AppConfig } from "./config/app.config.js";

@Module({
  providers: [
    {
      provide: "MY_CONFIG",
      inject: [AppConfig],
      useFactory: (config: AppConfig) => {
        // 根据配置创建 provider
        return {
          host: config.caching.redis.host,
          port: config.caching.redis.port,
        };
      },
    },
  ],
})
export class MyModule {}
```

### 在控制器中使用配置

```typescript
import { Controller, Get } from "@nestjs/common";
import { AppConfig } from "./config/app.config.js";

@Controller("api")
export class ApiController {
  constructor(private readonly config: AppConfig) {}

  @Get("config")
  getConfig() {
    return {
      environment: this.config.NODE_ENV,
      port: this.config.PORT,
      isProduction: this.config.isProduction,
      logLevel: this.config.logging.level,
    };
  }
}
```

---

## 添加新配置

### 添加应用特有配置

如果需要添加应用特有的配置字段：

```typescript
// apps/fastify-api/src/config/app.config.ts

export class AppConfig {
  // 现有配置...
  NODE_ENV: string = "development";
  PORT: number = 3000;

  // 添加新的应用配置
  @IsString()
  @IsOptional()
  public readonly APP_NAME: string = "hl8-api";

  @IsString()
  @IsOptional()
  public readonly API_VERSION: string = "v1";
}
```

然后在 .env 中设置：

```bash
APP_NAME=my-api
API_VERSION=v2
```

### 添加业务库配置

如果是业务库特有的配置，应该在业务库中定义：

```typescript
// libs/my-module/src/config/my-module.config.ts

export class MyModuleConfig {
  @IsString()
  endpoint!: string;

  @IsNumber()
  @IsOptional()
  timeout?: number = 3000;
}
```

然后在应用配置中组合使用：

```typescript
// apps/fastify-api/src/config/app.config.ts

import { MyModuleConfig } from "@hl8/my-module";

export class AppConfig {
  // ... 其他配置

  @ValidateNested()
  @Type(() => MyModuleConfig)
  @IsOptional()
  public readonly myModule: MyModuleConfig = new MyModuleConfig();
}
```

---

## 配置安全

### 安全风险与防护

#### 1. 配置不可变性

**风险**：配置在运行时被修改

**防护**：

```typescript
import { deepFreeze } from "./config/config-security.util.js";

// main.ts
const config = app.get(AppConfig);
deepFreeze(config); // 深度冻结配置

// 现在配置完全不可修改
config.PORT = 9999; // ❌ TypeError
```

#### 2. 敏感信息保护

**风险**：敏感信息泄露

**防护**：

```typescript
import {
  cleanupSensitiveEnvVars,
  getSafeConfigCopy,
} from "./config/config-security.util.js";

// 生产环境清理敏感环境变量
if (config.isProduction) {
  cleanupSensitiveEnvVars();
}

// 打印日志时隐藏敏感信息
const safeConfig = getSafeConfigCopy(config);
console.log("Config:", safeConfig); // password: '***'
```

#### 3. 文件权限

```bash
# 限制配置文件权限
chmod 600 .env.local
chmod 600 config/secrets.yml

# 检查权限
ls -l .env.local
# -rw------- 1 user user  # 仅所有者可读写
```

### 混合配置策略（推荐）

```
基础配置 → app.yml（可版本控制）
  ├─ 应用名称、版本
  ├─ 日志级别
  └─ 非敏感配置

敏感配置 → .env.local（不提交）
  ├─ 数据库密码
  ├─ API 密钥
  └─ 加密密钥
```

**实施**：

```typescript
TypedConfigModule.forRoot({
  schema: AppConfig,
  load: [
    fileLoader({ path: "./config/app.yml" }), // 基础配置
    dotenvLoader({ envFilePath: [".env.local", ".env"] }), // 敏感配置
  ],
});
```

### 安全工具

项目提供了配置安全工具：`apps/fastify-api/src/config/config-security.util.ts`

- `deepFreeze()` - 深度冻结配置对象
- `cleanupSensitiveEnvVars()` - 清理敏感环境变量
- `isFrozen()` - 检查是否已冻结
- `getSafeConfigCopy()` - 获取安全副本（隐藏敏感信息）

### 安全示例

完整的安全配置示例：`apps/fastify-api/src/main.secure.example.ts`

### 相关文档

- [配置安全性分析](./CONFIG_SECURITY_ANALYSIS.md) - 深入分析
- [环境变量 vs 配置文件](./CONFIG_ENV_VS_FILE.md) - 对比说明

---

## 最佳实践

### ✅ 推荐做法

1. **使用环境变量**

   ```bash
   # 不要硬编码敏感信息
   CACHING__REDIS__PASSWORD=secret123
   ```

2. **使用 .env.local 存储本地配置**

   ```bash
   # .env.local（不提交到 git）
   CACHING__REDIS__HOST=192.168.1.100
   ```

3. **在配置类中提供合理的默认值**

   ```typescript
   NODE_ENV: string = "development"; // 提供默认值
   ```

4. **使用类型安全的配置访问**

   ```typescript
   // ✅ 正确：类型安全
   const port = this.config.PORT;

   // ❌ 避免：字符串访问
   const port = process.env.PORT;
   ```

5. **利用辅助方法**

   ```typescript
   if (this.config.isProduction) {
     // 生产环境逻辑
   }
   ```

### ❌ 避免的做法

1. **不要在代码中硬编码配置**

   ```typescript
   // ❌ 避免
   const host = "localhost";

   // ✅ 正确
   const host = this.config.caching.redis.host;
   ```

2. **不要跳过配置验证**

   ```typescript
   // ❌ 避免：直接使用环境变量
   const port = process.env.PORT;

   // ✅ 正确：使用验证过的配置
   const port = this.config.PORT;
   ```

3. **不要重复定义配置类**

   ```typescript
   // ❌ 避免：在应用中重新定义库级配置
   export class RedisConfig { ... }

   // ✅ 正确：导入使用
   import { CachingModuleConfig } from '@hl8/caching';
   ```

---

## 常见问题

### Q1: 如何查看当前加载的配置？

**A**: 创建一个配置端点：

```typescript
@Controller("debug")
export class DebugController {
  constructor(private readonly config: AppConfig) {}

  @Get("config")
  getConfig() {
    return {
      environment: this.config.NODE_ENV,
      port: this.config.PORT,
      logging: {
        level: this.config.logging.level,
        prettyPrint: this.config.logging.prettyPrint,
      },
      // 注意：不要暴露敏感信息
    };
  }
}
```

### Q2: 配置验证失败怎么办？

**A**: 检查以下几点：

1. 环境变量名称是否正确（注意 `__` 分隔符）
2. 环境变量值的类型是否正确
3. 必填字段是否已设置
4. 查看启动日志中的详细错误信息

```bash
# 示例错误
Error: Config validation error:
  - port must be a number
  - NODE_ENV must be one of: development, production, test
```

### Q3: 如何在不同环境使用不同配置？

**A**: 使用不同的 .env 文件：

```bash
# 开发环境
.env.local

# 生产环境（通过环境变量或 CI/CD 注入）
export NODE_ENV=production
export PORT=8080
```

### Q4: 配置更新后需要重启应用吗？

**A**: 是的。配置在应用启动时加载，更新配置需要重启应用。

### Q5: 如何处理敏感配置？

**A**: 敏感配置建议：

1. 使用环境变量而不是配置文件
2. 使用密钥管理服务（如 AWS Secrets Manager）
3. 不要提交 `.env.local` 到版本控制
4. 在 `.gitignore` 中忽略敏感配置文件

```bash
# .gitignore
.env.local
.env.production
```

### Q6: 如何验证配置是否正确？

**A**: 应用启动时会自动验证配置。如果验证失败，应用会抛出错误并终止启动。

### Q7: 配置有缓存吗？会影响性能吗？

**A**: 有配置缓存，且完全透明：

- ✅ `libs/config` 自动缓存配置加载结果
- ✅ 避免重复读取和解析配置文件
- ✅ 提升配置访问性能
- ✅ 对使用者完全透明，无需关心

**注意**：这与业务数据缓存（`libs/caching`）是两个不同的缓存系统。

详见：[配置缓存机制详解](./CONFIG_CACHE_EXPLAINED.md)

### Q8: 配置缓存 vs 业务数据缓存有什么区别？

**A**: 完全不同的两种缓存：

| 缓存类型     | 提供者         | 用途                | 使用方式   |
| ------------ | -------------- | ------------------- | ---------- |
| 配置缓存     | `libs/config`  | 缓存 AppConfig 实例 | 自动、透明 |
| 业务数据缓存 | `libs/caching` | 缓存用户数据等      | 手动调用   |

详见：[配置缓存机制详解](./CONFIG_CACHE_EXPLAINED.md)

---

## 配置示例

### 开发环境完整配置

```bash
# .env.local

# 应用配置
NODE_ENV=development
PORT=3000

# 日志配置 - 开发环境详细日志
LOGGING__LEVEL=debug
LOGGING__PRETTY_PRINT=true
LOGGING__INCLUDE_ISOLATION_CONTEXT=true
LOGGING__TIMESTAMP=true
LOGGING__ENABLED=true

# Redis 配置 - 本地 Redis
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379
CACHING__REDIS__DB=0

# 缓存配置 - 较短的 TTL 方便测试
CACHING__TTL=600
CACHING__KEY_PREFIX=dev:hl8:cache:
CACHING__DEBUG=true

# Metrics 配置
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
METRICS__ENABLE_DEFAULT_METRICS=true
```

### 生产环境完整配置

```bash
# 生产环境通常通过环境变量注入

# 应用配置
NODE_ENV=production
PORT=8080

# 日志配置 - 生产环境精简日志
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=false
LOGGING__INCLUDE_ISOLATION_CONTEXT=true
LOGGING__TIMESTAMP=true
LOGGING__ENABLED=true

# Redis 配置 - 生产 Redis
CACHING__REDIS__HOST=redis.production.internal
CACHING__REDIS__PORT=6379
CACHING__REDIS__PASSWORD=${REDIS_PASSWORD}  # 从环境变量获取
CACHING__REDIS__DB=0

# 缓存配置
CACHING__TTL=3600
CACHING__KEY_PREFIX=prod:hl8:cache:
CACHING__DEBUG=false

# Metrics 配置
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
METRICS__ENABLE_DEFAULT_METRICS=true

# 速率限制 - 生产环境启用
RATE_LIMIT__MAX=1000
RATE_LIMIT__TIME_WINDOW=60000
RATE_LIMIT__STRATEGY=tenant
```

---

## 相关资源

### 文档

- [配置架构说明](./CONFIG_ARCHITECTURE.md) - 深入了解配置架构设计
- [配置快速参考](./CONFIG_QUICK_REFERENCE.md) - 快速查找配置相关信息
- [可视化配置指南](./CONFIG_VISUAL_GUIDE.md) - 图形化理解配置架构

### 代码位置

- 配置框架：`libs/config/`
- 日志配置：`libs/nestjs-fastify/src/config/logging.config.ts`
- 缓存配置：`libs/caching/src/config/caching.config.ts`
- 应用配置：`apps/fastify-api/src/config/app.config.ts`

---

## 总结

### 配置管理的核心要点

1. **类型安全** - 使用 TypeScript 和 class-validator
2. **环境变量** - 使用 .env 文件和环境变量
3. **默认值** - 所有配置都有合理的默认值
4. **验证** - 启动时自动验证配置
5. **分层** - 框架层、业务层、应用层清晰分离

### 快速检查清单

- [ ] 创建了 .env 或 .env.local 文件
- [ ] 配置了必要的环境变量
- [ ] 使用 `__` 分隔符表示嵌套
- [ ] 通过依赖注入使用 `AppConfig`
- [ ] 利用 TypeScript 的类型提示
- [ ] 不在代码中硬编码配置
- [ ] 不提交敏感配置到版本控制

---

**需要帮助？**

如果遇到配置相关问题，请查看：

- 启动日志中的错误信息
- 配置验证错误提示
- 相关架构文档

祝你使用愉快！🎉
