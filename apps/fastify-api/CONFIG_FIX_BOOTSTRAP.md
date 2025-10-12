# 配置修复：bootstrap.ts

> 修复 ConfigService 依赖问题

---

## 🐛 问题描述

### 错误信息

```
UnknownElementException [Error]: Nest could not find ConfigService element 
(this provider does not exist in the current context)
```

### 原因分析

应用已经切换到使用自定义的配置模块（`@hl8/config` 的 `TypedConfigModule`），但 `bootstrap.ts` 还在尝试注入 `@nestjs/config` 的 `ConfigService`。

```typescript
// ❌ 旧代码
import { ConfigService } from '@nestjs/config';

const configService = app.get(ConfigService);  // ← 找不到
const port = parseInt(configService.get('PORT') || '3000', 10);
```

---

## ✅ 修复方案

### 修改内容

**文件**：`apps/fastify-api/src/bootstrap.ts`

**修改1：替换导入**

```typescript
// ❌ 之前
import { ConfigService } from '@nestjs/config';

// ✅ 之后
import { AppConfig } from './config/app.config.js';
```

**修改2：替换配置获取**

```typescript
// ❌ 之前
const configService = app.get(ConfigService);
const port = parseInt(configService.get('PORT') || '3000', 10);
const host = configService.get('HOST') || '0.0.0.0';

// ✅ 之后
const appConfig = app.get(AppConfig);
const port = appConfig.PORT;  // 直接访问，类型安全
const host = process.env.HOST || '0.0.0.0';
```

---

## 🎯 修复优势

### 类型安全

```typescript
// ❌ ConfigService（字符串 key，可能拼写错误）
const port = parseInt(configService.get('PORT') || '3000', 10);
const level = configService.get('LOG_LEVEL');  // 无类型提示

// ✅ AppConfig（类型安全，IDE 自动补全）
const port = appConfig.PORT;  // number 类型
const level = appConfig.logging.level;  // LogLevel 类型，有自动补全
```

### 简洁性

```typescript
// ❌ ConfigService（需要解析和默认值）
const port = parseInt(configService.get('PORT') || '3000', 10);

// ✅ AppConfig（已经有默认值和类型）
const port = appConfig.PORT;  // 简洁，默认值在 AppConfig 中定义
```

### 一致性

```typescript
// ✅ 整个应用统一使用 AppConfig
// app.module.ts
TypedConfigModule.forRoot({ schema: AppConfig })

// bootstrap.ts
const appConfig = app.get(AppConfig);

// 任何服务
constructor(private readonly config: AppConfig) {}
```

---

## 📋 检查清单

### 修复完成

- [x] 移除 `ConfigService` 导入
- [x] 添加 `AppConfig` 导入
- [x] 替换 `app.get(ConfigService)` 为 `app.get(AppConfig)`
- [x] 更新配置访问方式
- [x] 验证无 linter 错误

### 应用状态

- [x] 配置模块正确：`TypedConfigModule` ✅
- [x] 配置类正确：`AppConfig` ✅
- [x] 所有模块使用统一配置 ✅
- [x] bootstrap.ts 使用 AppConfig ✅

---

## 🎊 修复总结

### 修改的文件

| 文件 | 修改内容 | 行数 |
|------|---------|------|
| `src/bootstrap.ts` | 替换 ConfigService 为 AppConfig | 3 行 |

### 影响范围

- ✅ 应用启动逻辑
- ✅ 端口和主机配置获取

### 测试验证

**重新启动应用**：

```bash
pnpm run start
```

**预期结果**：

```
✅ 应用正常启动
✅ 无 ConfigService 相关错误
✅ 配置正确加载
```

---

## 📖 相关文档

- [配置指南](../../../docs/guides/config/CONFIGURATION_GUIDE.md)
- [AppConfig 说明](./CONFIG.md)

---

---

## 🐛 问题2：.env.local 文件不存在

### 错误信息

```
ConfigError: Failed to load configuration file: .env.local, .env
...
originalError: Error: ENOENT: no such file or directory, open '.env.local'
```

### 原因分析

`app.module.ts` 中配置了加载多个 .env 文件：

```typescript
envFilePath: ['.env.local', '.env']
```

但项目中只有 `.env` 文件，没有 `.env.local`，导致加载失败。

---

## ✅ 修复方案2

### 修改内容

**文件**：`apps/fastify-api/src/app.module.ts`

```typescript
// ❌ 之前
dotenvLoader({
  separator: '__',
  envFilePath: ['.env.local', '.env'],  // ← 数组，都必须存在
  enableExpandVariables: true,
})

// ✅ 之后
dotenvLoader({
  separator: '__',
  envFilePath: '.env',  // ← 单个文件，简化配置
  enableExpandVariables: true,
})
```

### 说明

- `.env.local` 是可选的本地开发配置文件
- 如果需要，开发者可以自己创建 `.env.local` 覆盖 `.env` 的配置
- 但默认只需要 `.env` 即可

### 可选：创建 .env.local

如果需要本地配置覆盖，可以创建：

```bash
# 复制 .env 作为模板
cp apps/fastify-api/.env apps/fastify-api/.env.local

# 修改本地配置
# 然后恢复数组配置
```

---

**配置修复完成！** ✅

现在可以重新启动应用了。

---

## 📋 完整修复清单

### 修复1：ConfigService → AppConfig

- [x] 移除 `ConfigService` 导入
- [x] 添加 `AppConfig` 导入
- [x] 替换配置获取方式
- [x] 验证无 linter 错误

### 修复2：.env 文件配置

- [x] 简化 `envFilePath` 配置
- [x] 使用单个 `.env` 文件
- [x] 移除不存在的 `.env.local` 引用

---

---

## 🐛 问题3：Redis 配置缺失

### 错误信息

```
Failed to start application: TypeError: Cannot read properties of undefined (reading 'host')
    at RedisService.connect
```

### 原因分析

`CachingModule` 需要 Redis 配置，但 `.env` 文件中没有 Redis 相关的环境变量。

`CachingModuleConfig` 需要：

- `REDIS__HOST`
- `REDIS__PORT`
- `CACHE__TTL`（可选）
- `CACHE__KEY_PREFIX`（可选）

---

## ✅ 修复方案3

### 修改内容

**文件**：`apps/fastify-api/.env`

添加以下 Redis 配置：

**注意环境变量命名空间**：

由于 `AppConfig` 中的属性是 `caching: CachingModuleConfig`，环境变量需要使用 `CACHING__` 前缀。

```bash
# 缓存配置（注意：需要使用 CACHING__ 前缀）
CACHING__REDIS__HOST=localhost
CACHING__REDIS__PORT=6379
CACHING__REDIS__DB=0
CACHING__TTL=3600
CACHING__KEY_PREFIX=hl8:cache:
```

**环境变量映射规则**：

```
CACHING__REDIS__HOST → AppConfig.caching.redis.host
CACHING__REDIS__PORT → AppConfig.caching.redis.port
CACHING__TTL         → AppConfig.caching.ttl
```

### 启动 Redis

**使用 Docker**：

```bash
docker run -d \
  --name redis-hl8 \
  -p 6379:6379 \
  redis:alpine
```

**检查 Redis 是否运行**：

```bash
docker ps | grep redis
# 或
redis-cli ping  # 应该返回 PONG
```

---

**所有配置问题已修复！** ✅

重新启动应用应该可以正常运行了。

---

## 📋 完整修复清单

### 修复1：ConfigService → AppConfig ✅

- [x] 移除 `ConfigService` 导入
- [x] 添加 `AppConfig` 导入
- [x] 替换配置获取方式
- [x] 验证无 linter 错误

### 修复2：.env 文件配置 ✅

- [x] 简化 `envFilePath` 配置
- [x] 使用单个 `.env` 文件
- [x] 移除不存在的 `.env.local` 引用

### 修复3：Redis 配置 ✅

- [x] 添加 Redis 环境变量
- [x] 配置缓存参数
- [x] 提供启动 Redis 的命令

### 修复4：配置类默认值 ✅

- [x] 为 `RedisConfig` 添加默认值
- [x] 为 `CachingModuleConfig.redis` 添加默认值
- [x] 重新构建 `@hl8/caching` 库
- [x] 重新构建应用

---

## 🐛 问题4：配置类默认值缺失

### 原因分析

`CachingModuleConfig` 和 `RedisConfig` 的必需属性没有默认值：

```typescript
export class RedisConfig {
  host!: string;  // ← 使用 ! 表示必需，但没有默认值
  port!: number;  // ← 没有默认值
}

export class CachingModuleConfig {
  redis!: RedisConfig;  // ← 必需，但没有默认值
}
```

当 `AppConfig` 创建默认实例时：

```typescript
caching: CachingModuleConfig = new CachingModuleConfig();
// → redis 是 undefined
```

---

## ✅ 修复方案4

### 修改内容

**文件**：`libs/caching/src/config/caching.config.ts`

```typescript
// ✅ 添加默认值
export class RedisConfig {
  @IsString()
  host: string = 'localhost';  // ← 默认值
  
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number = 6379;  // ← 默认值
}

export class CachingModuleConfig {
  @ValidateNested()
  @Type(() => RedisConfig)
  redis: RedisConfig = new RedisConfig();  // ← 默认值
}
```

### 重新构建

```bash
# 构建 caching 库
pnpm --filter @hl8/caching run build

# 构建应用
cd apps/fastify-api && pnpm run build
```

---

## 🚀 启动应用

### 步骤1：确保 Redis 运行

```bash
# 启动 Redis（使用 Docker）
docker run -d --name redis-hl8 -p 6379:6379 redis:alpine

# 验证 Redis
docker ps | grep redis
```

### 步骤2：启动应用

```bash
pnpm run start:dev
```

### 预期结果

```
✅ 应用正常启动
✅ 配置正确加载
✅ Redis 连接成功
✅ 所有模块正常工作
```

---

**配置修复完成！** ✅🎉
