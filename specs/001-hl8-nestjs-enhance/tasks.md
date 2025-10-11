# Tasks: NestJS 基础设施模块（@hl8/nestjs-infra）

**Feature**: 001-hl8-nestjs-enhance  
**Package Name**: `@hl8/nestjs-infra`  
**Created**: 2025-10-11  
**Status**: Ready for Implementation

<!--
  重要提示：本任务列表遵循 `docs/definition-of-terms.mdc` 中定义的统一术语。
  任务按模块依赖关系和用户故事优先级组织。
-->

## 任务概览

- **总任务数**: 68个
- **预计工期**: 22-37 人天
- **并行机会**: 21个任务可并行执行（标记为 [P]）
- **用户故事**: 5个（P1: 2个，P2: 2个，P3: 1个）

## 依赖关系图

```text
Phase 1: 项目初始化
    ↓
Phase 2: 基础设施优先（P0）⭐ CRITICAL
    exceptions 模块（RFC7807 统一异常处理）
    shared/ 基础（EntityId、类型、枚举）
    common/ 基础（@Public 装饰器）
    ↓
Phase 3: 核心功能（P1）
    ├─→ [US1] Fastify 适配器 + 缓存（并行）
    └─→ [US2] 数据隔离（isolation）+ 日志
    ↓
Phase 4: 高级功能（P2）
    ├─→ [US3] 增强异常处理（消息提供者）
    └─→ [US4] 日志增强（监控）
    ↓
Phase 5: 配置管理（P3）
    [US5] 配置管理
    ↓
Phase 6: 集成测试与文档
```

## 实施策略

**MVP 范围**（最小可行产品）：

- Phase 1 + Phase 2 + Phase 3（US1 + US2）
- 提供：异常处理 + Fastify 适配器 + 缓存 + 数据隔离 + 日志
- 预计：2-3周

**增量交付**：

- v0.1.0：Phase 1-2（基础设施）
- v0.2.0：Phase 3（核心功能）
- v0.3.0：Phase 4（高级功能）
- v1.0.0：Phase 5-6（完整功能）

---

## Phase 1: 项目初始化（1-2天）✅ **已完成**

**目标**: 创建项目骨架，配置工具链

### T001 - ✅ 创建项目目录结构

**描述**: 创建 `libs/nestjs-infra` 目录和基础结构

**步骤**:

```bash
mkdir -p libs/nestjs-infra/src/{exceptions,shared,common,isolation,caching,configuration,logging,fastify,utils}
mkdir -p libs/nestjs-infra/__tests__/{exceptions,isolation,caching,fastify}
```

**交付物**:

- libs/nestjs-infra/ 目录
- src/ 子目录（8个功能模块）
- **tests**/ 子目录（4个集成测试目录）

---

### T002 - 初始化 package.json

**描述**: 创建 package.json，配置依赖和脚本

**依赖**: T001

**步骤**:

```json
{
  "name": "@hl8/nestjs-infra",
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.6",
    "@nestjs/core": "^11.1.6",
    "@nestjs/platform-fastify": "^11.1.6",
    "nestjs-cls": "^5.0.0",
    "ioredis": "^5.3.0",
    "pino": "^9.12.0",
    "fastify": "^5.6.1",
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1",
    "dotenv": "^17.2.2",
    "js-yaml": "^4.1.0"
  },
  "scripts": {
    "build": "pnpm run type-check && pnpm run build:swc",
    "build:swc": "swc src -d dist --strip-leading-paths",
    "build:types": "tsc --emitDeclarationOnly --outDir dist",
    "type-check": "tsc --noEmit",
    "dev": "swc src -d dist --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

**交付物**:

- libs/nestjs-infra/package.json

---

### T003 [P] - 配置 TypeScript

**描述**: 创建 tsconfig.json 和 tsconfig.build.json

**依赖**: T001

**文件**: libs/nestjs-infra/tsconfig.json

```json
{
  "extends": "@repo/ts-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**交付物**:

- tsconfig.json
- tsconfig.build.json

---

### T004 [P] - 配置 ESLint

**描述**: 创建 eslint.config.mjs

**依赖**: T001

**文件**: libs/nestjs-infra/eslint.config.mjs

```javascript
import nestConfig from '@repo/eslint-config/nest';

export default [
  ...nestConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
```

**交付物**:

- eslint.config.mjs

---

### T005 [P] - 配置 SWC

**描述**: 创建 .swcrc（使用根目录配置或创建本地配置）

**依赖**: T001

**交付物**:

- .swcrc（如果需要自定义配置）

---

### T006 [P] - 配置 Jest

**描述**: 创建 jest.config.ts

**依赖**: T001

**文件**: libs/nestjs-infra/jest.config.ts

```typescript
export default {
  displayName: 'nestjs-infra',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/nestjs-infra',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**交付物**:

- jest.config.ts

---

### T007 - 创建主入口文件

**描述**: 创建 src/index.ts，暂时为空，后续逐步添加导出

**依赖**: T001

**文件**: libs/nestjs-infra/src/index.ts

```typescript
/**
 * @hl8/nestjs-infra - NestJS 基础设施模块
 *
 * @description 为 NestJS 应用提供企业级基础设施功能
 * @packageDocumentation
 */

// TODO: 逐步添加模块导出
```

**交付物**:

- src/index.ts

---

### T008 - 创建 README.md

**描述**: 创建项目说明文档

**依赖**: T001

**交付物**:

- README.md（参考 quickstart.md 的内容）

---

**Phase 1 检查点**: ✅ 项目骨架完成，工具链配置完成，可以开始开发

---

## Phase 2: 基础设施优先（P0 - CRITICAL）（3-5天）✅ **已完成**

**目标**: 实现统一异常处理系统（RFC7807），所有其他模块的基础依赖

**依赖**: Phase 1 完成

### T009 - [US3] 创建异常模块基础

**描述**: 创建 exceptions/ 目录结构和模块文件

**User Story**: US3 - 统一错误处理

**文件**: libs/nestjs-infra/src/exceptions/exception.module.ts

**步骤**:

1. 创建目录结构：

   ```bash
   mkdir -p src/exceptions/{core,filters,providers,config,types,utils}
   ```

2. 创建模块定义（暂时为空，后续补充）

**交付物**:

- exceptions/exception.module.ts
- exceptions/ 子目录结构

---

### T010 - [US3] 实现 AbstractHttpException 基类

**描述**: 实现 RFC7807 标准的异常基类

**依赖**: T009

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/core/abstract-http.exception.ts

**功能**:

- 继承 NestJS HttpException
- 包含 errorCode、title、detail、status、data、type、rootCause 属性
- 实现 toRFC7807() 方法，转换为 RFC7807 格式
- 完整的 TSDoc 中文注释

**交付物**:

- abstract-http.exception.ts
- abstract-http.exception.spec.ts（单元测试，覆盖率 ≥ 90%）

---

### T011 [P] - [US3] 实现通用异常类

**描述**: 实现3个通用异常类

**依赖**: T010

**User Story**: US3

**文件**:

- libs/nestjs-infra/src/exceptions/core/general-not-found.exception.ts
- libs/nestjs-infra/src/exceptions/core/general-bad-request.exception.ts
- libs/nestjs-infra/src/exceptions/core/general-internal-server.exception.ts

**功能**:

- GeneralNotFoundException（404）
- GeneralBadRequestException（400）
- GeneralInternalServerException（500）
- 每个类都继承 AbstractHttpException
- 完整的 TSDoc 注释和使用示例

**交付物**:

- 3个异常类文件
- 对应的单元测试文件（.spec.ts）

---

### T012 - [US3] 实现 HttpExceptionFilter

**描述**: 实现 HTTP 异常过滤器

**依赖**: T010, T011

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/filters/http-exception.filter.ts

**功能**:

- 捕获 AbstractHttpException 异常
- 转换为 RFC7807 格式响应
- 记录结构化日志（依赖 ILoggerService 接口，暂时使用 console）
- 支持消息提供者（可选）

**交付物**:

- http-exception.filter.ts
- http-exception.filter.spec.ts

---

### T013 - [US3] 实现 AnyExceptionFilter

**描述**: 实现全局异常过滤器（捕获所有未知异常）

**依赖**: T012

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/filters/any-exception.filter.ts

**功能**:

- 捕获所有异常（@Catch()）
- 将未知异常转换为 500 错误
- 避免暴露敏感信息
- 记录完整的错误堆栈

**交付物**:

- any-exception.filter.ts
- any-exception.filter.spec.ts

---

### T014 - [US3] 实现 ExceptionMessageProvider 接口

**描述**: 定义消息提供者接口

**依赖**: T009

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/providers/exception-message.provider.ts

**功能**:

- getMessage() 方法
- hasMessage() 方法
- getAvailableErrorCodes() 方法
- 支持消息参数替换

**交付物**:

- exception-message.provider.ts（接口定义）
- default-message.provider.ts（默认实现）
- exception-message.provider.spec.ts

---

### T015 - [US3] 实现异常配置

**描述**: 实现异常模块配置

**依赖**: T009

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/config/exception.config.ts

**功能**:

- ExceptionConfig 接口
- 配置验证
- 默认配置

**交付物**:

- exception.config.ts
- 配置类型定义

---

### T016 - [US3] 完善 ExceptionModule

**描述**: 完善异常模块，实现动态模块

**依赖**: T010-T015

**User Story**: US3

**文件**: libs/nestjs-infra/src/exceptions/exception.module.ts

**功能**:

- forRoot() 方法（同步配置）
- forRootAsync() 方法（异步配置）
- 注册异常过滤器（APP_FILTER）
- 导出配置提供者

**交付物**:

- exception.module.ts（完整实现）
- exception.module.spec.ts

---

### T017 [P] - 创建 EntityId 值对象

**描述**: 实现 EntityId 值对象（来自 @hl8/common）

**依赖**: T001

**文件**: libs/nestjs-infra/src/shared/value-objects/entity-id.vo.ts

**功能**:

- 值对象基类
- UUID 验证
- 相等性比较
- 不可变性保证

**交付物**:

- entity-id.vo.ts
- entity-id.vo.spec.ts

---

### T018 [P] - 创建通用类型定义

**描述**: 创建共享类型定义（来自 @hl8/common）

**依赖**: T001

**文件**: libs/nestjs-infra/src/shared/types/shared.types.ts

**功能**:

- DeepPartial 类型
- 其他通用类型

**交付物**:

- shared.types.ts

---

### T019 [P] - 创建枚举定义

**描述**: 创建 IsolationLevel 和 DataSharingLevel 枚举

**依赖**: T001

**文件**:

- libs/nestjs-infra/src/shared/enums/isolation-level.enum.ts
- libs/nestjs-infra/src/shared/enums/data-sharing-level.enum.ts

**交付物**:

- isolation-level.enum.ts
- data-sharing-level.enum.ts

---

### T020 [P] - 创建 @Public 装饰器

**描述**: 创建通用装饰器（来自 @hl8/common）

**依赖**: T001

**文件**: libs/nestjs-infra/src/common/decorators/public.decorator.ts

**功能**:

- 标记公开路由的装饰器
- 元数据定义

**交付物**:

- public.decorator.ts
- public.decorator.spec.ts

---

### T021 - 集成测试：异常处理系统

**描述**: 集成测试验证异常处理系统

**依赖**: T016

**User Story**: US3

**文件**: libs/nestjs-infra/**tests**/exceptions/exception-integration.spec.ts

**测试场景**:

- ExceptionModule 正确注册
- HttpExceptionFilter 捕获并转换异常
- RFC7807 格式响应正确
- 消息提供者工作正常

**交付物**:

- exception-integration.spec.ts

---

### T022 - 更新主入口导出异常模块

**描述**: 在 index.ts 中导出异常模块

**依赖**: T016

**文件**: libs/nestjs-infra/src/index.ts

```typescript
// 异常处理模块
export * from './exceptions/exception.module';
export * from './exceptions/core/abstract-http.exception';
export * from './exceptions/core/general-not-found.exception';
export * from './exceptions/core/general-bad-request.exception';
export * from './exceptions/core/general-internal-server.exception';
export * from './exceptions/filters/http-exception.filter';
export * from './exceptions/providers/exception-message.provider';
export type * from './exceptions/types/exception.types';
```

**交付物**:

- 更新 index.ts

---

**Phase 2 检查点**: ✅ **异常处理系统完成！**

**已完成的功能**：

- RFC7807 标准异常处理
- 3个通用异常类（404/400/500）
- HttpExceptionFilter 和 AnyExceptionFilter
- 消息提供者（支持国际化）
- 动态模块配置（forRoot/forRootAsync）
- 完整的单元测试和集成测试
- shared 和 common 基础组件

**可以开始 Phase 3**：核心功能开发（Fastify + 缓存 + 数据隔离）

---

## Phase 3: 核心功能 - User Story 1 & 2（P1）（10-15天）✅ **已完成**

**目标**: 实现应用性能优化（Fastify + 缓存）和多层级数据隔离

### 子阶段 3.1: User Story 1 - 应用性能优化（Fastify + 缓存）✅ **已完成**

#### T023 - ✅ [US1] 实现 EnterpriseFastifyAdapter

**描述**: 实现企业级 Fastify 适配器（整合所有功能）

**依赖**: Phase 2 完成

**User Story**: US1 - 应用性能优化

**文件**: libs/nestjs-infra/src/fastify/enterprise-fastify.adapter.ts

**功能**:

- 继承 FastifyAdapter
- 集成 CORS 支持（默认启用）
- 集成性能监控（默认启用）
- 集成健康检查端点（默认启用）
- 支持限流配置（可选启用）
- 支持熔断器配置（可选启用）
- 支持安全头配置（默认启用）
- 完整的 TSDoc 注释

**交付物**:

- enterprise-fastify.adapter.ts
- enterprise-fastify.adapter.spec.ts

---

#### T024 [P] - [US1] 实现 Fastify 配置

**描述**: 实现 Fastify 配置类型和默认配置

**依赖**: T023

**User Story**: US1

**文件**: libs/nestjs-infra/src/fastify/config/fastify.config.ts

**交付物**:

- fastify.config.ts
- 配置类型定义（在 contracts/ 中已定义）

---

#### T025 [P] - [US1] 实现 Fastify 中间件（限流、熔断、安全）

**描述**: 实现企业级中间件

**依赖**: T023

**User Story**: US1

**文件**:

- libs/nestjs-infra/src/fastify/middleware/rate-limit.middleware.ts
- libs/nestjs-infra/src/fastify/middleware/circuit-breaker.middleware.ts
- libs/nestjs-infra/src/fastify/middleware/security.middleware.ts

**功能**:

- 限流中间件（基于 IP 和租户）
- 熔断器中间件（自动故障检测）
- 安全中间件（Helmet、XSS、CSRF）

**交付物**:

- 3个中间件文件
- 对应的单元测试

---

#### T026 [P] - [US1] 实现 Fastify 监控服务

**描述**: 实现健康检查和性能监控服务

**依赖**: T023

**User Story**: US1

**文件**:

- libs/nestjs-infra/src/fastify/monitoring/health-check.service.ts
- libs/nestjs-infra/src/fastify/monitoring/performance-monitor.service.ts

**交付物**:

- 2个监控服务文件
- 对应的单元测试

---

#### T027 - [US1] 实现 CacheService 核心

**描述**: 实现缓存服务核心功能

**依赖**: Phase 2 完成

**User Story**: US1 - 应用性能优化

**文件**: libs/nestjs-infra/src/caching/cache.service.ts

**功能**:

- set()、get()、del()、exists() 方法
- 支持 TTL
- 自动序列化/反序列化
- 抛出统一异常（依赖 exceptions 模块）
- 完整的 TSDoc 注释

**交付物**:

- cache.service.ts
- cache.service.spec.ts（覆盖率 ≥ 90%）

---

#### T028 - [US1] 实现 RedisService

**描述**: 实现 Redis 连接和操作服务

**依赖**: T027

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/redis.service.ts

**功能**:

- Redis 连接管理
- 基础 Redis 操作封装
- 连接健康检查
- 错误处理

**交付物**:

- redis.service.ts
- redis.service.spec.ts

---

#### T029 [P] - [US1] 实现缓存键生成器

**描述**: 实现支持5层级隔离的缓存键生成策略

**依赖**: T027

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/utils/key-generator.util.ts

**功能**:

- 生成包含隔离层级的缓存键
- 支持平台级、租户级、组织级、部门级、用户级
- 格式：`hl8:cache:{level}:{namespace}:{key}`

**交付物**:

- key-generator.util.ts
- key-generator.util.spec.ts

---

#### T030 [P] - [US1] 实现数据序列化器

**描述**: 实现缓存数据序列化/反序列化

**依赖**: T027

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/utils/serializer.util.ts

**交付物**:

- serializer.util.ts
- serializer.util.spec.ts

---

#### T031 - [US1] 实现 CachingModule

**描述**: 实现缓存模块

**依赖**: T027-T030

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/cache.module.ts

**功能**:

- forRoot() 动态模块方法
- forRootAsync() 异步配置方法
- 注册 CacheService 和 RedisService

**交付物**:

- cache.module.ts
- cache.module.spec.ts

---

#### T032 [P] - [US1] 实现 @Cacheable 装饰器

**描述**: 实现缓存装饰器

**依赖**: T031

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/decorators/cacheable.decorator.ts

**功能**:

- 自动缓存方法返回值
- 支持 TTL 配置
- 自动使用隔离上下文生成缓存键

**交付物**:

- cacheable.decorator.ts
- cacheable.decorator.spec.ts

---

#### T033 [P] - [US1] 实现 @CacheEvict 装饰器

**描述**: 实现缓存清除装饰器

**依赖**: T031

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/decorators/cache-evict.decorator.ts

**交付物**:

- cache-evict.decorator.ts
- cache-evict.decorator.spec.ts

---

#### T034 [P] - [US1] 实现 @CachePut 装饰器

**描述**: 实现缓存更新装饰器

**依赖**: T031

**User Story**: US1

**文件**: libs/nestjs-infra/src/caching/decorators/cache-put.decorator.ts

**交付物**:

- cache-put.decorator.ts
- cache-put.decorator.spec.ts

---

#### T035 - [US1] 集成测试：Fastify + 缓存

**描述**: 端到端测试 Fastify 适配器和缓存功能

**依赖**: T023-T034

**User Story**: US1

**文件**: libs/nestjs-infra/**tests**/fastify/fastify-cache-integration.spec.ts

**测试场景**:

- Fastify 适配器正常工作
- 并发请求测试（1000个并发）
- 缓存命中率测试
- 性能测试（响应时间 < 100ms）

**交付物**:

- fastify-cache-integration.spec.ts

---

### 子阶段 3.2: User Story 2 - 多层级数据隔离 ✅ **已完成**

#### T036 - ✅ [US2] 创建 IsolationContext 实体

**描述**: 实现隔离上下文实体（充血模型）

**依赖**: Phase 2 完成，T017（EntityId），T019（枚举）

**User Story**: US2 - 多层级数据隔离

**文件**: libs/nestjs-infra/src/shared/entities/isolation-context.entity.ts

**功能**（充血模型）：

- 包含 tenantId、organizationId、departmentId、userId 属性（值对象）
- validate() 方法：验证层级关系
- getIsolationLevel() 方法：返回隔离级别
- isEmpty() 方法：判断是否为平台级
- 业务逻辑在实体内部，禁止贫血模型
- 完整的 TSDoc 注释

**交付物**:

- isolation-context.entity.ts
- isolation-context.entity.spec.ts

---

#### T037 [P] - [US2] 创建 TenantId、OrganizationId、DepartmentId、UserId 值对象

**描述**: 实现4个标识符值对象

**依赖**: T017

**User Story**: US2

**文件**:

- libs/nestjs-infra/src/shared/value-objects/tenant-id.vo.ts
- libs/nestjs-infra/src/shared/value-objects/organization-id.vo.ts
- libs/nestjs-infra/src/shared/value-objects/department-id.vo.ts
- libs/nestjs-infra/src/shared/value-objects/user-id.vo.ts

**功能**:

- 继承 EntityId 或独立实现
- 格式验证
- 不可变性

**交付物**:

- 4个值对象文件
- 对应的单元测试

---

#### T038 [P] - [US2] 创建领域事件

**描述**: 实现隔离相关的领域事件

**依赖**: T036

**User Story**: US2

**文件**:

- libs/nestjs-infra/src/shared/events/isolation-context-created.event.ts
- libs/nestjs-infra/src/shared/events/isolation-context-switched.event.ts
- libs/nestjs-infra/src/shared/events/cache-invalidated.event.ts

**交付物**:

- 3个事件类文件
- 对应的单元测试

---

#### T039 [P] - [US2] 创建业务异常

**描述**: 创建隔离相关的业务异常

**依赖**: T010（AbstractHttpException），T036

**User Story**: US2

**文件**:

- libs/nestjs-infra/src/shared/exceptions/tenant-not-found.exception.ts
- libs/nestjs-infra/src/shared/exceptions/invalid-isolation-context.exception.ts
- libs/nestjs-infra/src/shared/exceptions/unauthorized-organization.exception.ts

**交付物**:

- 3个异常类文件
- 对应的单元测试

---

#### T040 - [US2] 实现 IsolationContextService

**描述**: 实现隔离上下文管理服务

**依赖**: T036-T039

**User Story**: US2

**文件**: libs/nestjs-infra/src/isolation/services/isolation-context.service.ts

**功能**:

- 基于 nestjs-cls 的上下文管理
- setIsolationContext() 方法
- getIsolationContext() 方法
- getTenantId()、getOrganizationId()、getDepartmentId()、getUserId() 方法
- getIsolationLevel() 方法
- 完整的 TSDoc 注释

**交付物**:

- isolation-context.service.ts
- isolation-context.service.spec.ts

---

#### T041 - [US2] 实现 MultiLevelIsolationService

**描述**: 实现多层级隔离服务

**依赖**: T040

**User Story**: US2

**文件**: libs/nestjs-infra/src/isolation/services/multi-level-isolation.service.ts

**功能**:

- validateIsolation() 方法
- checkAccess() 方法
- 支持共享数据访问判断（isShared、sharingLevel）

**交付物**:

- multi-level-isolation.service.ts
- multi-level-isolation.service.spec.ts

---

#### T042 [P] - [US2] 实现隔离策略接口

**描述**: 定义隔离策略接口

**依赖**: T040

**User Story**: US2

**文件**:

- libs/nestjs-infra/src/isolation/strategies/isolation-strategy.interface.ts
- libs/nestjs-infra/src/isolation/strategies/validation-strategy.interface.ts

**交付物**:

- 2个策略接口文件

---

#### T043 - [US2] 实现 IsolationExtractionMiddleware

**描述**: 实现隔离上下文提取中间件

**依赖**: T040

**User Story**: US2

**文件**: libs/nestjs-infra/src/isolation/middleware/isolation-extraction.middleware.ts

**功能**:

- 从请求头提取隔离标识（X-Tenant-Id、X-Organization-Id、X-Department-Id、X-User-Id）
- 构建 IsolationContext
- 存储到 nestjs-cls
- 错误处理（缺少必需标识时抛出异常）

**交付物**:

- isolation-extraction.middleware.ts
- isolation-extraction.middleware.spec.ts

---

#### T044 [P] - [US2] 实现隔离装饰器

**描述**: 实现隔离相关装饰器

**依赖**: T040

**User Story**: US2

**文件**:

- libs/nestjs-infra/src/isolation/decorators/isolation.decorator.ts
- libs/nestjs-infra/src/isolation/decorators/current-isolation.decorator.ts

**功能**:

- @Isolation() 装饰器：标记需要隔离的路由
- @CurrentIsolation() 装饰器：注入当前隔离上下文

**交付物**:

- 2个装饰器文件
- 对应的单元测试

---

#### T045 [P] - [US2] 实现 IsolationGuard

**描述**: 实现隔离守卫

**依赖**: T040

**User Story**: US2

**文件**: libs/nestjs-infra/src/isolation/guards/isolation.guard.ts

**功能**:

- 验证隔离上下文有效性
- 检查访问权限

**交付物**:

- isolation.guard.ts
- isolation.guard.spec.ts

---

#### T046 - [US2] 实现 IsolationModule

**描述**: 实现数据隔离模块

**依赖**: T040-T045

**User Story**: US2

**文件**: libs/nestjs-infra/src/isolation/isolation.module.ts

**功能**:

- forRoot() 方法
- 注册 ClsModule（nestjs-cls）
- 注册 IsolationContextService
- 注册 MultiLevelIsolationService
- 注册中间件和守卫

**交付物**:

- isolation.module.ts
- isolation.module.spec.ts

---

#### T047 - [US2] 集成测试：多层级数据隔离

**描述**: 集成测试验证数据隔离功能

**依赖**: T046

**User Story**: US2

**文件**: libs/nestjs-infra/**tests**/isolation/isolation-integration.spec.ts

**测试场景**:

- 租户间完全隔离
- 组织级非共享数据隔离
- 部门级非共享数据隔离
- 用户级私有数据隔离
- 共享数据在正确范围内可访问
- 平台级数据支持

**交付物**:

- isolation-integration.spec.ts

---

#### T048 - [US1+US2] 整合缓存与隔离

**描述**: 将隔离上下文整合到缓存键生成

**依赖**: T029（缓存键生成器），T040（IsolationContextService）

**User Story**: US1 + US2

**文件**: 更新 libs/nestjs-infra/src/caching/utils/key-generator.util.ts

**功能**:

- 注入 IsolationContextService
- 自动从上下文获取隔离层级
- 生成包含隔离信息的缓存键

**交付物**:

- 更新 key-generator.util.ts
- 更新单元测试

---

#### T049 - [US4] 实现 LoggerService（基础）

**描述**: 实现基于 Pino 的日志服务

**依赖**: Phase 2 完成

**User Story**: US4 - 结构化日志

**文件**: libs/nestjs-infra/src/logging/logger.service.ts

**功能**:

- 基于 Pino
- log()、error()、warn()、debug() 方法
- 自动包含隔离上下文（依赖 IsolationContextService）
- 结构化日志格式
- 完整的 TSDoc 注释

**交付物**:

- logger.service.ts
- logger.service.spec.ts

---

#### T050 - [US4] 实现 LoggingModule

**描述**: 实现日志模块

**依赖**: T049

**User Story**: US4

**文件**: libs/nestjs-infra/src/logging/logger.module.ts

**功能**:

- forRoot() 方法
- 配置日志级别、格式化选项

**交付物**:

- logger.module.ts
- logger.module.spec.ts

---

#### T051 - 更新主入口导出核心功能

**描述**: 在 index.ts 中导出 Fastify、缓存、隔离、日志模块

**依赖**: T023（Fastify），T031（缓存），T046（隔离），T050（日志）

**文件**: libs/nestjs-infra/src/index.ts

**交付物**:

- 更新 index.ts，导出所有核心模块

---

**Phase 3 检查点**: ✅ 核心功能完成（US1 + US2 + US4 基础），可以开始高级功能

---

## Phase 4: 高级功能 - User Story 3 & 4（P2）（5-8天）

**目标**: 增强异常处理和日志功能

### 子阶段 4.1: User Story 3 - 增强异常处理

#### T052 [P] - [US3] 实现缓存监控服务

**描述**: 实现缓存监控和统计

**依赖**: T031

**User Story**: US1（增强）

**文件**:

- libs/nestjs-infra/src/caching/monitoring/cache-monitor.service.ts
- libs/nestjs-infra/src/caching/monitoring/cache-stats.service.ts
- libs/nestjs-infra/src/caching/monitoring/health-check.service.ts

**交付物**:

- 3个监控服务文件
- 对应的单元测试

---

#### T053 - [US4] 实现日志格式化器

**描述**: 实现自定义日志格式化器

**依赖**: T049

**User Story**: US4

**文件**: libs/nestjs-infra/src/logging/formatters/

**功能**:

- JSON 格式化器
- Pretty 格式化器（开发环境）
- 自定义字段格式化

**交付物**:

- 格式化器文件
- 单元测试

---

#### T054 [P] - [US4] 实现日志传输器

**描述**: 实现日志传输器（文件、控制台、远程）

**依赖**: T049

**User Story**: US4

**文件**: libs/nestjs-infra/src/logging/transports/

**功能**:

- 控制台传输器
- 文件传输器
- 远程传输器（可选）

**交付物**:

- 传输器文件
- 单元测试

---

**Phase 4 检查点**: ✅ 高级功能完成（监控、日志增强）

---

## Phase 5: 配置管理 - User Story 5（P3）（5-7天）

**目标**: 实现类型安全的配置管理

### T055 - [US5] 实现 TypedConfigModule 基础

**描述**: 实现类型安全配置模块

**依赖**: Phase 2 完成

**User Story**: US5 - 灵活配置管理

**文件**: libs/nestjs-infra/src/configuration/typed-config.module.ts

**功能**:

- forRoot() 方法
- 支持 schema 验证
- 支持配置加载器

**交付物**:

- typed-config.module.ts
- typed-config.module.spec.ts

---

### T056 [P] - [US5] 实现文件加载器

**描述**: 实现配置文件加载器（.yml、.json）

**依赖**: T055

**User Story**: US5

**文件**: libs/nestjs-infra/src/configuration/loader/file.loader.ts

**功能**:

- 支持 YAML 和 JSON
- 路径解析
- 错误处理

**交付物**:

- file.loader.ts
- file.loader.spec.ts

---

### T057 [P] - [US5] 实现 Dotenv 加载器

**描述**: 实现环境变量加载器

**依赖**: T055

**User Story**: US5

**文件**: libs/nestjs-infra/src/configuration/loader/dotenv.loader.ts

**功能**:

- 加载 .env 文件
- 支持环境变量扩展（${VAR}）
- 支持默认值（${VAR:-DEFAULT}）

**交付物**:

- dotenv.loader.ts
- dotenv.loader.spec.ts

---

### T058 [P] - [US5] 实现远程加载器

**描述**: 实现远程配置加载器（可选）

**依赖**: T055

**User Story**: US5

**文件**: libs/nestjs-infra/src/configuration/loader/remote.loader.ts

**交付物**:

- remote.loader.ts
- remote.loader.spec.ts

---

### T059 - [US5] 实现配置验证器

**描述**: 实现基于 class-validator 的配置验证

**依赖**: T055

**User Story**: US5

**文件**: libs/nestjs-infra/src/configuration/validators/

**功能**:

- 集成 class-validator
- 验证配置完整性
- 提供详细的验证错误信息

**交付物**:

- 验证器文件
- 单元测试

---

### T060 - [US5] 实现配置缓存

**描述**: 实现配置缓存机制

**依赖**: T055

**User Story**: US5

**文件**: libs/nestjs-infra/src/configuration/cache/

**功能**:

- 内存缓存
- 配置更新检测

**交付物**:

- 缓存实现文件
- 单元测试

---

### T061 - [US5] 集成测试：配置管理

**描述**: 集成测试验证配置管理功能

**依赖**: T055-T060

**User Story**: US5

**文件**: libs/nestjs-infra/**tests**/configuration/config-integration.spec.ts

**测试场景**:

- 配置文件正确加载
- 环境变量覆盖配置
- 配置验证失败时应用启动失败
- 类型安全性验证

**交付物**:

- config-integration.spec.ts

---

**Phase 5 检查点**: ✅ 配置管理完成

---

## Phase 6: 通用工具和优化（2-3天）

**目标**: 实现通用工具函数，优化性能

### T062 [P] - 实现通用工具函数

**描述**: 实现来自 @hl8/utils 的通用工具

**依赖**: T001

**文件**: libs/nestjs-infra/src/utils/

**功能**:

- key-generator.util.ts（如果未在T029实现）
- serializer.util.ts（如果未在T030实现）
- 其他通用工具

**交付物**:

- 工具函数文件
- 单元测试

---

### T063 [P] - 性能优化：缓存预热

**描述**: 实现缓存预热机制

**依赖**: T031

**文件**: libs/nestjs-infra/src/caching/utils/cache-warmup.util.ts

**交付物**:

- cache-warmup.util.ts
- cache-warmup.util.spec.ts

---

### T064 [P] - 性能优化：连接池

**描述**: 优化 Redis 连接池配置

**依赖**: T028

**文件**: 更新 libs/nestjs-infra/src/caching/redis.service.ts

**交付物**:

- 更新 redis.service.ts

---

## Phase 7: 文档和完善（2-3天）

**目标**: 完善文档，准备发布

### T065 - 完善 README.md

**描述**: 编写完整的 README 文档

**依赖**: Phase 3-5 完成

**文件**: libs/nestjs-infra/README.md

**内容**:

- 项目简介
- 安装说明
- 快速开始（参考 quickstart.md）
- API 文档链接
- 贡献指南

**交付物**:

- README.md

---

### T066 - 创建使用示例

**描述**: 在 examples/ 创建完整使用示例

**依赖**: Phase 3-5 完成

**文件**: libs/nestjs-infra/examples/

**示例**:

- basic-usage.example.ts
- multi-level-isolation.example.ts
- exception-handling.example.ts
- caching.example.ts

**交付物**:

- examples/ 目录和示例文件

---

### T067 - 生成 CHANGELOG.md

**描述**: 生成变更日志

**依赖**: Phase 6 完成

**文件**: libs/nestjs-infra/CHANGELOG.md

**交付物**:

- CHANGELOG.md

---

### T068 - 代码质量检查

**描述**: 运行 ESLint、类型检查、测试覆盖率

**依赖**: 所有开发任务完成

**步骤**:

```bash
cd libs/nestjs-infra
pnpm run type-check    # TypeScript 类型检查
pnpm run lint          # ESLint 检查
pnpm run test:cov      # 测试覆盖率 ≥ 80%
```

**交付物**:

- 所有检查通过
- 测试覆盖率报告

---

**Phase 7 检查点**: ✅ 文档完善，项目可发布

---

## 并行执行机会

### Phase 2（基础设施）

**并行组1**：

- T011（通用异常类）
- T017（EntityId）
- T018（类型定义）
- T019（枚举）
- T020（@Public 装饰器）

### Phase 3.1（US1 - 性能优化）

**并行组2**：

- T024（Fastify 配置）
- T025（Fastify 中间件）
- T026（Fastify 监控）

**并行组3**：

- T029（缓存键生成器）
- T030（序列化器）

**并行组4**：

- T032（@Cacheable）
- T033（@CacheEvict）
- T034（@CachePut）

### Phase 3.2（US2 - 数据隔离）

**并行组5**：

- T037（4个值对象）
- T038（领域事件）
- T039（业务异常）

**并行组6**：

- T042（隔离策略）
- T044（装饰器）
- T045（守卫）

### Phase 5（US5 - 配置管理）

**并行组7**：

- T056（文件加载器）
- T057（Dotenv 加载器）
- T058（远程加载器）

### Phase 6（优化）

**并行组8**：

- T062（通用工具）
- T063（缓存预热）
- T064（连接池优化）

---

## 用户故事完成顺序

### MVP（最小可行产品）

**范围**: US1 + US2（+ US3 基础 + US4 基础）

1. ✅ Phase 2：异常处理系统（US3 基础）
2. ✅ Phase 3.1：Fastify + 缓存（US1）
3. ✅ Phase 3.2：数据隔离（US2）
4. ✅ Phase 3：日志基础（US4 基础）

**交付**: 核心功能可用，可以开始在项目中使用

### 增量交付

**v0.2.0**: US1 + US2 完整

- ✅ Phase 4.1：缓存监控

**v0.3.0**: US3 + US4 完整

- ✅ Phase 4.2：日志增强

**v1.0.0**: 所有用户故事完成

- ✅ Phase 5：配置管理（US5）
- ✅ Phase 6-7：优化和文档

---

## 每个用户故事的任务数量

| 用户故事 | 优先级 | 任务数 | 预计时间 |
|---------|-------|-------|---------|
| Setup（项目初始化） | - | 8 | 1-2天 |
| Phase 2（基础设施 - US3基础） | P0 | 14 | 3-5天 |
| US1（性能优化） | P1 | 13 | 4-6天 |
| US2（数据隔离） | P1 | 12 | 5-7天 |
| US4（日志基础） | P2 | 2 | 1-2天 |
| US3（异常增强） | P2 | 1 | 1天 |
| US4（日志增强） | P2 | 2 | 1-2天 |
| US5（配置管理） | P3 | 7 | 5-7天 |
| 优化和文档 | - | 9 | 2-3天 |
| **总计** | - | **68** | **22-37天** |

---

## 独立测试标准

### US1 - 应用性能优化

**测试工具**: Apache Bench、k6

**验证标准**:

- ✅ 1000 并发请求，99% 在 100ms 内响应
- ✅ 缓存命中后响应时间减少 80%+
- ✅ 缓存自动失效和刷新

### US2 - 多层级数据隔离

**测试场景**: 多租户、多组织、多部门测试数据

**验证标准**:

- ✅ 租户间完全隔离
- ✅ 组织级非共享数据隔离
- ✅ 部门级非共享数据隔离
- ✅ 共享数据在正确范围内可访问
- ✅ 平台级数据支持

### US3 - 统一错误处理

**测试方法**: 触发各类错误场景

**验证标准**:

- ✅ 错误响应格式一致（RFC7807）
- ✅ 包含错误码、标题、详情
- ✅ 不暴露敏感信息

### US4 - 结构化日志

**测试方法**: 执行业务操作，检查日志

**验证标准**:

- ✅ 日志包含完整上下文（租户、组织、部门、用户）
- ✅ 结构化格式（JSON）
- ✅ 可搜索、可过滤

### US5 - 灵活配置管理

**测试方法**: 修改配置文件和环境变量

**验证标准**:

- ✅ 配置正确加载
- ✅ 环境变量覆盖
- ✅ 配置验证失败时应用启动失败
- ✅ 类型安全性

---

## 关键里程碑

| 里程碑 | 完成标志 | 预计时间 |
|--------|---------|---------|
| M1: 异常处理可用 | Phase 2 完成，可抛出统一异常 | 第1周 |
| M2: MVP 可用 | Phase 3 完成，核心功能可用 | 第3周 |
| M3: 功能完整 | Phase 5 完成，所有用户故事实现 | 第5-6周 |
| M4: 生产就绪 | Phase 7 完成，文档齐全，测试覆盖率 ≥ 80% | 第6-7周 |

---

## 风险和缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 旧代码迁移问题 | 高 | 保留 backup/ 作为参考，逐模块迁移 |
| 异常处理阻塞其他模块 | 高 | Phase 2 优先完成异常处理（P0） |
| TypeScript 严格模式问题 | 中 | 逐步启用，先通过编译再提高覆盖率 |
| 测试覆盖率不足 | 中 | 每个任务都包含单元测试，目标 ≥ 80% |

---

## 质量门禁

**每个 Phase 结束时必须满足**：

- ✅ 所有任务的单元测试通过
- ✅ 相关集成测试通过
- ✅ ESLint 检查通过（零错误）
- ✅ TypeScript 类型检查通过
- ✅ 代码覆盖率 ≥ 80%（核心模块 ≥ 90%）
- ✅ 所有公共 API 有完整的 TSDoc 中文注释

---

**任务列表创建完成！** 🎉

**立即可开始**: Phase 1（项目初始化）

**下一步行动**:

1. 执行 T001-T008 初始化项目
2. 执行 Phase 2 实现异常处理系统
3. 执行 Phase 3 实现核心功能
