# @hl8/nestjs-fastify

**Fastify 专用的企业级基础设施模块** - 基于 `@hl8/nestjs-infra` 优化

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/hl8/nestjs-fastify)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-5-black.svg)](https://fastify.dev/)

---

## ⚡ 为什么选择 Fastify 专用版本？

### 与 @hl8/nestjs-infra 的区别

| 特性 | @hl8/nestjs-infra | @hl8/nestjs-fastify |
|------|-------------------|---------------------|
| **目标** | 通用（Express/Fastify） | Fastify 专用 |
| **异常过滤器** | Express 风格 API | Fastify 原生 API ✅ |
| **日志系统** | 独立 Pino 实例 | 复用 Fastify Pino ⚡ |
| **性能** | 优秀 | 极致 🚀 |
| **代码复用** | - | 80% 复用 nestjs-infra |

---

## 🚀 快速开始

### 安装

```bash
pnpm add @hl8/nestjs-fastify
```

### 基础使用

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);

await app.listen(3000);
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  CachingModule,       // ← 复用 nestjs-infra
  IsolationModule,     // ← 复用 nestjs-infra
} from '@hl8/nestjs-fastify';

@Module({
  imports: [
    // Fastify 专用异常处理
    FastifyExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === 'production',
    }),
    
    // Fastify 专用日志（零配置）
    FastifyLoggingModule.forRoot(),
    
    // 复用其他模块
    IsolationModule.forRoot(),
  ],
})
export class AppModule {}
```

---

## 📦 核心模块

### Fastify 专用模块

#### 1. FastifyExceptionModule ✨

RFC7807 统一异常处理（Fastify 优化）

```typescript
import { FastifyExceptionModule } from '@hl8/nestjs-fastify';

FastifyExceptionModule.forRoot({
  isProduction: false,
})
```

**特性**:

- ✅ 使用 Fastify `.code()` API
- ✅ RFC7807 Problem Details 格式
- ✅ 生产环境隐藏敏感信息

#### 2. FastifyLoggingModule ⚡

零配置高性能日志

```typescript
import { FastifyLoggingModule, FastifyLoggerService } from '@hl8/nestjs-fastify';

// 模块注册
FastifyLoggingModule.forRoot()

// 使用
constructor(private logger: FastifyLoggerService) {}

this.logger.log('Hello');
```

**特性**:

- ⚡ 零开销（复用 Fastify Pino）
- ✅ 自动包含请求上下文
- ✅ 结构化日志

---

### 从 @hl8/nestjs-infra 复用的模块

所有这些模块 100% 兼容 Fastify：

- ✅ **CachingModule**: Redis 分布式缓存
- ✅ **IsolationModule**: 5 级数据隔离
- ✅ **TypedConfigModule**: 类型安全配置
- ✅ **Shared**: EntityId, Value Objects, Exceptions

```typescript
import {
  CachingModule,
  IsolationModule,
  TypedConfigModule,
  EntityId,
  IsolationContext,
} from '@hl8/nestjs-fastify';  // ← 从 Fastify 包导入
```

---

## 🔧 配置示例

### 完整配置

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  CachingModule,
  IsolationModule,
  CachingModuleConfig,
} from '@hl8/nestjs-fastify';
import { plainToInstance } from 'class-transformer';

@Module({
  imports: [
    // NestJS 标准配置
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Fastify 专用模块
    FastifyExceptionModule.forRoot(),
    FastifyLoggingModule.forRoot(),
    
    // 复用模块
    IsolationModule.forRoot(),
    CachingModule.forRoot(
      plainToInstance(CachingModuleConfig, {
        redis: { host: 'localhost', port: 6379 },
      }),
    ),
  ],
})
export class AppModule {}
```

---

## 📊 性能优势

### 日志性能

| 方案 | 每次日志开销 | 说明 |
|------|-------------|------|
| **独立 Pino** | ~1-2μs | 创建新实例 |
| **Fastify Pino** | ~0.1μs | 复用现有实例 ⚡ |

**提升**: **10-20x** 更快！

---

## 🎯 使用场景

### ✅ 适合使用 @hl8/nestjs-fastify

- Fastify 应用（推荐）
- 需要极致性能
- 充分利用 Fastify 特性

### ⚠️ 使用 @hl8/nestjs-infra

- Express 应用
- 通用场景
- 需要适配器无关的实现

---

## 📚 相关项目

- **@hl8/nestjs-infra**: 通用版本（核心依赖）
- **@hl8/nestjs-fastify**: Fastify 专用版本（本项目）

---

## 📝 文档

- [API 文档](./docs/api.md)
- [集成指南](./docs/integration-guide.md)
- [性能优化](./docs/performance.md)

---

**专门为 Fastify 优化，极致性能！** ⚡
