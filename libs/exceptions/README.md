# @hl8/exceptions

统一的异常处理模块，遵循 RFC7807 标准

---

## ⚠️ 重要说明

### 配置方式说明

本模块使用**模块选项**（Module Options）进行配置，这是 NestJS 动态模块的标准模式。

**关键点**：

- ✅ 使用 `ExceptionModuleOptions` **interface** 定义配置
- ✅ 在 `forRoot()` 或 `forRootAsync()` 中传入配置
- ✅ **不需要**使用 `@hl8/config` 的 `TypedConfigModule`
- ✅ 配置模块的**行为**，不是应用的运行时数据

**与应用配置集成**：

```typescript
// 可以从 AppConfig 获取值来配置模块
ExceptionModule.forRootAsync({
  inject: [AppConfig],
  useFactory: (config: AppConfig) => ({
    enableLogging: config.logging.enabled,
    isProduction: config.isProduction,
  }),
});
```

详见：[模块选项 vs 应用配置](../../docs/guides/config/MODULE_OPTIONS_VS_APP_CONFIG.md)

---

## 🎓 快速开始

**新手培训**：👉 **[异常处理培训文档](./docs/EXCEPTION_HANDLING_TRAINING.md)** ⭐

这份培训文档涵盖：

- 异常处理原则和机制
- 异常与过滤器的关系
- 如何定义新的异常
- 如何根据环境输出异常信息

**更多文档**：查看 [docs 目录](./docs/)

---

## 📚 目录

- [快速开始（培训）](#-快速开始)
- [重要说明](#-重要说明)
- [概述](#-概述)
- [安装](#-安装)
- [使用入门](#-使用入门)
- [核心概念](#-核心概念)
- [预定义异常类](#-预定义异常类)
- [配置选项](#️-配置选项)
- [高级功能](#-高级功能)
- [异常过滤器](#-异常过滤器)
- [API 文档](#-api-文档)
- [与其他模块集成](#-与其他模块集成)
- [常见问题](#-常见问题)
- [最佳实践](#-最佳实践)
- [模块架构](#️-模块架构)
- [完整示例](#-完整示例)
- [性能考虑](#-性能考虑)
- [安全考虑](#-安全考虑)
- [依赖关系](#-依赖关系)
- [相关链接](#-相关链接)

---

## 📋 概述

`@hl8/exceptions` 是一个企业级的 NestJS 异常处理库，提供：

- ✅ **RFC7807 标准**: 符合 [RFC7807 Problem Details](https://tools.ietf.org/html/rfc7807) 标准的错误响应
- ✅ **丰富的异常类**: 预定义的标准异常类和业务异常类
- ✅ **全局过滤器**: 自动捕获和转换所有异常
- ✅ **消息定制**: 支持自定义错误消息提供器
- ✅ **完整日志**: 集成日志服务，记录异常详情
- ✅ **类型安全**: 完整的 TypeScript 类型定义

## 📦 安装

```bash
pnpm add @hl8/exceptions
```

## 🚀 使用入门

### 1. 导入模块

```typescript
import { Module } from "@nestjs/common";
import { ExceptionModule } from "@hl8/exceptions";

@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
    }),
  ],
})
export class AppModule {}
```

### 2. 使用异常类

```typescript
import {
  GeneralNotFoundException,
  GeneralBadRequestException,
} from "@hl8/exceptions";

@Injectable()
export class UserService {
  async findById(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new GeneralNotFoundException(
        "用户未找到",
        `ID 为 "${userId}" 的用户不存在`,
        { userId },
      );
    }

    return user;
  }
}
```

## 📚 核心概念

### 异常基类

所有自定义异常都继承自 `AbstractHttpException`：

```typescript
import { AbstractHttpException } from "@hl8/exceptions";

export class CustomException extends AbstractHttpException {
  constructor(message: string) {
    super(
      "CUSTOM_ERROR", // 错误代码
      "自定义错误", // 简短标题
      message, // 详细说明
      400, // HTTP 状态码
      { timestamp: Date.now() }, // 附加数据（可选）
    );
  }
}
```

### RFC7807 响应格式

所有异常自动转换为 RFC7807 格式：

```json
{
  "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
  "title": "用户未找到",
  "detail": "ID 为 \"user-123\" 的用户不存在",
  "status": 404,
  "errorCode": "USER_NOT_FOUND",
  "instance": "req-abc-123",
  "data": {
    "userId": "user-123"
  }
}
```

## 🎯 预定义异常类

### 标准 HTTP 异常

#### GeneralBadRequestException (400)

```typescript
throw new GeneralBadRequestException(
  "邮箱格式错误",
  `邮箱地址 "${email}" 格式不正确`,
  { email, expectedFormat: "user@example.com" },
);
```

#### GeneralNotFoundException (404)

```typescript
throw new GeneralNotFoundException(
  "用户未找到",
  `ID 为 "${userId}" 的用户不存在`,
  { userId },
);
```

#### GeneralInternalServerException (500)

```typescript
try {
  await this.externalService.call();
} catch (error) {
  throw new GeneralInternalServerException(
    "外部服务调用失败",
    "调用支付服务时发生错误",
    { service: "payment" },
    error, // rootCause
  );
}
```

### 业务异常

#### InvalidIsolationContextException

```typescript
throw new InvalidIsolationContextException("隔离上下文无效");
```

#### TenantNotFoundException

```typescript
throw new TenantNotFoundException(tenantId);
```

#### UnauthorizedOrganizationException

```typescript
throw new UnauthorizedOrganizationException(orgId);
```

## ⚙️ 配置选项

### 配置选项说明

本模块使用 `ExceptionModuleOptions` interface 进行配置。

**可用选项**：

| 选项                    | 类型                       | 默认值   | 说明                     |
| ----------------------- | -------------------------- | -------- | ------------------------ |
| `enableLogging`         | `boolean`                  | `true`   | 是否启用日志记录         |
| `logger`                | `ILoggerService`           | -        | 自定义日志服务（可选）   |
| `messageProvider`       | `ExceptionMessageProvider` | -        | 自定义消息提供器（可选） |
| `isProduction`          | `boolean`                  | 自动检测 | 是否为生产环境           |
| `registerGlobalFilters` | `boolean`                  | `true`   | 是否注册全局过滤器       |

详见：`src/config/exception.config.ts`

---

### 方式1：同步配置（简单场景）

```typescript
import { ExceptionModule } from "@hl8/exceptions";

@Module({
  imports: [
    ExceptionModule.forRoot({
      // 是否启用日志记录
      enableLogging: true,

      // 自定义日志服务
      logger: customLoggerService,

      // 自定义消息提供器
      messageProvider: customMessageProvider,

      // 是否为生产环境
      isProduction: process.env.NODE_ENV === "production",

      // 是否注册全局过滤器
      registerGlobalFilters: true,
    }),
  ],
})
export class AppModule {}
```

---

### 方式2：异步配置（使用 @nestjs/config）

```typescript
import { ExceptionModule } from "@hl8/exceptions";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),

    ExceptionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        enableLogging: config.get("LOGGING_ENABLED", true),
        isProduction: config.get("NODE_ENV") === "production",
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

### 方式3：异步配置（使用 @hl8/config）推荐 ⭐

```typescript
import { TypedConfigModule, dotenvLoader } from "@hl8/config";
import { ExceptionModule } from "@hl8/exceptions";
import { AppConfig } from "./config/app.config.js";

@Module({
  imports: [
    // 1. 加载应用配置
    TypedConfigModule.forRoot({
      schema: AppConfig,
      isGlobal: true,
      load: [dotenvLoader()],
    }),

    // 2. 从应用配置获取值配置异常模块
    ExceptionModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        enableLogging: config.logging.enabled,
        isProduction: config.isProduction,
        // 可以根据应用配置动态决定模块行为
      }),
    }),
  ],
})
export class AppModule {}
```

**优势**：

- ✅ 类型安全的配置
- ✅ 从 .env 文件读取
- ✅ 配置验证和转换
- ✅ 统一的配置管理

## 🔧 高级功能

### 自定义消息提供器

实现 `ExceptionMessageProvider` 接口：

```typescript
import { ExceptionMessageProvider } from "@hl8/exceptions";

@Injectable()
export class I18nMessageProvider implements ExceptionMessageProvider {
  constructor(private i18n: I18nService) {}

  getMessage(
    errorCode: string,
    field: "title" | "detail",
    data?: any,
  ): string | undefined {
    return this.i18n.t(`errors.${errorCode}.${field}`, data);
  }

  hasMessage(errorCode: string): boolean {
    return this.i18n.exists(`errors.${errorCode}`);
  }
}
```

### 自定义日志服务

实现 `ILoggerService` 接口：

```typescript
export interface ILoggerService {
  log(message: string, context?: any): void;
  error(message: string, trace?: string, context?: any): void;
  warn(message: string, context?: any): void;
}
```

## 📊 异常过滤器

### HttpExceptionFilter

自动捕获所有 `AbstractHttpException` 的异常：

- ✅ 转换为 RFC7807 格式
- ✅ 填充 `instance` 字段（请求 ID）
- ✅ 记录日志（4xx 为 warn，5xx 为 error）
- ✅ 支持自定义消息

### AnyExceptionFilter

捕获所有未处理的异常：

- ✅ 将任何异常转换为 500 错误
- ✅ 生产环境自动脱敏
- ✅ 开发环境包含详细堆栈
- ✅ 记录完整错误信息

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成覆盖率报告
pnpm test:cov
```

## 📖 API 文档

### 核心类

- **AbstractHttpException**: 抽象基类
- **ProblemDetails**: RFC7807 响应接口

### 标准异常类

- **GeneralBadRequestException**: 400 错误
- **GeneralNotFoundException**: 404 错误
- **GeneralInternalServerException**: 500 错误

### 业务异常类

- **InvalidIsolationContextException**: 无效隔离上下文
- **TenantNotFoundException**: 租户未找到
- **UnauthorizedOrganizationException**: 未授权的组织

### 过滤器

- **HttpExceptionFilter**: HTTP 异常过滤器
- **AnyExceptionFilter**: 通用异常过滤器

### 消息提供器

- **ExceptionMessageProvider**: 消息提供器接口
- **DefaultMessageProvider**: 默认消息提供器

### 配置

- **ExceptionModuleOptions**: 模块配置选项
- **ExceptionModuleAsyncOptions**: 异步配置选项

## 🔗 与其他模块集成

### 与 @hl8/nestjs-fastify 集成

Fastify 应用应使用专门的 Fastify 异常处理模块：

```typescript
import { FastifyExceptionModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    // 使用 Fastify 专用的异常模块
    FastifyExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === 'production',
    }),
  ],
})
```

详见：`libs/nestjs-fastify/src/exceptions/`

### 与日志模块集成

```typescript
import { ExceptionModule } from '@hl8/exceptions';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    FastifyLoggingModule.forRoot({ ... }),

    ExceptionModule.forRootAsync({
      inject: [FastifyLoggerService],
      useFactory: (logger: FastifyLoggerService) => ({
        enableLogging: true,
        logger: logger,  // 使用统一的日志服务
      }),
    }),
  ],
})
```

---

## ❓ 常见问题

### Q1: 为什么不使用 @hl8/config 的 TypedConfigModule？

**A**: 本模块使用**模块选项**（Module Options），不是应用配置。

- 模块选项：配置模块如何工作（interface，forRoot）
- 应用配置：应用运行时数据（class，TypedConfigModule）

详见：[模块选项 vs 应用配置](../../docs/guides/config/MODULE_OPTIONS_VS_APP_CONFIG.md)

### Q2: 如何与 AppConfig 集成？

**A**: 使用 forRootAsync 从 AppConfig 获取值：

```typescript
ExceptionModule.forRootAsync({
  inject: [AppConfig],
  useFactory: (config: AppConfig) => ({
    enableLogging: config.logging.enabled,
    isProduction: config.isProduction,
  }),
});
```

### Q3: 生产环境和开发环境有什么区别？

**A**: 主要区别：

| 特性     | 开发环境                     | 生产环境           |
| -------- | ---------------------------- | ------------------ |
| 错误详情 | ✅ 完整堆栈                  | ❌ 隐藏敏感信息    |
| 日志级别 | `warn` (4xx) + `error` (5xx) | `error` (5xx only) |
| 调试信息 | ✅ 包含                      | ❌ 不包含          |

### Q4: 如何创建自定义异常？

**A**: 继承 `AbstractHttpException`：

```typescript
export class ProductOutOfStockException extends AbstractHttpException {
  constructor(productId: string, requested: number, available: number) {
    super(
      "PRODUCT_OUT_OF_STOCK",
      "商品库存不足",
      `商品 ${productId} 库存不足，请求 ${requested}，可用 ${available}`,
      400,
      { productId, requested, available },
    );
  }
}
```

### Q5: 异常过滤器的执行顺序是什么？

**A**:

1. `HttpExceptionFilter` - 捕获 AbstractHttpException
2. `AnyExceptionFilter` - 捕获所有其他异常

两个过滤器都会自动注册（如果 `registerGlobalFilters: true`）。

### Q6: 如何禁用某个异常的日志记录？

**A**: 目前日志记录是全局控制的。如果需要细粒度控制，可以：

1. 实现自定义 logger，在其中过滤
2. 或设置 `enableLogging: false` 并手动记录重要异常

---

## 🎨 最佳实践

### 1. 使用明确的错误代码

```typescript
// 好
export class OrderNotFoundException extends AbstractHttpException {
  constructor(orderId: string) {
    super("ORDER_NOT_FOUND", "订单未找到", `订单 ${orderId} 不存在`, 404, {
      orderId,
    });
  }
}

// 不好
throw new Error("Not found");
```

### 2. 提供有用的上下文数据

```typescript
// 好
throw new GeneralBadRequestException(
  "库存不足",
  `请求数量 ${quantity} 超过可用库存 ${stock}`,
  { requestedQuantity: quantity, availableStock: stock },
);

// 不好
throw new GeneralBadRequestException("库存不足", "库存不足");
```

### 3. 链式追踪错误

```typescript
try {
  await this.externalService.call();
} catch (error) {
  throw new GeneralInternalServerException(
    "服务调用失败",
    "调用外部服务时发生错误",
    { service: "external" },
    error, // 保留原始错误作为 rootCause
  );
}
```

### 4. 避免在响应中暴露敏感信息

```typescript
// 好
throw new GeneralInternalServerException(
  "数据库操作失败",
  "保存用户数据时发生错误",
  { operation: "saveUser" },
);

// 不好（暴露了数据库信息）
throw new GeneralInternalServerException(
  "数据库错误",
  `Connection to postgres://admin:password@localhost:5432/db failed`,
);
```

---

## 🏗️ 模块架构

### 目录结构

```
libs/exceptions/
├── src/
│   ├── config/
│   │   ├── exception.config.ts       # 模块选项定义
│   │   └── index.ts
│   ├── core/
│   │   ├── abstract-http.exception.ts          # 异常基类
│   │   ├── general-bad-request.exception.ts    # 400 异常
│   │   ├── general-not-found.exception.ts      # 404 异常
│   │   ├── general-internal-server.exception.ts # 500 异常
│   │   ├── invalid-isolation-context.exception.ts
│   │   ├── tenant-not-found.exception.ts
│   │   ├── unauthorized-organization.exception.ts
│   │   └── index.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts   # HTTP 异常过滤器
│   │   ├── any-exception.filter.ts    # 通用异常过滤器
│   │   └── index.ts
│   ├── providers/
│   │   ├── exception-message.provider.ts     # 消息提供器接口
│   │   ├── default-message.provider.ts       # 默认实现
│   │   └── index.ts
│   ├── exception.module.ts            # 模块定义
│   └── index.ts                       # 导出
├── README.md                          # 本文档
└── package.json
```

### 设计原则

1. **RFC7807 标准** - 统一的错误响应格式
2. **全局异常捕获** - 不遗漏任何异常
3. **可扩展性** - 支持自定义异常和消息
4. **类型安全** - 完整的 TypeScript 支持
5. **最小侵入** - 只需导入模块即可

---

## 💻 完整示例

### 在 Fastify 应用中使用

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { TypedConfigModule, dotenvLoader } from "@hl8/config";
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
} from "@hl8/nestjs-fastify/index.js";
import { AppConfig } from "./config/app.config.js";

@Module({
  imports: [
    // 1. 配置模块
    TypedConfigModule.forRoot({
      schema: AppConfig,
      isGlobal: true,
      load: [dotenvLoader()],
    }),

    // 2. 日志模块
    FastifyLoggingModule.forRoot({
      config: {
        level: process.env.LOG_LEVEL || "info",
        prettyPrint: process.env.NODE_ENV === "development",
      },
    }),

    // 3. 异常模块（Fastify 专用）
    FastifyExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === "production",
    }),
  ],
})
export class AppModule {}
```

### 在服务中使用异常

```typescript
// user.service.ts
import { Injectable } from "@nestjs/common";
import {
  GeneralNotFoundException,
  GeneralBadRequestException,
  GeneralInternalServerException,
} from "@hl8/exceptions";

@Injectable()
export class UserService {
  // 示例1：资源未找到
  async findById(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new GeneralNotFoundException(
        "用户未找到",
        `ID 为 "${id}" 的用户不存在`,
        { userId: id },
      );
    }

    return user;
  }

  // 示例2：参数验证失败
  async updateEmail(id: string, email: string) {
    if (!this.isValidEmail(email)) {
      throw new GeneralBadRequestException(
        "邮箱格式错误",
        `邮箱地址 "${email}" 格式不正确`,
        { email, expectedFormat: "user@example.com" },
      );
    }

    return this.userRepo.updateEmail(id, email);
  }

  // 示例3：外部服务调用失败
  async sendWelcomeEmail(userId: string) {
    try {
      await this.emailService.send(userId);
    } catch (error) {
      throw new GeneralInternalServerException(
        "发送邮件失败",
        "调用邮件服务时发生错误",
        { userId, service: "email" },
        error, // rootCause
      );
    }
  }
}
```

### 在控制器中使用

```typescript
// user.controller.ts
import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service.js";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUser(@Param("id") id: string) {
    // 异常会被全局过滤器自动捕获和转换
    return this.userService.findById(id);
  }
}

// 请求 GET /users/invalid-id
// 自动返回 RFC7807 格式：
// {
//   "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
//   "title": "用户未找到",
//   "detail": "ID 为 \"invalid-id\" 的用户不存在",
//   "status": 404,
//   "errorCode": "USER_NOT_FOUND",
//   "data": { "userId": "invalid-id" }
// }
```

---

## 📈 性能考虑

### 异常创建的开销

- ✅ 异常对象创建很轻量
- ✅ 堆栈跟踪仅在必要时生成
- ✅ 消息提供器支持懒加载

### 生产环境优化

```typescript
ExceptionModule.forRoot({
  isProduction: true,
  enableLogging: true, // 保留日志，但减少详情
});
```

在生产环境：

- 自动隐藏敏感堆栈信息
- 简化错误响应
- 优化日志输出

---

## 🔐 安全考虑

### 1. 不暴露敏感信息

```typescript
// ✅ 好的做法
throw new GeneralInternalServerException(
  "数据库操作失败",
  "保存数据时发生错误",
  { operation: "save" },
);

// ❌ 避免暴露
throw new GeneralInternalServerException(
  "数据库错误",
  `Error: Connection failed to postgres://user:pass@host:5432/db`,
);
```

### 2. 生产环境自动脱敏

```typescript
// isProduction: true 时
// 自动隐藏堆栈跟踪
// 自动简化错误详情
```

### 3. 日志记录敏感数据

```typescript
// 实现自定义 logger，过滤敏感字段
export class SafeLogger implements ILoggerService {
  error(message: string, trace?: string, context?: any) {
    // 过滤 context 中的敏感字段
    const safeContext = this.removeSensitiveData(context);
    this.logger.error(message, safeContext);
  }
}
```

---

## 📦 依赖关系

### 依赖的模块

```json
{
  "peerDependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0"
  }
}
```

### 可选集成

- `@hl8/config` - 类型安全的配置管理
- `@hl8/nestjs-fastify` - Fastify 专用增强
- `@hl8/nestjs-isolation` - 多租户隔离

**无强制依赖**，可以独立使用！

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

### 文档

- [配置管理指南](../../docs/guides/config/CONFIGURATION_GUIDE.md)
- [模块选项 vs 应用配置](../../docs/guides/config/MODULE_OPTIONS_VS_APP_CONFIG.md)

### 标准和规范

- [RFC7807 Problem Details](https://tools.ietf.org/html/rfc7807)
- [NestJS 异常过滤器](https://docs.nestjs.com/exception-filters)

### 项目

- [HL8 SAAS 平台](https://github.com/aiofc-nx/hl8-saas-platform-turborepo)
- [GitHub 仓库](https://github.com/aiofc-nx/hl8-saas-platform-turborepo/tree/main/libs/exceptions)
