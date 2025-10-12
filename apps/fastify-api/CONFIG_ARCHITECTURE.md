# 配置架构设计

## 核心原则：单一配置源 (Single Source of Truth)

### ❌ 错误设计 - 多处定义配置

```
libs/nestjs-fastify/src/config/
  ├── logging.config.ts           ← 定义 LoggingConfig
  └── fastify-modules.config.ts   ← 定义 MetricsModuleConfig

apps/fastify-api/src/config/
  └── app.config.ts                ← ❌ 重复定义 LoggingConfig
                                    ← ❌ 重复定义 MetricsConfig
```

**问题**：

- 重复定义（违反 DRY 原则）
- 维护负担（两边都要更新）
- 容易不一致
- 增加认知负担

---

### ✅ 正确设计 - 单一配置源

```
libs/nestjs-fastify/src/config/
  ├── logging.config.ts           ← 定义 LoggingConfig（源头）
  └── fastify-modules.config.ts   ← 定义 MetricsModuleConfig（源头）
         ↓
      导出到
         ↓
libs/nestjs-fastify/src/index.ts
  export * from './config/index.js';
         ↓
      被导入
         ↓
apps/fastify-api/src/config/app.config.ts
  import { LoggingConfig, MetricsModuleConfig } from '@hl8/nestjs-fastify';
  
  export class AppConfig {
    logging: LoggingConfig;        ← 使用导入的配置类
    metrics: MetricsModuleConfig;  ← 使用导入的配置类
  }
```

**优势**：

- 单一真相源
- 零重复
- 易于维护
- 版本一致

---

## 配置分层架构

### 第一层：库级配置（Library-Level Config）

**位置**：`libs/nestjs-fastify/src/config/`

**职责**：

- 定义基础设施模块的配置类
- 提供默认值和验证规则
- 可被多个应用复用

**示例**：

```typescript
// libs/nestjs-fastify/src/config/logging.config.ts
export class LoggingConfig {
  level: LogLevel = 'info';
  prettyPrint: boolean = false;
  includeIsolationContext: boolean = true;
  timestamp: boolean = true;
  enabled: boolean = true;
}

// libs/nestjs-fastify/src/config/fastify-modules.config.ts
export class MetricsModuleConfig {
  path: string = '/metrics';
  includeTenantMetrics: boolean = true;
  enableDefaultMetrics: boolean = true;
}

export class RateLimitModuleConfig {
  max: number = 1000;
  timeWindow: number = 60000;
  strategy: 'ip' | 'tenant' | 'user' | 'custom' = 'tenant';
}
```

### 第二层：应用级配置（Application-Level Config）

**位置**：`apps/fastify-api/src/config/app.config.ts`

**职责**：

- 组合库级配置类
- 添加应用特有的配置
- 提供应用级别的辅助方法

**示例**：

```typescript
// apps/fastify-api/src/config/app.config.ts
import {
  LoggingConfig,
  MetricsModuleConfig,
  RateLimitModuleConfig,
} from '@hl8/nestjs-fastify';

export class AppConfig {
  // 应用基础配置
  NODE_ENV: string = 'development';
  PORT: number = 3000;

  // 组合库级配置（不重新定义）
  logging: LoggingConfig = new LoggingConfig();
  metrics: MetricsModuleConfig = new MetricsModuleConfig();
  rateLimit?: RateLimitModuleConfig;

  // 应用特有配置
  redis: RedisConfig = new RedisConfig();
  cache: CacheConfig = new CacheConfig();

  // 应用级辅助方法
  get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}
```

---

## 配置职责划分

### 库级配置（@hl8/nestjs-fastify）

**应该包含**：

- ✅ 基础设施模块的配置（Logging、Metrics、RateLimit等）
- ✅ 通用的、可复用的配置
- ✅ 框架级别的配置

**不应该包含**：

- ❌ 应用特定的业务配置
- ❌ 应用特定的数据源配置
- ❌ 应用特定的集成配置

### 应用级配置（apps/fastify-api）

**应该包含**：

- ✅ 应用基础配置（环境、端口等）
- ✅ 应用特有的配置（Redis、数据库等）
- ✅ 业务相关的配置
- ✅ 组合使用的库级配置

**不应该包含**：

- ❌ 重复定义库级配置类
- ❌ 框架级别的配置（应该在库中）

---

## 环境变量映射

### 使用嵌套分隔符 `__`

```bash
# 对应 AppConfig.logging.level
LOGGING__LEVEL=info

# 对应 AppConfig.logging.prettyPrint
LOGGING__PRETTY_PRINT=true

# 对应 AppConfig.metrics.path
METRICS__PATH=/metrics

# 对应 AppConfig.metrics.includeTenantMetrics
METRICS__INCLUDE_TENANT_METRICS=true

# 对应 AppConfig.rateLimit.max
RATE_LIMIT__MAX=1000

# 对应 AppConfig.redis.host
REDIS__HOST=localhost

# 对应 AppConfig.cache.ttl
CACHE__TTL=3600
```

---

## 配置使用示例

### 在服务中注入配置

```typescript
import { Injectable } from '@nestjs/common';
import { AppConfig } from './config/app.config.js';

@Injectable()
export class MyService {
  constructor(private readonly config: AppConfig) {}

  someMethod() {
    // 访问库级配置
    const logLevel = this.config.logging.level;
    const metricsPath = this.config.metrics.path;
    
    // 访问应用特有配置
    const redisHost = this.config.redis.host;
    const cacheTtl = this.config.cache.ttl;
    
    // 使用辅助方法
    if (this.config.isProduction) {
      // 生产环境逻辑
    }
  }
}
```

### 在模块中使用配置

```typescript
@Module({
  imports: [
    // 配置模块
    TypedConfigModule.forRoot({
      schema: AppConfig,
      isGlobal: true,
      load: [dotenvLoader({ separator: '__' })],
    }),

    // 使用配置（支持异步注入）
    CachingModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        redis: config.redis,
        ttl: config.cache.ttl,
        keyPrefix: config.cache.keyPrefix,
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 配置扩展指南

### 添加新的库级配置

**步骤**：

1. 在库中定义配置类

   ```typescript
   // libs/nestjs-fastify/src/config/new-feature.config.ts
   export class NewFeatureConfig {
     enabled: boolean = true;
     // ...
   }
   ```

2. 在库的 index.ts 中导出

   ```typescript
   // libs/nestjs-fastify/src/config/index.ts
   export * from './new-feature.config.js';
   ```

3. 在应用配置中使用

   ```typescript
   // apps/fastify-api/src/config/app.config.ts
   import { NewFeatureConfig } from '@hl8/nestjs-fastify';
   
   export class AppConfig {
     newFeature: NewFeatureConfig = new NewFeatureConfig();
   }
   ```

### 添加应用特有配置

**步骤**：

1. 在应用配置文件中直接定义

   ```typescript
   // apps/fastify-api/src/config/app.config.ts
   export class MyCustomConfig {
     // 应用特有的配置
   }
   
   export class AppConfig {
     myCustom: MyCustomConfig = new MyCustomConfig();
   }
   ```

---

## 最佳实践

### ✅ 推荐做法

1. **配置类在库中定义，应用中导入使用**
2. **使用 TypeScript 类型系统确保类型安全**
3. **使用 class-validator 进行运行时验证**
4. **提供合理的默认值**
5. **使用嵌套结构组织配置**
6. **使用环境变量支持不同环境**

### ❌ 避免的做法

1. **不要在应用中重新定义库级配置类**
2. **不要混合配置和业务逻辑**
3. **不要硬编码敏感信息**
4. **不要在多个地方维护相同的配置**

---

## 总结

### 配置架构原则

1. **单一配置源（Single Source of Truth）**
   - 每个配置类只在一个地方定义
   - 其他地方通过导入使用

2. **分层清晰（Clear Layering）**
   - 库级配置：通用、可复用
   - 应用级配置：特定、组合

3. **类型安全（Type Safety）**
   - 编译时类型检查
   - 运行时验证

4. **易于维护（Maintainability）**
   - 零重复
   - 职责单一
   - 易于扩展

通过遵循这些原则，我们确保配置管理简单、清晰、易于维护，避免了多处管理配置带来的问题。
