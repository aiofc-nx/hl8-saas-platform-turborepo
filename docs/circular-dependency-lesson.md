# 循环依赖教训 - 异常类位置决策

**日期**: 2025-10-12  
**问题**: 尝试将 HTTP 异常类移到 `@hl8/nestjs-fastify` 导致循环依赖  
**决策**: ✅ **回退，保持异常类在 `@hl8/nestjs-infra`**

---

## 🚨 问题发现

### 初始想法

> 所有的 HTTP 异常都应该集中到 libs/nestjs-fastify 模块来统一处理，因为我们的 HTTP 异常都发生在 Fastify

**看起来合理**：

- ✅ SAAS 平台不考虑 Express
- ✅ 所有 HTTP 异常确实在 Fastify 应用中抛出
- ✅ 集中管理更简洁

### 尝试的迁移

```bash
git mv libs/nestjs-infra/src/exceptions/core/*.exception.ts \
       libs/nestjs-fastify/src/exceptions/core/
```

### 发现的问题 ❌

**循环依赖**：

```
@hl8/nestjs-fastify
  ↓ depends on
@hl8/nestjs-infra (CacheService, RedisService, ConfigValidator)
  ↓ throws
GeneralInternalServerException (现在在 @hl8/nestjs-fastify)
  ↓ depends on
@hl8/nestjs-fastify  ← ❌ 循环依赖！
```

**具体示例**：

```typescript
// @hl8/nestjs-infra/cache.service.ts
import { GeneralInternalServerException } from '@hl8/nestjs-fastify';  // ❌ 上层包！

export class CacheService {
  async get(key: string) {
    try {
      // ...
    } catch (error) {
      throw new GeneralInternalServerException('缓存读取失败');  // ❌ 依赖上层
    }
  }
}
```

**影响的文件**：

- `cache.service.ts` - 抛出 `GeneralInternalServerException`
- `redis.service.ts` - 抛出 `GeneralInternalServerException`
- `file.loader.ts` - 抛出 `GeneralBadRequestException`
- `remote.loader.ts` - 抛出 `GeneralInternalServerException`
- `config.validator.ts` - 抛出 `GeneralBadRequestException`
- `isolation.guard.ts` - 抛出 `InvalidIsolationContextException`

---

## 💡 根本原因分析

### 异常类的本质

**错误理解**：
> HTTP 异常发生在 Fastify，所以应该在 @hl8/nestjs-fastify

**正确理解**：
> HTTP 异常类是**框架无关的业务抽象**，只有异常**过滤器**是框架相关的

### 分层原则

```
业务抽象（异常类）
    ↓ 定义在
  下层（通用）
    ↑ 使用
  上层（专用）
    ↓ 实现
框架适配（过滤器）
```

**正确的分层**：

```
@hl8/nestjs-infra (下层)
├── AbstractHttpException        ← 业务抽象（RFC7807）
├── GeneralNotFoundException     ← 业务异常类
└── CacheService                 ← 使用业务异常
    ↑ 被依赖
@hl8/nestjs-fastify (上层)
├── FastifyHttpExceptionFilter   ← 框架适配
└── FastifyAnyExceptionFilter
```

---

## 🎯 正确的架构

### 异常类（@hl8/nestjs-infra）

**为什么在下层？**

1. **被底层服务使用**
   - `CacheService` 需要抛出异常
   - `RedisService` 需要抛出异常
   - `ConfigValidator` 需要抛出异常
   - 这些都是基础服务，在 `@hl8/nestjs-infra`

2. **框架无关的抽象**
   - `AbstractHttpException` 实现 RFC7807 标准
   - 通用异常类（404/400/500）是业务概念
   - 不包含任何 Fastify 特定逻辑

3. **可复用性**
   - Express 应用也能用（如果将来有）
   - 非 HTTP 场景也可以扩展
   - 符合开放封闭原则

### 异常过滤器（@hl8/nestjs-fastify）

**为什么在上层？**

1. **Fastify 特定 API**
   - 使用 `.code()` 而不是 `.status()`
   - 使用 `FastifyRequest/FastifyReply` 类型
   - Fastify 特定的运行时类型检查

2. **HTTP 协议适配**
   - 将异常转换为 HTTP 响应
   - 这是框架层的职责

3. **只依赖，不被依赖**
   - 上层模块，可以依赖下层
   - 不会被基础服务依赖

---

## 📚 架构原则回顾

### 1. 依赖倒置原则 (DIP)

```
高层模块不应依赖低层模块，两者都应依赖抽象
```

**应用**：

- ✅ `CacheService`（低层）抛出 `AbstractHttpException`（抽象）
- ✅ `FastifyHttpExceptionFilter`（高层）捕获 `AbstractHttpException`
- ❌ `CacheService` 不能依赖 `FastifyHttpExceptionFilter`

### 2. 单向依赖原则

```
依赖方向：应用层 → 框架层 → 业务层 → 核心层
```

**违反示例（循环依赖）**：

```
框架层 (nestjs-fastify) → 业务层 (nestjs-infra)
    ↑___________________________________|
                ❌ 循环
```

### 3. 抽象稳定性原则

```
稳定的抽象应该在下层
不稳定的实现应该在上层
```

**应用**：

- ✅ `AbstractHttpException`（稳定抽象）在 `@hl8/nestjs-infra`
- ✅ `FastifyHttpExceptionFilter`（Fastify 实现）在 `@hl8/nestjs-fastify`

---

## 🔄 回退决策

### 执行的回退

```bash
git reset --hard HEAD
```

**回退的内容**：

- ❌ 异常类移动到 `@hl8/nestjs-fastify`
- ❌ 删除 `@hl8/nestjs-infra` 中的过滤器

**保持的内容**：

- ✅ 异常类在 `@hl8/nestjs-infra`
- ✅ Fastify 过滤器在 `@hl8/nestjs-fastify`
- ✅ 清晰的分层架构

---

## ✅ 最终架构（正确）

### @hl8/nestjs-infra (NestJS 通用层)

```
src/exceptions/
├── core/                           ← HTTP 异常类（业务抽象）
│   ├── abstract-http.exception.ts
│   ├── general-not-found.exception.ts
│   ├── general-bad-request.exception.ts
│   └── general-internal-server.exception.ts
├── filters/                        ← Express 通用过滤器
│   ├── http-exception.filter.ts
│   └── any-exception.filter.ts
├── providers/                      ← 异常消息提供者
└── config/                         ← 异常配置
```

**职责**：

- 提供 HTTP 异常的业务抽象
- 供所有 NestJS 应用使用（Express/Fastify）
- 被基础服务依赖（CacheService, ConfigValidator）

### @hl8/nestjs-fastify (Fastify 专用层)

```
src/exceptions/
└── filters/                        ← Fastify 专用过滤器
    ├── fastify-http-exception.filter.ts
    └── fastify-any-exception.filter.ts
```

**职责**：

- 提供 Fastify 专用的异常处理
- 使用 Fastify API（`.code()`）
- 捕获并转换 `@hl8/nestjs-infra` 中的异常

---

## 🎓 经验教训

### 1. 先考虑依赖方向 ⚠️

在移动代码之前，先画出依赖图：

```
谁会使用这个模块？
它会依赖谁？
会不会形成循环？
```

### 2. 区分抽象和实现 🎯

**抽象（稳定，下层）**：

- 异常类（业务概念）
- 接口定义
- 业务规则

**实现（不稳定，上层）**：

- 异常过滤器（框架适配）
- 具体服务
- 技术细节

### 3. 实用主义不能违反原则 ❌

即使"不考虑 Express"：

- ✅ 仍要遵循依赖方向
- ✅ 仍要避免循环依赖
- ✅ 仍要清晰的分层

### 4. "发生在哪里" ≠ "定义在哪里" 💡

```
HTTP 异常发生在 Fastify 应用        ← 运行时位置
HTTP 异常类定义在 nestjs-infra      ← 代码位置

这两个是不同的概念！
```

---

## 📊 对比总结

| 方案 | 异常类位置 | 过滤器位置 | 依赖关系 | 结果 |
|------|-----------|-----------|----------|------|
| **方案 A** | nestjs-infra | nestjs-fastify | infra ← fastify | ✅ 单向 |
| **方案 B** | nestjs-fastify | nestjs-fastify | infra ↔ fastify | ❌ 循环 |

**结论**: 方案 A 是唯一正确的选择

---

## 🏆 最终决策

### 架构定位

**@hl8/nestjs-infra**:

- 定位：NestJS 通用基础设施
- 包含：异常类、缓存、隔离、配置、日志
- 可用于：任何 NestJS 应用

**@hl8/nestjs-fastify**:

- 定位：Fastify 专用优化
- 包含：Fastify 适配器、过滤器、日志服务
- 依赖：`@hl8/nestjs-infra`

### 使用方式

```typescript
// 业务代码
import { GeneralNotFoundException } from '@hl8/nestjs-infra';  // ✅ 异常类
throw new GeneralNotFoundException('USER_NOT_FOUND', '用户未找到');

// 应用配置
import { FastifyExceptionModule } from '@hl8/nestjs-fastify';  // ✅ 过滤器
@Module({
  imports: [FastifyExceptionModule.forRoot()],
})
```

---

## 💭 反思

**原始动机是好的**：

- 简化依赖
- 集中管理
- 实用主义

**但忽略了**：

- ❌ 依赖方向原则
- ❌ 分层架构原则
- ❌ 循环依赖禁忌

**收获**：

- ✅ 理解了"抽象在下层，实现在上层"
- ✅ 理解了"发生位置 ≠ 定义位置"
- ✅ 架构原则不能为实用主义妥协

---

**🎓 重要结论**:

即使明确"只用 Fastify"，也不能将异常类移到 `@hl8/nestjs-fastify`，因为：

1. **异常类是业务抽象**，不是 Fastify 特定逻辑
2. **基础服务需要抛出异常**，它们在下层
3. **循环依赖是架构大忌**，无论如何都要避免

**✅ 正确架构**:

- 异常类（抽象）→ `@hl8/nestjs-infra`
- 异常过滤器（实现）→ `@hl8/nestjs-fastify`
