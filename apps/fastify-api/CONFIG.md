# Fastify API 配置说明

## 概述

本应用使用自定义的类型安全配置模块 `@hl8/config`，提供完整的 TypeScript 类型支持和运行时验证。

## 配置文件

### 环境变量文件

创建 `.env` 或 `.env.local` 文件（优先级：`.env.local` > `.env`）：

```bash
# 应用配置
NODE_ENV=development
PORT=3000

# 日志配置（使用 __ 作为嵌套分隔符）
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=true
LOGGING__INCLUDE_ISOLATION_CONTEXT=true
LOGGING__TIMESTAMP=true
LOGGING__ENABLED=true

# 缓存配置（使用 __ 作为嵌套分隔符）
# Redis 连接配置
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379
CACHING__REDIS__PASSWORD=  # 可选
CACHING__REDIS__DB=0

# 缓存选项
CACHING__TTL=3600
CACHING__KEY_PREFIX=hl8:cache:
CACHING__DEBUG=false

# Metrics 配置
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
METRICS__ENABLE_DEFAULT_METRICS=true

# 速率限制配置（可选）
RATE_LIMIT__MAX=1000
RATE_LIMIT__TIME_WINDOW=60000
RATE_LIMIT__STRATEGY=tenant
```

## 配置结构

配置通过 `AppConfig` 类定义，位于 `src/config/app.config.ts`：

### 根配置

- `NODE_ENV`: 运行环境（development | production | test）
- `PORT`: 应用端口（默认：3000）

### 日志配置 (`logging`)

- `level`: 日志级别（fatal | error | warn | info | debug | trace | silent，默认：info）
- `prettyPrint`: 是否美化输出（默认：false）
- `includeIsolationContext`: 是否包含隔离上下文（默认：true）
- `timestamp`: 是否包含时间戳（默认：true）
- `enabled`: 是否启用日志（默认：true）

### 缓存配置 (`caching`)

使用 @hl8/caching 的 CachingModuleConfig，包含：

**Redis 配置** (`caching.redis`):

- `host`: Redis 主机地址（必填，建议：localhost）
- `port`: Redis 端口（必填，建议：6379）
- `password`: Redis 密码（可选）
- `db`: Redis 数据库编号（可选，默认：0）
- `connectTimeout`: 连接超时时间/毫秒（可选）
- `maxRetriesPerRequest`: 最大重试次数（可选）
- `enableOfflineQueue`: 是否启用离线队列（可选）

**缓存选项**:

- `ttl`: 缓存过期时间/秒（可选，默认：3600）
- `keyPrefix`: 缓存键前缀（可选，默认：hl8:cache:）
- `debug`: 是否启用调试日志（可选，默认：false）

### Metrics 配置 (`metrics`)

- `path`: Metrics 端点路径（默认：/metrics）
- `includeTenantMetrics`: 是否包含租户级别指标（默认：true）
- `enableDefaultMetrics`: 是否启用默认指标（默认：true）

### 速率限制配置 (`rateLimit`) - 可选

- `max`: 时间窗口内最大请求数（默认：1000）
- `timeWindow`: 时间窗口/毫秒（默认：60000）
- `strategy`: 限流策略（ip | tenant | user | custom，默认：tenant）

## 使用方式

### 1. 在服务中注入配置

```typescript
import { Injectable } from '@nestjs/common';
import { AppConfig } from './config/app.config.js';

@Injectable()
export class MyService {
  constructor(private readonly config: AppConfig) {}

  someMethod() {
    // 完整的类型安全和智能提示
    const redisHost = this.config.caching.redis.host;
    const redisPort = this.config.caching.redis.port;
    const cacheTtl = this.config.caching.ttl;
    const isProduction = this.config.isProduction;
  }
}
```

### 2. 嵌套配置访问

```typescript
// 访问日志配置
config.logging.level             // string
config.logging.prettyPrint       // boolean

// 访问缓存配置（CachingModuleConfig）
config.caching.redis.host        // string
config.caching.redis.port        // number
config.caching.ttl               // number | undefined
config.caching.keyPrefix         // string | undefined
config.caching.debug             // boolean | undefined

// 访问 Metrics 配置
config.metrics.path                    // string
config.metrics.includeTenantMetrics    // boolean

// 访问速率限制配置
config.rateLimit?.max          // number | undefined
config.rateLimit?.strategy     // string | undefined

// 辅助属性
config.isProduction      // boolean
config.isDevelopment     // boolean
```

### 3. 环境变量命名规则

使用 `__` 作为嵌套分隔符：

```bash
# 对应 config.logging.level
LOGGING__LEVEL=info

# 对应 config.logging.prettyPrint
LOGGING__PRETTY_PRINT=true

# 对应 config.caching.redis.host
CACHING__REDIS__HOST=localhost

# 对应 config.caching.redis.port
CACHING__REDIS__PORT=6379

# 对应 config.caching.ttl
CACHING__TTL=3600

# 对应 config.caching.keyPrefix
CACHING__KEY_PREFIX=hl8:cache:

# 对应 config.metrics.path
METRICS__PATH=/metrics

# 对应 config.rateLimit.max
RATE_LIMIT__MAX=1000
```

## 特性

### ✅ 类型安全

- 完整的 TypeScript 类型推断
- 编译时类型检查
- 运行时类型验证（基于 class-validator）

### ✅ 智能提示

所有配置字段都有完整的 IDE 智能提示和自动补全。

### ✅ 验证

- 自动验证配置值的类型和格式
- 验证失败时应用启动失败并显示详细错误信息
- 支持自定义验证规则

### ✅ 默认值

所有配置都有合理的默认值，可以零配置启动应用。

### ✅ 变量扩展

支持 `${VAR}` 语法引用其他环境变量：

```bash
DATABASE_URL=postgres://${DB_HOST}:${DB_PORT}/mydb
```

## 启动 Redis

缓存功能需要 Redis 服务：

```bash
# 使用 Docker 启动 Redis
docker run -d -p 6379:6379 redis:alpine

# 或使用 docker-compose
docker-compose up -d redis
```

## 配置优先级

1. `.env.local` 文件
2. `.env` 文件
3. `AppConfig` 类中定义的默认值

## 添加新配置

### 1. 更新配置类

编辑 `src/config/app.config.ts`：

```typescript
export class AppConfig {
  // 添加新的配置字段
  @IsString()
  @IsOptional()
  public readonly MY_NEW_CONFIG: string = 'default_value';
}
```

### 2. 更新环境变量

在 `.env` 文件中添加：

```bash
MY_NEW_CONFIG=my_value
```

### 3. 使用新配置

```typescript
constructor(private readonly config: AppConfig) {}

someMethod() {
  const value = this.config.MY_NEW_CONFIG;
}
```

## 故障排除

### 配置验证失败

如果应用启动时报配置验证错误，请检查：

1. `.env` 文件中的值是否符合类型要求
2. 必填字段是否已设置
3. 数字类型的值是否为有效数字
4. 枚举类型的值是否在允许的范围内

### Redis 连接失败

如果缓存模块报 Redis 连接错误：

1. 确保 Redis 服务已启动
2. 检查 `REDIS__HOST` 和 `REDIS__PORT` 配置
3. 如果使用密码，检查 `REDIS__PASSWORD` 配置

## 相关文档

- [@hl8/config 模块文档](../../libs/config/README.md)
- [TypedConfigModule API](../../libs/config/README.md#api)
- [配置验证规则](../../libs/config/README.md#validation)
