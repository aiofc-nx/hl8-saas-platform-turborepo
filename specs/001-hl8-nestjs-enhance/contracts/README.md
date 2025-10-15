# Contracts: NestJS 基础设施模块

**Feature**: 001-hl8-nestjs-enhance  
**Package Name**: `@hl8/nestjs-infra`  
**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-11

## 概述

本目录定义 `@hl8/nestjs-infra` 包的公共接口契约。

**说明**：

- 基础设施库的 contracts 是 TypeScript 接口和类型定义，而非 REST API 或 GraphQL Schema
- 这些接口定义了模块的公共 API，确保类型安全和向后兼容性
- 所有公共接口都应该遵循 TypeScript 严格模式

## 接口文件列表

| 文件                       | 描述                     |
| -------------------------- | ------------------------ |
| caching-contracts.ts       | 缓存模块的公共接口       |
| configuration-contracts.ts | 配置模块的公共接口       |
| logging-contracts.ts       | 日志模块的公共接口       |
| multi-tenancy-contracts.ts | 多租户模块的公共接口     |
| fastify-contracts.ts       | Fastify 适配器的公共接口 |
| shared-contracts.ts        | 共享领域模型的公共接口   |

## 接口设计原则

1. **向后兼容**：接口变更必须向后兼容，breaking changes 需要主版本升级
2. **类型安全**：所有接口都应该是类型安全的，避免使用 `any`
3. **文档完整**：所有接口都应该有完整的 TSDoc 注释
4. **简洁明确**：接口定义应该简洁明确，避免过度设计
5. **可扩展性**：预留扩展点，通过可选属性或继承支持扩展

## 版本策略

遵循 Semantic Versioning：

- **补丁版本**（1.0.x）：bug 修复，不影响接口
- **次版本**（1.x.0）：新增功能，向后兼容
- **主版本**（x.0.0）：breaking changes，不向后兼容

## 使用示例

```typescript
import {
  CachingModule,
  type CachingModuleOptions,
  type ICacheService,
} from "@hl8/nestjs-infra";

// 使用类型安全的配置
const options: CachingModuleOptions = {
  redis: {
    host: "localhost",
    port: 6379,
  },
  defaultTTL: 3600,
};

// 导入模块
@Module({
  imports: [CachingModule.forRoot(options)],
})
export class AppModule {}

// 注入服务（类型安全）
@Injectable()
export class UserService {
  constructor(private readonly cacheService: ICacheService) {}
}
```

## 接口稳定性等级

| 等级             | 描述                     | 变更策略                                         |
| ---------------- | ------------------------ | ------------------------------------------------ |
| **Stable**       | 稳定接口，生产可用       | 严格遵循 SemVer，breaking changes 需要主版本升级 |
| **Beta**         | 测试接口，可能变更       | 次版本可以包含 breaking changes                  |
| **Experimental** | 实验性接口，随时可能移除 | 不保证向后兼容                                   |

当前所有接口均为 **Stable** 级别。
