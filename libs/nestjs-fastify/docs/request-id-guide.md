# 请求 ID 配置和使用指南

## 概述

本指南详细介绍了 `@hl8/nestjs-fastify` 模块中请求 ID 功能的配置、使用方法和最佳实践。请求 ID 是分布式系统中用于追踪请求的重要工具，能够帮助您实现端到端的请求追踪和问题诊断。

## 功能特性

### 🎯 核心功能

- **多种生成策略**: 支持 UUID、ULID、时间戳、带前缀等多种 ID 格式
- **自动管理**: 优先使用请求头中的 ID，缺失时自动生成
- **响应头注入**: 自动在响应头中添加请求 ID
- **日志集成**: 自动在日志中包含请求 ID，便于追踪
- **高性能**: 使用原生 `crypto` 模块，支持高并发场景

### 🚀 技术优势

- **零配置**: 默认启用，开箱即用
- **完全可控**: 支持自定义配置和手动生成
- **跨服务追踪**: 支持分布式系统中的请求追踪
- **格式验证**: 内置 ID 格式验证功能

## 快速开始

### 基本使用

```typescript
import { NestFactory } from "@nestjs/core";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { EnterpriseFastifyAdapter } from "@hl8/nestjs-fastify/index.js";
import { AppModule } from "./app.module";

async function bootstrap() {
  // 使用默认配置，自动启用请求 ID
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new EnterpriseFastifyAdapter(),
  );

  await app.listen(3000);
}
bootstrap();
```

### 自定义配置

```typescript
import { NestFactory } from "@nestjs/core";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import {
  EnterpriseFastifyAdapter,
  RequestIdStrategy,
} from "@hl8/nestjs-fastify/index.js";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new EnterpriseFastifyAdapter({
      // 启用请求 ID 功能
      enableRequestId: true,
      // 自定义请求 ID 配置
      requestIdOptions: {
        strategy: RequestIdStrategy.ULID,
        headerName: "X-Request-Id",
        generateOnMissing: true,
        includeInResponse: true,
        includeInLogs: true,
        prefix: "api",
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

## 配置选项

### EnterpriseFastifyAdapterOptions

| 选项               | 类型               | 默认值 | 描述                 |
| ------------------ | ------------------ | ------ | -------------------- |
| `enableRequestId`  | `boolean`          | `true` | 是否启用请求 ID 功能 |
| `requestIdOptions` | `RequestIdOptions` | 见下表 | 请求 ID 详细配置     |

### RequestIdOptions

| 选项                | 类型                | 默认值                   | 描述               |
| ------------------- | ------------------- | ------------------------ | ------------------ |
| `strategy`          | `RequestIdStrategy` | `RequestIdStrategy.UUID` | 生成策略           |
| `headerName`        | `string`            | `'X-Request-Id'`         | 请求头名称         |
| `generateOnMissing` | `boolean`           | `true`                   | 缺失时是否自动生成 |
| `includeInResponse` | `boolean`           | `true`                   | 是否在响应头中包含 |
| `includeInLogs`     | `boolean`           | `true`                   | 是否在日志中包含   |
| `prefix`            | `string`            | `''`                     | 自定义前缀         |

### RequestIdStrategy 枚举

```typescript
enum RequestIdStrategy {
  /** UUID v4 格式 */
  UUID = "uuid",
  /** ULID 格式 */
  ULID = "ulid",
  /** 时间戳 + 随机数 */
  TIMESTAMP = "timestamp",
  /** 自定义前缀 + UUID */
  PREFIXED = "prefixed",
}
```

## 生成策略详解

### 1. UUID 策略（默认）

```typescript
// 配置
requestIdOptions: {
  strategy: RequestIdStrategy.UUID;
}

// 生成示例
// 550e8400-e29b-41d4-a716-446655440000
```

**特点**:

- 标准 UUID v4 格式
- 全局唯一性保证
- 兼容性好，广泛支持

### 2. ULID 策略

```typescript
// 配置
requestIdOptions: {
  strategy: RequestIdStrategy.ULID;
}

// 生成示例
// 01ARZ3NDEKTSV4RRFFQ69G5FAV
```

**特点**:

- 时间排序的 ID
- 性能更好
- 可读性更强
- 支持时间范围查询

### 3. 时间戳策略

```typescript
// 配置
requestIdOptions: {
  strategy: RequestIdStrategy.TIMESTAMP,
  randomLength: 8
}

// 生成示例
// l8x2k9j3-4f7a8b2c
```

**特点**:

- 基于时间戳
- 包含时间信息
- 可配置随机数长度

### 4. 带前缀策略

```typescript
// 配置
requestIdOptions: {
  strategy: RequestIdStrategy.PREFIXED,
  prefix: 'api'
}

// 生成示例
// api-550e8400-e29b-41d4-a716-446655440000
```

**特点**:

- 支持业务前缀
- 便于分类管理
- 增强可读性

## 高级用法

### 手动生成请求 ID

```typescript
import {
  RequestIdGenerator,
  RequestIdStrategy,
} from "@hl8/nestjs-fastify/index.js";

// 快速生成（使用默认配置）
const requestId = RequestIdGenerator.quick();

// 生成 ULID
const ulid = RequestIdGenerator.ulid();

// 生成带前缀的 ID
const prefixedId = RequestIdGenerator.withPrefix("user");

// 自定义配置生成
const customId = RequestIdGenerator.generate({
  strategy: RequestIdStrategy.TIMESTAMP,
  prefix: "order",
  includeTimestamp: true,
});
```

### 验证请求 ID

```typescript
import { RequestIdGenerator } from "@hl8/nestjs-fastify/index.js";

// 验证 ID 格式
const isValid = RequestIdGenerator.isValid(
  "550e8400-e29b-41d4-a716-446655440000",
);

// 从请求头中提取和验证
const requestId = RequestIdGenerator.extractFromHeaders({
  "x-request-id": "550e8400-e29b-41d4-a716-446655440000",
});
```

### 在服务中使用

```typescript
import { Injectable } from "@nestjs/common";
import { FastifyRequest } from "fastify";

@Injectable()
export class UserService {
  async getUser(request: FastifyRequest, userId: string) {
    // 获取请求 ID
    const requestId = request.requestId;

    // 在日志中使用请求 ID
    console.log(`[${requestId}] 获取用户信息: ${userId}`);

    // 业务逻辑...
    return { id: userId, name: "John Doe" };
  }
}
```

## 日志集成

### 自动日志集成

当启用 `includeInLogs: true` 时，请求 ID 会自动包含在日志中：

```json
{
  "level": 30,
  "time": 1640995200000,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "msg": "用户登录成功",
  "userId": "12345"
}
```

### 手动日志集成

```typescript
import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify/index.js";

@Injectable()
export class OrderService {
  constructor(private readonly logger: FastifyLoggerService) {}

  async createOrder(requestId: string, orderData: any) {
    this.logger.info("创建订单", {
      requestId,
      orderId: orderData.id,
      amount: orderData.amount,
    });
  }
}
```

## 跨服务追踪

### 发送请求时传递 ID

```typescript
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  async callExternalApi(requestId: string, data: any) {
    const response = await this.httpService.post(
      "https://api.example.com/endpoint",
      data,
      {
        headers: {
          "X-Request-Id": requestId,
        },
      },
    );

    return response.data;
  }
}
```

### 接收请求时提取 ID

```typescript
import { Controller, Get, Req } from "@nestjs/common";
import { FastifyRequest } from "fastify";

@Controller("webhook")
export class WebhookController {
  @Get()
  async handleWebhook(@Req() request: FastifyRequest) {
    const requestId = request.requestId;

    // 使用请求 ID 进行日志记录
    console.log(`[${requestId}] 处理 Webhook 请求`);

    return { success: true };
  }
}
```

## 最佳实践

### 1. 生产环境配置

```typescript
// 生产环境推荐配置
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new EnterpriseFastifyAdapter({
    requestIdOptions: {
      strategy: RequestIdStrategy.ULID,
      headerName: "X-Request-Id",
      generateOnMissing: true,
      includeInResponse: true,
      includeInLogs: true,
    },
  }),
);
```

### 2. 开发环境配置

```typescript
// 开发环境推荐配置
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new EnterpriseFastifyAdapter({
    requestIdOptions: {
      strategy: RequestIdStrategy.PREFIXED,
      prefix: "dev",
      headerName: "X-Request-Id",
      generateOnMissing: true,
      includeInResponse: true,
      includeInLogs: true,
    },
  }),
);
```

### 3. 测试环境配置

```typescript
// 测试环境推荐配置
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new EnterpriseFastifyAdapter({
    requestIdOptions: {
      strategy: RequestIdStrategy.TIMESTAMP,
      prefix: "test",
      headerName: "X-Request-Id",
      generateOnMissing: true,
      includeInResponse: false, // 测试环境可能不需要响应头
      includeInLogs: true,
    },
  }),
);
```

## 故障排除

### 常见问题

#### 1. 请求 ID 未生成

**问题**: 请求头中没有 `X-Request-Id`

**解决方案**:

```typescript
// 确保启用了请求 ID 功能
new EnterpriseFastifyAdapter({
  enableRequestId: true, // 确保为 true
  requestIdOptions: {
    generateOnMissing: true, // 确保为 true
  },
});
```

#### 2. 日志中缺少请求 ID

**问题**: 日志中没有 `requestId` 字段

**解决方案**:

```typescript
// 确保启用了日志集成
requestIdOptions: {
  includeInLogs: true; // 确保为 true
}
```

#### 3. 响应头中缺少请求 ID

**问题**: 响应头中没有 `X-Request-Id`

**解决方案**:

```typescript
// 确保启用了响应头注入
requestIdOptions: {
  includeInResponse: true; // 确保为 true
}
```

### 调试技巧

#### 1. 验证配置

```typescript
// 在应用启动后验证配置
app
  .getHttpAdapter()
  .getInstance()
  .addHook("onRequest", (request, reply) => {
    console.log("Request ID:", request.requestId);
    console.log("Headers:", request.headers);
  });
```

#### 2. 检查日志格式

```typescript
// 检查日志是否包含请求 ID
app
  .getHttpAdapter()
  .getInstance()
  .addHook("onRequest", (request, reply) => {
    request.log.info("请求开始", { requestId: request.requestId });
  });
```

## 性能考虑

### 1. 生成性能

- **UUID**: 中等性能，兼容性最好
- **ULID**: 高性能，推荐用于生产环境
- **时间戳**: 最高性能，适合高并发场景
- **带前缀**: 性能与基础策略相同

### 2. 内存使用

- 所有策略都使用原生 `crypto` 模块
- 内存占用极小
- 支持高并发场景

### 3. 网络开销

- 请求 ID 通常只有 36 字节（UUID）
- 对网络性能影响微乎其微
- 建议在生产环境中启用

## 版本兼容性

| 版本      | 功能支持         |
| --------- | ---------------- |
| `>=0.1.0` | 基础请求 ID 功能 |
| `>=0.2.0` | 企业级适配器集成 |
| `>=1.0.0` | 完整功能支持     |

## 相关资源

- [Fastify 官方文档](https://www.fastify.io/)
- [Pino 日志库文档](https://getpino.io/)
- [ULID 规范](https://github.com/ulid/spec)
- [UUID 规范](https://tools.ietf.org/html/rfc4122)

## 总结

请求 ID 功能是分布式系统中不可或缺的工具，`@hl8/nestjs-fastify` 提供了完整、高性能、易用的请求 ID 解决方案。通过合理的配置和使用，您可以实现：

- ✅ 端到端的请求追踪
- ✅ 高效的日志分析
- ✅ 跨服务的请求关联
- ✅ 问题诊断和性能监控

选择合适的生成策略，配置正确的选项，您就能获得一个强大而灵活的请求追踪系统！
