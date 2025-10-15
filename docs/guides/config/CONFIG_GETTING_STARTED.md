# 配置快速入门

> 5分钟快速掌握 HL8 SAAS 平台的配置管理

---

## ⚡ 3 步开始使用

### 步骤 1：创建 .env 文件

在应用目录创建 `.env.local` 文件：

```bash
# apps/fastify-api/.env.local

NODE_ENV=development
PORT=3000
LOGGING__LEVEL=debug
LOGGING__PRETTY_PRINT=true
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379
```

### 步骤 2：在服务中注入配置

```typescript
import { Injectable } from "@nestjs/common";
import { AppConfig } from "./config/app.config.js";

@Injectable()
export class MyService {
  constructor(private readonly config: AppConfig) {}

  someMethod() {
    const port = this.config.PORT; // 完整的类型提示！
  }
}
```

### 步骤 3：启动应用

```bash
cd apps/fastify-api
pnpm dev
```

配置会自动加载和验证！✅

---

## 💡 核心概念（30秒理解）

### 配置的三个角色

```
1. libs/config          → 🔧 工具（读取、验证配置）
2. libs/*/src/config/   → 📦 配置类定义（结构和默认值）
3. apps/*/src/config/   → 🏢 组合配置（组装使用）
```

### 一句话说明

**配置类定义结构，框架负责读取、验证和缓存，应用组合使用。**

### ⚠️ 重要概念：两种独立的缓存

**项目中有两种完全独立的缓存，请勿混淆**：

| 缓存类型            | 模块           | 实现方式                 | 依赖关系              |
| ------------------- | -------------- | ------------------------ | --------------------- |
| 🔧 **配置缓存**     | `libs/config`  | 自己实现（CacheManager） | 不依赖 `libs/caching` |
| 📦 **业务数据缓存** | `libs/caching` | 自己实现（Redis）        | 不依赖 `libs/config`  |

**关键点**：

- ✅ 两个模块各自实现自己的缓存
- ✅ 互不依赖，完全独立
- ❌ 配置缓存不使用 `libs/caching`

详见：[两种缓存的区别](./CONFIG_TWO_CACHES.md) ⚠️

---

## 📝 环境变量速查

### 嵌套规则

使用 `__`（双下划线）表示嵌套：

```bash
LOGGING__LEVEL=info              # config.logging.level
CACHING__REDIS__HOST=localhost   # config.caching.redis.host
```

### 常用配置

```bash
# 应用
NODE_ENV=development
PORT=3000

# 日志
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=true

# 缓存
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379
CACHING__TTL=3600
```

---

## 🎯 使用示例

### 访问配置

```typescript
constructor(private readonly config: AppConfig) {}

// 应用配置
this.config.NODE_ENV        // 'development'
this.config.PORT            // 3000
this.config.isProduction    // false

// 日志配置
this.config.logging.level          // 'info'
this.config.logging.prettyPrint    // true

// 缓存配置
this.config.caching.redis.host     // 'localhost'
this.config.caching.redis.port     // 6379
this.config.caching.ttl            // 3600

// Metrics 配置
this.config.metrics.path                    // '/metrics'
this.config.metrics.includeTenantMetrics    // true
```

---

## ✅ 记住这些

### 3 个关键点

1. **配置类只定义结构** - 不读取文件
2. **libs/config 负责读取和验证** - 自动完成
3. **使用嵌套分隔符 `__`** - 表示层级关系

### 3 个不要

1. ❌ 不要在多个地方定义相同的配置类
2. ❌ 不要跳过配置直接使用环境变量
3. ❌ 不要在代码中硬编码配置值

---

## 📚 下一步

### 想要深入了解？

- **完整使用指南**：[CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md)
- **架构说明**：[CONFIG_ARCHITECTURE.md](./CONFIG_ARCHITECTURE.md)
- **所有文档**：[CONFIG_INDEX.md](./CONFIG_INDEX.md)

### 遇到问题？

查看 [配置使用指南 - 常见问题](./CONFIGURATION_GUIDE.md#常见问题)

---

**开始使用吧！** 🚀
