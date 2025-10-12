# @hl8/isolation-model

纯领域模型库 - 多层级数据隔离（零依赖，框架无关）

## 特性

- ✅ 零依赖，可在任何 TypeScript 环境使用
- ✅ DDD 充血模型设计
- ✅ 5 层级数据隔离（平台、租户、组织、部门、用户）
- ✅ 封装隔离业务逻辑
- ✅ 完整的 TypeScript 类型支持

## 为什么零依赖？

本库被多个业务库引用（caching、logging、database 等），零依赖确保：

- 无依赖传递
- 可跨框架使用
- 包体积最小
- 易于测试

## 安装

```bash
pnpm add @hl8/isolation-model
```

## 使用

```typescript
import { IsolationContext, TenantId } from '@hl8/isolation-model';

const context = IsolationContext.tenant(TenantId.create('t123'));
const cacheKey = context.buildCacheKey('user', 'list');
// 返回: tenant:t123:user:list
```

## 文档

- [API 文档](../../specs/001-hl8-nestjs-enhance/contracts/isolation-api.md)
- [数据模型](../../specs/001-hl8-nestjs-enhance/isolation-data-model.md)
- [快速开始](../../specs/001-hl8-nestjs-enhance/isolation-quickstart.md)

## License

MIT
