# Fastify 日志配置文档

## 概述

`@hl8/nestjs-fastify` 提供了完整的日志配置功能，支持灵活的配置选项和类型安全的配置验证。日志系统基于 Fastify 内置的 Pino 日志库，提供零开销的高性能日志记录。

## 特性

- ⚡ **零开销**：复用 Fastify 内置的 Pino 实例
- 🔧 **灵活配置**：支持多种配置选项和环境变量覆盖
- 🛡️ **类型安全**：使用 TypeScript 和 class-validator 进行配置验证
- 🎯 **隔离上下文**：自动包含租户、组织、部门、用户信息
- 🌍 **多环境支持**：开发/生产环境自动适配

## 快速开始

### 基础使用（零配置）

```typescript
import { Module } from "@nestjs/common";
import { FastifyLoggingModule } from "@hl8/nestjs-fastify/index.js";

@Module({
  imports: [
    // 零配置使用，采用默认配置
    FastifyLoggingModule.forRoot(),
  ],
})
export class AppModule {}
```

### 自定义配置

```typescript
import { Module } from "@nestjs/common";
import { FastifyLoggingModule } from "@hl8/nestjs-fastify/index.js";

@Module({
  imports: [
    FastifyLoggingModule.forRoot({
      config: {
        level: "debug",
        prettyPrint: true,
        includeIsolationContext: true,
        timestamp: true,
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}
```

### 环境变量配置

```typescript
import { Module } from "@nestjs/common";
import { FastifyLoggingModule } from "@hl8/nestjs-fastify/index.js";

@Module({
  imports: [
    FastifyLoggingModule.forRoot({
      config: {
        level: (process.env.LOG_LEVEL as any) || "info",
        prettyPrint: process.env.NODE_ENV === "development",
        includeIsolationContext: true,
      },
    }),
  ],
})
export class AppModule {}
```

## 配置选项

### LoggingConfig

| 属性                      | 类型       | 默认值      | 描述                 |
| ------------------------- | ---------- | ----------- | -------------------- |
| `level`                   | `LogLevel` | `'info'`    | 最低日志级别         |
| `prettyPrint`             | `boolean`  | `false`     | 是否使用美化输出     |
| `includeIsolationContext` | `boolean`  | `true`      | 是否包含隔离上下文   |
| `timestamp`               | `boolean`  | `true`      | 是否包含时间戳       |
| `logFile`                 | `string?`  | `undefined` | 日志文件路径（可选） |
| `logRequestDetails`       | `boolean`  | `false`     | 是否记录请求详情     |
| `logResponseDetails`      | `boolean`  | `false`     | 是否记录响应详情     |
| `enabled`                 | `boolean`  | `true`      | 全局开关             |

### LogLevel

支持的日志级别（从高到低）：

- `'fatal'` - 致命错误，应用无法继续运行
- `'error'` - 错误信息，需要立即关注
- `'warn'` - 警告信息，可能存在问题
- `'info'` - 常规信息，正常业务流程
- `'debug'` - 调试信息，开发阶段使用
- `'trace'` - 跟踪信息，详细的执行路径
- `'silent'` - 禁用所有日志

## 使用场景

### 开发环境

```typescript
FastifyLoggingModule.forRoot({
  config: {
    level: "debug",
    prettyPrint: true,
    includeIsolationContext: true,
    timestamp: true,
    logRequestDetails: true,
    logResponseDetails: true,
  },
});
```

### 生产环境

```typescript
FastifyLoggingModule.forRoot({
  config: {
    level: "warn",
    prettyPrint: false,
    includeIsolationContext: true,
    timestamp: true,
    logRequestDetails: false,
    logResponseDetails: false,
  },
});
```

### 性能测试

```typescript
FastifyLoggingModule.forRoot({
  config: {
    level: "silent",
    enabled: false,
  },
});
```

## 注入日志服务

在任何地方都可以注入 `FastifyLoggerService`：

```typescript
import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify/index.js";

@Injectable()
export class MyService {
  constructor(private readonly logger: FastifyLoggerService) {}

  doSomething() {
    this.logger.info("Doing something...");
    this.logger.debug("Debug details...");
    this.logger.error("Error occurred!", error);
  }
}
```

## 隔离上下文

当 `includeIsolationContext: true` 时，日志会自动包含以下信息：

```json
{
  "level": "info",
  "time": 1634567890123,
  "msg": "User action",
  "context": {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "660e8400-e29b-41d4-a716-446655440001",
    "departmentId": "770e8400-e29b-41d4-a716-446655440002",
    "userId": "880e8400-e29b-41d4-a716-446655440003"
  }
}
```

## 环境变量支持

在 `.env` 文件中配置：

```bash
# 日志级别
LOG_LEVEL=debug

# 开发/生产环境
NODE_ENV=development

# 日志文件路径（可选）
LOG_FILE=/var/log/app/app.log
```

## 配置验证

配置会在应用启动时自动验证，如果配置不合法会抛出详细的错误信息：

```typescript
Configuration validation failed:
  - level: level must be one of the following values: fatal, error, warn, info, debug, trace, silent
  - prettyPrint: prettyPrint must be a boolean value
```

## 最佳实践

### 1. 日志级别选择

- **开发环境**：使用 `debug` 或 `trace`
- **生产环境**：使用 `info` 或 `warn`
- **性能测试**：使用 `silent`

### 2. 美化输出

- **开发环境**：启用 `prettyPrint`
- **生产环境**：禁用 `prettyPrint`（使用 JSON 格式）

### 3. 隔离上下文

- **SAAS 应用**：必须启用 `includeIsolationContext`
- **单租户应用**：可选

### 4. 请求/响应详情

- **开发环境**：可启用
- **生产环境**：谨慎启用（可能包含敏感信息）

## 与 @hl8/config 集成

如果项目使用了 `@hl8/config`，可以从配置文件加载日志配置：

```typescript
import { TypedConfigModule, fileLoader } from "@hl8/config";
import {
  FastifyLoggingModule,
  LoggingConfig,
} from "@hl8/nestjs-fastify/index.js";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

// 定义应用配置
class AppConfig {
  @ValidateNested()
  @Type(() => LoggingConfig)
  logging!: LoggingConfig;
}

@Module({
  imports: [
    // 加载配置
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: [fileLoader({ path: "./config/app.yml" })],
    }),

    // 使用配置
    FastifyLoggingModule.forRoot({
      // 从配置服务获取配置
      // 或者直接传入配置对象
    }),
  ],
})
export class AppModule {}
```

## 故障排除

### 日志未输出

1. 检查 `enabled` 是否为 `true`
2. 检查 `level` 是否设置正确
3. 确保 Fastify 实例已正确初始化

### 隔离上下文未包含

1. 确保 `includeIsolationContext: true`
2. 确保 `IsolationModule` 已导入
3. 确保请求头包含隔离标识

### 美化输出不生效

1. 确保安装了 `pino-pretty`
2. 确保 `prettyPrint: true`
3. 确保在开发环境运行

## 相关资源

- [Pino 官方文档](https://getpino.io/)
- [@hl8/config 文档](../../config/README.md)
- [@hl8/nestjs-infra 文档](../../nestjs-infra/README.md)

## 更新日志

### v0.1.0

- ✅ 初始发布
- ✅ 支持基础配置
- ✅ 支持隔离上下文
- ✅ 支持环境变量
- ✅ 支持配置验证
