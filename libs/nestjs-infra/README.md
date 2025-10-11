# @hl8/nestjs-infra

> NestJS 基础设施模块 - 为 NestJS 应用提供企业级基础设施功能

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/hl8/nestjs-infra)
[![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org)

## 功能特性

- ✅ **统一异常处理** - RFC7807 标准错误响应
- ✅ **5层级数据隔离** - 平台/租户/组织/部门/用户
- ✅ **数据共享控制** - 灵活的共享策略（isShared + sharingLevel）
- ✅ **Redis 缓存** - 租户隔离 + 装饰器支持
- ✅ **企业级 Fastify** - 高性能 HTTP 服务
- ✅ **类型安全配置** - 多格式支持 + 运行时验证
- ✅ **结构化日志** - Pino 高性能日志

## 前提条件

- Node.js ≥ 20
- pnpm 10.11.0
- NestJS ≥ 11
- TypeScript 5.x

## 安装

```bash
pnpm add @hl8/nestjs-infra
```

## 快速开始

详细文档请参见：[Quick Start Guide](../../specs/001-hl8-nestjs-enhance/quickstart.md)

### 基础使用

```typescript
import { Module } from '@nestjs/common';
import {
  ExceptionModule,
  IsolationModule,
  CachingModule,
  LoggingModule,
} from '@hl8/nestjs-infra';

@Module({
  imports: [
    // 1. 异常处理（最优先）
    ExceptionModule.forRoot({
      documentationUrl: 'https://docs.hl8.com/errors',
      enableStackTrace: process.env.NODE_ENV !== 'production',
    }),

    // 2. 数据隔离
    IsolationModule.forRoot({
      global: true,
      enableMultiLevelIsolation: true,
    }),

    // 3. 缓存
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      enableTenantIsolation: true,
    }),

    // 4. 日志
    LoggingModule.forRoot({
      level: 'info',
      includeContext: true,
    }),
  ],
})
export class AppModule {}
```

## 文档

- [功能规范](../../specs/001-hl8-nestjs-enhance/spec.md)
- [快速开始](../../specs/001-hl8-nestjs-enhance/quickstart.md)
- [API 接口](../../specs/001-hl8-nestjs-enhance/contracts/)
- [技术研究](../../specs/001-hl8-nestjs-enhance/research.md)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 类型检查
pnpm run type-check

# 测试
pnpm run test

# 测试覆盖率
pnpm run test:cov
```

## 许可证

MIT

## 作者

HL8 Team
