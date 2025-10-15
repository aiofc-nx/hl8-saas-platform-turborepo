# 三层架构拆分计划

**日期**: 2025-10-11  
**目标**: 将 `@hl8/nestjs-infra` 拆分为三层清晰架构  
**策略**: 保留并优化现有代码，重新组织结构

---

## 🏗️ 新的三层架构

```
┌─────────────────────────────────────────┐
│  应用层 (apps/)                          │
│  - fastify-api                           │
│  - api                                   │
└──────────┬──────────────────────────────┘
           │ depends on
           ↓
┌─────────────────────────────────────────┐
│  框架适配层 (libs/)                      │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ nestjs-infra │  │nestjs-fastify│     │
│  │  (通用)      │  │ (Fastify专用)│     │
│  └──────┬───────┘  └──────┬───────┘     │
│         └──────────┬───────┘             │
└────────────────────┼─────────────────────┘
                     │ depends on
                     ↓
┌─────────────────────────────────────────┐
│  核心业务层 (libs/)                      │
│  @hl8/platform                           │
│  - shared/       (entities, VOs, enums)  │
│  - domain/       (domain services)       │
│  - types/        (type definitions)      │
│  ⚡ 无框架依赖，纯业务逻辑               │
└─────────────────────────────────────────┘
```

---

## 📦 层次说明

### 第一层：@hl8/platform（核心业务层）

**职责**: 纯业务逻辑，无框架依赖

**包含**:

- ✅ **shared/entities**: `IsolationContext`
- ✅ **shared/value-objects**: `EntityId`, `TenantId`, `OrganizationId`, `DepartmentId`, `UserId`
- ✅ **shared/enums**: `IsolationLevel`, `DataSharingLevel`
- ✅ **shared/types**: TypeScript 类型定义
- ✅ **domain/services**: 业务服务逻辑（如果有）
- ✅ **shared/exceptions**: 业务异常基类（`AbstractHttpException`）

**依赖**:

```json
{
  "dependencies": {
    // 无 NestJS 依赖！只有纯 TypeScript
  }
}
```

**特点**:

- ⚡ 无框架绑定
- ✅ 可在任何环境使用（Node.js, Browser, Deno）
- ✅ 高度可测试
- ✅ 易于复用

---

### 第二层A：@hl8/nestjs-infra（通用 NestJS 适配）

**职责**: 通用的 NestJS 模块（Express/Fastify 通用）

**包含**:

- ✅ **exceptions/**: 通用异常模块（需要兼容多适配器）
- ✅ **logging/**: 通用日志模块
- ✅ **caching/**: NestJS 缓存模块（Redis）
- ✅ **isolation/**: NestJS 隔离模块（nestjs-cls）
- ✅ **configuration/**: 类型安全配置模块

**依赖**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 依赖核心层
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "nestjs-cls": "^6.0.1",
    "ioredis": "^5.8.1"
  }
}
```

**特点**:

- ✅ 适配器无关设计
- ✅ 可用于 Express 或 Fastify
- ⚠️ 可能有兼容性问题（如异常过滤器）

---

### 第二层B：@hl8/nestjs-fastify（Fastify 专用）

**职责**: Fastify 专用的 NestJS 模块

**包含**:

- ✅ **exceptions/**: Fastify 专用异常过滤器（`.code()` API）
- ✅ **logging/**: Fastify Pino 原生集成（零开销）
- ✅ **fastify/**: EnterpriseFastifyAdapter
- ✅ **core/**: 重新导出通用模块（caching, isolation, config）

**依赖**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 核心业务逻辑
    "@hl8/nestjs-infra": "workspace:*", // ← 复用通用模块
    "@nestjs/platform-fastify": "^11.1.6",
    "fastify": "^5.6.1"
  }
}
```

**特点**:

- ⚡ 100% Fastify 优化
- ✅ 零配置高性能
- ✅ 复用 80% 代码（从 platform + nestjs-infra）

---

## 🔄 拆分步骤

### Step 1: 创建 @hl8/platform（核心层）

```bash
# 1. 创建目录
mkdir -p libs/platform/src/{shared,domain,types}
mkdir -p libs/platform/src/shared/{entities,value-objects,enums,exceptions}

# 2. 移动文件（从 nestjs-infra）
# shared/entities/
mv libs/nestjs-infra/src/shared/entities/* libs/platform/src/shared/entities/

# shared/value-objects/
mv libs/nestjs-infra/src/shared/value-objects/* libs/platform/src/shared/value-objects/

# shared/enums/
mv libs/nestjs-infra/src/shared/enums/* libs/platform/src/shared/enums/

# shared/types/
mv libs/nestjs-infra/src/shared/types/* libs/platform/src/shared/types/

# shared/exceptions/ (只移动业务异常基类)
mv libs/nestjs-infra/src/exceptions/core/abstract-http.exception.ts libs/platform/src/shared/exceptions/
mv libs/nestjs-infra/src/shared/exceptions/* libs/platform/src/shared/exceptions/
```

**移动的文件**（~15 个）:

- `IsolationContext` entity
- `EntityId`, `TenantId`, `OrganizationId`, `DepartmentId`, `UserId` VOs
- `IsolationLevel`, `DataSharingLevel` enums
- `AbstractHttpException` 基类
- `TenantNotFoundException`, `InvalidIsolationContextException`, etc.
- TypeScript 类型定义

---

### Step 2: 更新 @hl8/nestjs-infra（通用适配层）

**保留**:

- `exceptions/` - 通用异常模块（移除 AbstractHttpException，从 platform 导入）
- `logging/` - 通用日志模块
- `caching/` - Redis 缓存模块
- `isolation/` - 数据隔离模块
- `configuration/` - 配置管理模块

**更新 package.json**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 新增依赖
    "@nestjs/common": "^11.1.6"
    // ...
  }
}
```

**更新 imports**:

```typescript
// 从 platform 导入核心类型
import {
  EntityId,
  IsolationContext,
  AbstractHttpException,
} from "@hl8/platform";
```

---

### Step 3: 更新 @hl8/nestjs-fastify（Fastify 专用）

**更新 package.json**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 核心依赖
    "@hl8/nestjs-infra": "workspace:*", // ← 复用通用模块
    "@nestjs/platform-fastify": "^11.1.6"
    // ...
  }
}
```

**更新 imports**:

```typescript
// 从 platform 导入核心
import {
  AbstractHttpException,
  EntityId,
  IsolationContext,
} from "@hl8/platform";

// 从 nestjs-infra 复用模块
import {
  CachingModule,
  IsolationModule,
  TypedConfigModule,
} from "@hl8/nestjs-infra";
```

---

## 📊 依赖关系图

```
                  apps/fastify-api
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
    @hl8/nestjs-fastify     @hl8/nestjs-infra
            ↓                       ↓
            └───────────┬───────────┘
                        ↓
                  @hl8/platform
                 (核心业务逻辑)
```

---

## 🎯 拆分的好处

### 1. 清晰的职责分离 ✨

| 层级                    | 职责         | 依赖                       | 可复用性     |
| ----------------------- | ------------ | -------------------------- | ------------ |
| **@hl8/platform**       | 业务逻辑     | 无框架                     | 100%         |
| **@hl8/nestjs-infra**   | NestJS 通用  | platform + NestJS          | 80%          |
| **@hl8/nestjs-fastify** | Fastify 专用 | platform + infra + Fastify | Fastify 应用 |

### 2. 更好的代码复用 ♻️

**platform 核心**:

- 可用于任何框架（NestJS, Express, Koa, Hono）
- 可用于任何环境（Node, Browser, Deno）
- 纯业务逻辑，易于测试

**nestjs-infra**:

- Express 应用可以直接使用
- Fastify 应用可以选择性使用

**nestjs-fastify**:

- Fastify 应用的最佳选择
- 性能优化到极致

### 3. 降低耦合度 🔗

```
之前：
  所有代码混在 nestjs-infra 中
  框架代码 ↔ 业务逻辑紧密耦合

现在：
  platform (纯业务逻辑)
     ↑ 单向依赖
  nestjs-infra / nestjs-fastify (框架适配)

  低耦合，易测试，易扩展
```

### 4. 更灵活的技术选型 🎯

```
scenario 1: Express 应用
  → 使用 @hl8/nestjs-infra

scenario 2: Fastify 应用（高性能）
  → 使用 @hl8/nestjs-fastify

scenario 3: 非 NestJS 应用
  → 直接使用 @hl8/platform

scenario 4: 浏览器/Deno
  → 使用 @hl8/platform (value objects, entities)
```

---

## 📋 文件移动清单

### 从 nestjs-infra → platform

#### shared/entities/ (1 个文件)

- ✅ `isolation-context.entity.ts`

#### shared/value-objects/ (5 个文件)

- ✅ `entity-id.vo.ts`
- ✅ `tenant-id.vo.ts`
- ✅ `organization-id.vo.ts`
- ✅ `department-id.vo.ts`
- ✅ `user-id.vo.ts`

#### shared/enums/ (2 个文件)

- ✅ `isolation-level.enum.ts`
- ✅ `data-sharing-level.enum.ts`

#### shared/types/ (1 个文件)

- ✅ `shared.types.ts`

#### shared/exceptions/ (4 个文件)

- ✅ `abstract-http.exception.ts` (基类)
- ✅ `tenant-not-found.exception.ts`
- ✅ `invalid-isolation-context.exception.ts`
- ✅ `unauthorized-organization.exception.ts`

#### exceptions/core/ (3 个文件)

- ✅ `general-not-found.exception.ts`
- ✅ `general-bad-request.exception.ts`
- ✅ `general-internal-server.exception.ts`

**总计**: ~16 个文件

---

### 保留在 nestjs-infra

#### exceptions/ (NestJS 框架相关)

- `filters/` - 异常过滤器（Express 兼容）
- `exception.module.ts`
- `providers/`
- `config/`

#### logging/ (NestJS 日志模块)

- `logger.service.ts`
- `logger.module.ts`
- `config/`

#### caching/ (NestJS 缓存模块)

- 全部保留（Redis 集成）

#### isolation/ (NestJS 隔离模块)

- 全部保留（nestjs-cls 集成）

#### configuration/ (NestJS 配置模块)

- 全部保留

**总计**: ~47 个文件（移除 shared 后）

---

## 🚀 实施步骤

### Phase 1: 创建 @hl8/platform（2-3 小时）

```bash
# 1. 创建项目结构
mkdir -p libs/platform/src/shared/{entities,value-objects,enums,exceptions,types}

# 2. 创建 package.json
cat > libs/platform/package.json <<'EOF'
{
  "name": "@hl8/platform",
  "version": "0.1.0",
  "description": "HL8 平台核心业务逻辑 - 无框架依赖",
  "type": "module",
  "dependencies": {
    // 无 NestJS 依赖！
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^22.16.0"
  }
}
EOF

# 3. 移动文件
# (使用 git mv 保留历史)
git mv libs/nestjs-infra/src/shared/entities libs/platform/src/shared/
git mv libs/nestjs-infra/src/shared/value-objects libs/platform/src/shared/
# ... 其他文件
```

**验证**:

```bash
cd libs/platform
pnpm build
pnpm test
# ✅ 应该可以独立构建和测试
```

---

### Phase 2: 重构 @hl8/nestjs-infra（1-2 小时）

**1. 更新 package.json**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 新增
    "@nestjs/common": "^11.1.6"
    // ...
  }
}
```

**2. 更新所有 imports**:

```typescript
// 之前
import { EntityId } from "../shared/value-objects/entity-id.vo.js";

// 之后
import { EntityId } from "@hl8/platform";
```

**3. 移除 shared 目录**:

```bash
rm -rf libs/nestjs-infra/src/shared
```

**4. 更新 index.ts**:

```typescript
// 重新导出 platform 的核心类型
export * from "@hl8/platform";

// 导出 NestJS 模块
export * from "./exceptions/index.js";
export * from "./logging/index.js";
// ...
```

**验证**:

```bash
cd libs/nestjs-infra
pnpm build
pnpm test
# ✅ 所有测试应该仍然通过
```

---

### Phase 3: 重构 @hl8/nestjs-fastify（30 分钟）

**1. 更新 package.json**:

```json
{
  "dependencies": {
    "@hl8/platform": "workspace:*", // ← 核心依赖
    "@hl8/nestjs-infra": "workspace:*", // ← 复用通用模块
    "@nestjs/platform-fastify": "^11.1.6"
    // ...
  }
}
```

**2. 更新 imports**:

```typescript
// 从 platform 导入核心
import { AbstractHttpException, EntityId } from "@hl8/platform";

// 从 nestjs-infra 复用
import { CachingModule, IsolationModule } from "@hl8/nestjs-infra";
```

---

### Phase 4: 更新 apps/fastify-api（15 分钟）

**更新 package.json**:

```json
{
  "dependencies": {
    "@hl8/nestjs-fastify/index.js": "workspace:*" // ← 使用 Fastify 专用
    // 移除 @hl8/nestjs-infra
  }
}
```

**更新 imports**:

```typescript
import {
  FastifyExceptionModule,
  FastifyLoggingModule,
  CachingModule,
  IsolationModule,
} from "@hl8/nestjs-fastify/index.js";
```

---

## 📊 拆分后的结构对比

### 拆分前

```
libs/nestjs-infra/ (753 lines)
├── shared/              ← 业务逻辑
├── exceptions/          ← NestJS 框架
├── logging/             ← NestJS 框架
├── caching/             ← NestJS 框架
├── isolation/           ← NestJS 框架
├── configuration/       ← NestJS 框架
└── fastify/             ← Fastify 框架
```

**问题**: 业务逻辑与框架代码混在一起

---

### 拆分后

```
libs/platform/ (~200 lines)
└── shared/              ← 纯业务逻辑，无框架依赖 ⚡
    ├── entities/
    ├── value-objects/
    ├── enums/
    ├── exceptions/
    └── types/

libs/nestjs-infra/ (~450 lines)
├── exceptions/          ← NestJS 通用模块
├── logging/
├── caching/
├── isolation/
└── configuration/
依赖: @hl8/platform

libs/nestjs-fastify/ (~200 lines)
├── exceptions/          ← Fastify 专用
├── logging/
├── fastify/
└── core/               ← 复用导出
依赖: @hl8/platform + @hl8/nestjs-infra
```

**优势**: 清晰分层，职责单一，高度复用

---

## 🎯 预期成果

### 1. @hl8/platform

- ✅ 无框架依赖
- ✅ 可在任何环境使用
- ✅ 100% 可测试
- ✅ 高度可复用

### 2. @hl8/nestjs-infra

- ✅ 体积更小（~450 lines）
- ✅ 职责更清晰（只负责 NestJS 适配）
- ✅ 维护更简单
- ✅ Express/Fastify 通用

### 3. @hl8/nestjs-fastify

- ✅ 100% Fastify 优化
- ✅ 零配置高性能
- ✅ 80% 代码复用

---

## ⏱️ 时间估算

| Phase    | 任务                     | 时间         |
| -------- | ------------------------ | ------------ |
| Phase 1  | 创建 @hl8/platform       | 2-3h         |
| Phase 2  | 重构 @hl8/nestjs-infra   | 1-2h         |
| Phase 3  | 重构 @hl8/nestjs-fastify | 0.5h         |
| Phase 4  | 更新 fastify-api         | 0.25h        |
| Phase 5  | 测试验证                 | 1h           |
| **总计** |                          | **5-7 小时** |

---

## ✅ 验收标准

### 构建成功

```bash
# 按依赖顺序构建
pnpm turbo build --filter=@hl8/platform
pnpm turbo build --filter=@hl8/nestjs-infra
pnpm turbo build --filter=@hl8/nestjs-fastify
pnpm turbo build --filter=fastify-api
```

### 测试通过

```bash
# platform（纯业务逻辑测试）
cd libs/platform && pnpm test  # ✅ 应通过

# nestjs-infra（框架集成测试）
cd libs/nestjs-infra && pnpm test  # ✅ 应通过

# fastify-api（应用测试）
cd apps/fastify-api && pnpm test  # ✅ 应通过
```

### 应用启动

```bash
cd apps/fastify-api
pnpm dev

# ✅ 应该成功启动
🚀 Application started at http://0.0.0.0:3001
```

---

## 📚 文档更新

### 需要更新的文档

1. **libs/platform/README.md** - 新建
2. **libs/nestjs-infra/README.md** - 更新依赖说明
3. **libs/nestjs-fastify/README.md** - 更新依赖说明
4. **PROJECT_SUMMARY.md** - 更新架构说明
5. **TURBOREPO-QUICK-REFERENCE.md** - 更新构建顺序

---

## 🎯 执行命令

准备好后执行：

```bash
# 方案 A: 手动执行（推荐，更可控）
按照上述步骤逐步操作

# 方案 B: 脚本自动化（快速）
/speckit.implement 执行拆分脚本
```

---

## ⚠️ 注意事项

### 1. Git 历史保留

使用 `git mv` 而不是 `rm + create`，保留文件历史

### 2. 测试重要性

每个 Phase 完成后立即测试，确保不破坏功能

### 3. 依赖顺序

Platform → NestJS-Infra → NestJS-Fastify → Apps

### 4. 版本管理

- @hl8/platform: 0.1.0（新项目）
- @hl8/nestjs-infra: 0.4.0（重大重构）
- @hl8/nestjs-fastify: 0.1.0（新项目）

---

## 🎊 拆分后的优势总结

1. **清晰的分层** - 核心 → 通用 → 专用
2. **高度复用** - platform 可用于任何场景
3. **性能优化** - Fastify 专用模块极致优化
4. **易于维护** - 职责单一，低耦合
5. **灵活扩展** - 可以轻松添加其他适配器（如 Koa, Hono）

---

**准备好开始拆分了吗？** 🚀
