# 方案 B：集成测试计划

**目标**: 从 61% 提升到 ~76% 覆盖率（+15%）  
**方法**: 添加 NestJS 集成测试，覆盖框架集成代码  
**预计**: 增加 ~75 个测试用例

---

## 测试策略

### 未覆盖模块分析（40% 代码）

| 模块类型            | 占比 | 当前覆盖率 | 目标覆盖率 | 测试方法         |
| ------------------- | ---- | ---------- | ---------- | ---------------- |
| **NestJS 动态模块** | ~15% | 0-27%      | 80%+       | 模块加载测试     |
| **AOP 装饰器**      | ~8%  | 0%         | 90%+       | 装饰器应用测试   |
| **中间件/守卫**     | ~5%  | 0-27%      | 85%+       | HTTP 上下文测试  |
| **HTTP 适配器**     | ~12% | 2%         | 60%+       | Fastify 集成测试 |

---

## Phase 1: NestJS 动态模块集成测试（预计 +8%）

### IT001 - ExceptionModule 集成测试 ✅

**文件**: `__tests__/integration/exception-module.integration.spec.ts`

**测试场景**（12 个测试）:

- ✅ forRoot 同步配置
- ✅ forRootAsync 异步配置
- ✅ 自定义消息提供者
- ✅ Filter 自动注册
- ✅ 多个异常处理流程

**预期覆盖**: exception.module.ts: 0% → 80%

---

### IT002 - CachingModule 集成测试

**文件**: `__tests__/integration/caching-module.integration.spec.ts`

**测试场景**（15 个测试）:

- forRoot 同步配置
- forRootAsync 异步配置
  - useFactory
  - useClass
  - useExisting
- Redis 连接配置
- ConfigValidator 集成
- 服务注入和使用
- 模块多次导入

**预期覆盖**: cache.module.ts: 27% → 85%

---

### IT003 - IsolationModule 集成测试

**文件**: `__tests__/integration/isolation-module.integration.spec.ts`

**测试场景**（12 个测试）:

- forRoot 配置
- ClsModule 集成
- Middleware 自动应用
- Guard 注册
- 服务依赖注入
- 多租户上下文传播

**预期覆盖**: isolation.module.ts: 66% → 90%

---

### IT004 - LoggingModule 集成测试

**文件**: `__tests__/integration/logging-module.integration.spec.ts`

**测试场景**（10 个测试）:

- forRoot 配置
- ConfigValidator 集成
- Fastify Pino 复用检测
- 日志级别配置
- 服务注入和使用

**预期覆盖**: logger.module.ts: 27% → 85%

---

### IT005 - TypedConfigModule 集成测试 ✅

**文件**: `__tests__/configuration/config-integration.spec.ts`

**测试场景**（14 个测试）:

- ✅ 文件加载
- ✅ 环境变量覆盖
- ✅ 验证失败
- ✅ 类型安全
- ✅ 缓存集成
- ✅ 验证器集成
- ✅ 多加载器
- ✅ 异步配置

**预期覆盖**: typed-config.module.ts: 95% → 100%

---

## Phase 2: AOP 装饰器集成测试（预计 +4%）

### IT006 - @Cacheable 装饰器集成测试

**文件**: `__tests__/integration/cacheable-decorator.integration.spec.ts`

**测试场景**（8 个测试）:

- 方法结果缓存
- TTL 配置
- 缓存键生成
- 缓存命中/未命中
- 异步方法支持
- 隔离上下文集成
- 错误处理

**预期覆盖**: cacheable.decorator.ts: 0% → 90%

---

### IT007 - @CacheEvict 装饰器集成测试

**文件**: `__tests__/integration/cache-evict-decorator.integration.spec.ts`

**测试场景**（6 个测试）:

- 单个键驱逐
- 模式驱逐
- 全部清除（allEntries: true）
- 前置/后置驱逐
- 错误处理

**预期覆盖**: cache-evict.decorator.ts: 0% → 90%

---

### IT008 - @CachePut 装饰器集成测试

**文件**: `__tests__/integration/cache-put-decorator.integration.spec.ts`

**测试场景**（6 个测试）:

- 强制更新缓存
- TTL 配置
- 条件更新
- 异步方法
- 错误处理

**预期覆盖**: cache-put.decorator.ts: 0% → 90%

---

## Phase 3: 中间件和守卫集成测试（预计 +3%）

### IT009 - IsolationExtractionMiddleware 集成测试

**文件**: `__tests__/integration/isolation-middleware.integration.spec.ts`

**测试场景**（10 个测试）:

- HTTP 请求头提取
- 5 级隔离 ID 提取
- UUID 验证
- ClsService 集成
- 请求上下文传播
- 错误处理
- 大小写不敏感
- 平台级数据（无隔离 ID）

**预期覆盖**: isolation-extraction.middleware.ts: 26% → 90%

---

### IT010 - IsolationGuard 集成测试

**文件**: `__tests__/integration/isolation-guard.integration.spec.ts`

**测试场景**（8 个测试）:

- Reflector 元数据读取
- 隔离级别验证
- 上下文验证
- 访问控制
- @RequireIsolationLevel 装饰器集成
- 错误抛出

**预期覆盖**: isolation.guard.ts: 31% → 85%

---

## Phase 4: Fastify 适配器测试（可选，预计 +2%）

### IT011 - EnterpriseFastifyAdapter 集成测试（可选）

**文件**: `__tests__/integration/fastify-adapter.integration.spec.ts`

**测试场景**（10 个测试）:

- CORS 配置
- 安全头
- 速率限制
- 健康检查端点
- 性能监控
- 插件注册
- 错误处理

**注意**: 需要启动完整 HTTP 服务器，建议放在 E2E 测试中

**预期覆盖**: enterprise-fastify.adapter.ts: 2% → 60%

---

## 预期成果

### 覆盖率提升

| 阶段         | Statements | Branches | Functions | Lines   | 新增测试 |
| ------------ | ---------- | -------- | --------- | ------- | -------- |
| **当前**     | 61.08%     | 53.87%   | 58.11%    | 61.85%  | 257      |
| **+Phase 1** | 69%        | 60%      | 65%       | 69%     | +54      |
| **+Phase 2** | 73%        | 63%      | 70%       | 73%     | +20      |
| **+Phase 3** | 76%        | 66%      | 74%       | 76%     | +18      |
| **目标**     | **76%**    | **66%**  | **74%**   | **76%** | **~349** |

### 测试套件统计

- **当前**: 24 个测试套件，257 个测试
- **新增**: 10 个集成测试套件，~92 个测试
- **总计**: 34 个测试套件，~349 个测试

---

## 实施顺序

### 优先级 1：NestJS 动态模块（IT002-IT004）

影响最大，覆盖率提升 +8%

### 优先级 2：AOP 装饰器（IT006-IT008）

用户常用功能，覆盖率提升 +4%

### 优先级 3：中间件/守卫（IT009-IT010）

关键业务逻辑，覆盖率提升 +3%

### 可选：Fastify 适配器（IT011）

建议移到 E2E 测试

---

## 执行计划

1. **IT002-IT004**: CachingModule, IsolationModule, LoggingModule（3-4 小时）
2. **IT006-IT008**: 缓存装饰器测试（2-3 小时）
3. **IT009-IT010**: 中间件/守卫测试（1-2 小时）

**总预计时间**: 6-9 小时

---

## 成功标准

✅ 覆盖率达到 76% 以上  
✅ 所有集成测试通过  
✅ 核心业务逻辑 >90% 覆盖  
✅ CI/CD 测试时间 <10 秒
