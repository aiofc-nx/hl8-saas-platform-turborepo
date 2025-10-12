# 003-exceptions-split - Exceptions 模块拆分规范

## 1. 项目概述

### 1.1 项目目标

将 `libs/nestjs-infra/src/exceptions` 模块拆分为独立的库项目 `@hl8/nestjs-exceptions`，实现异常处理功能的独立维护和复用。

### 1.2 业务背景

- **现状**: Exceptions 模块当前位于 `libs/nestjs-infra/src/exceptions`，与其他基础设施功能耦合在一起
- **问题**: 不便于独立维护、测试和版本管理
- **目标**: 拆分为独立的库，提供统一的异常处理机制，遵循 RFC7807 标准

### 1.3 核心价值

1. **独立性**: 作为独立库可以单独维护和发布
2. **复用性**: 可以在多个项目中复用
3. **可测试性**: 独立的测试套件，覆盖率 > 90%
4. **可维护性**: 清晰的目录结构和完整的文档

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 异常基类

- **AbstractHttpException**: 所有业务异常的基类
  - 支持 RFC7807 格式
  - 支持元数据和堆栈跟踪
  - 支持序列化

#### 2.1.2 标准异常类

- **GeneralBadRequestException**: 400 错误
- **GeneralNotFoundException**: 404 错误
- **GeneralInternalServerException**: 500 错误
- **InvalidIsolationContextException**: 无效隔离上下文
- **TenantNotFoundException**: 租户未找到
- **UnauthorizedOrganizationException**: 未授权的组织

#### 2.1.3 异常过滤器

- **HttpExceptionFilter**: HTTP 异常过滤器
  - 捕获所有 HttpException
  - 转换为 RFC7807 格式
  - 支持日志记录
  
- **AnyExceptionFilter**: 通用异常过滤器
  - 捕获所有未处理的异常
  - 自动转换为 500 错误
  - 生产环境自动脱敏

#### 2.1.4 消息提供器

- **ExceptionMessageProvider**: 消息提供器接口
- **DefaultMessageProvider**: 默认消息提供器实现
  - 支持多语言（i18n）
  - 支持错误码映射

### 2.2 配置能力

#### 2.2.1 模块配置

```typescript
interface ExceptionModuleOptions {
  enableLogging?: boolean;           // 是否启用日志
  logger?: ILoggerService;           // 自定义日志服务
  messageProvider?: ExceptionMessageProvider;  // 自定义消息提供器
  isProduction?: boolean;            // 生产环境标志
  registerGlobalFilters?: boolean;   // 是否注册全局过滤器
}
```

#### 2.2.2 支持异步配置

- 支持 `forRoot()`：同步配置
- 支持 `forRootAsync()`：异步配置（useFactory/useClass/useExisting）

## 3. 技术规范

### 3.1 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5.7+
- **框架**: NestJS 10+
- **测试**: Jest + ES Module
- **编译**: SWC
- **标准**: RFC7807（Problem Details for HTTP APIs）

### 3.2 依赖关系

#### 3.2.1 外部依赖

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "rxjs": "^7.8.0"
  }
}
```

#### 3.2.2 内部依赖

- **无内部依赖**: 作为基础库，不依赖其他 `@hl8/*` 包

### 3.3 目录结构

```
libs/nestjs-exceptions/
├── src/
│   ├── core/                         # 核心异常类
│   │   ├── abstract-http.exception.ts
│   │   ├── abstract-http.exception.spec.ts
│   │   ├── general-bad-request.exception.ts
│   │   ├── general-not-found.exception.ts
│   │   ├── general-internal-server.exception.ts
│   │   ├── invalid-isolation-context.exception.ts
│   │   ├── tenant-not-found.exception.ts
│   │   └── unauthorized-organization.exception.ts
│   ├── filters/                      # 异常过滤器
│   │   ├── http-exception.filter.ts
│   │   ├── http-exception.filter.spec.ts
│   │   ├── any-exception.filter.ts
│   │   └── any-exception.filter.spec.ts
│   ├── providers/                    # 消息提供器
│   │   ├── exception-message.provider.ts
│   │   ├── default-message.provider.ts
│   │   └── default-message.provider.spec.ts
│   ├── config/                       # 配置
│   │   └── exception.config.ts
│   ├── exception.module.ts           # 异常模块
│   └── index.ts                      # 导出
├── package.json
├── tsconfig.json
├── jest.config.ts
├── README.md
└── CHANGELOG.md
```

### 3.4 API 设计

#### 3.4.1 模块导入

```typescript
// 同步配置
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: false,
    }),
  ],
})
export class AppModule {}

// 异步配置
@Module({
  imports: [
    ExceptionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        enableLogging: config.get('LOGGING_ENABLED'),
        isProduction: config.get('NODE_ENV') === 'production',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

#### 3.4.2 异常使用

```typescript
// 抛出标准异常
throw new GeneralBadRequestException('Invalid input');

// 抛出自定义异常
class CustomException extends AbstractHttpException {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, 'CUSTOM_ERROR', message);
  }
}
```

## 4. 实施计划

### 4.1 拆分阶段

#### Phase 1: 项目初始化

- [x] 创建新分支 `003-exceptions-split`
- [ ] 创建库项目结构 `libs/nestjs-exceptions`
- [ ] 配置 `package.json`
- [ ] 配置 `tsconfig.json`
- [ ] 配置 `jest.config.ts`

#### Phase 2: 代码迁移

- [ ] 迁移核心异常类（core/）
- [ ] 迁移异常过滤器（filters/）
- [ ] 迁移消息提供器（providers/）
- [ ] 迁移配置（config/）
- [ ] 迁移模块定义（exception.module.ts）
- [ ] 创建导出文件（index.ts）

#### Phase 3: 测试迁移

- [ ] 迁移所有单元测试
- [ ] 更新测试导入路径
- [ ] 确保所有测试通过

#### Phase 4: 文档和构建

- [ ] 编写 README.md
- [ ] 编写 CHANGELOG.md
- [ ] 执行构建和类型检查
- [ ] 验证导出

#### Phase 5: 依赖更新

- [ ] 更新 `pnpm-workspace.yaml`
- [ ] 更新依赖此模块的项目
- [ ] 验证集成

#### Phase 6: 清理和验证

- [ ] 删除旧代码（libs/nestjs-infra/src/exceptions）
- [ ] 更新 `libs/nestjs-infra` 导出
- [ ] 全局测试
- [ ] 提交和推送

### 4.2 测试策略

#### 4.2.1 单元测试

- 异常类测试（7 个）
- 过滤器测试（2 个）
- 消息提供器测试（1 个）
- 模块配置测试（1 个）

#### 4.2.2 覆盖率目标

- 分支覆盖率: ≥ 90%
- 函数覆盖率: ≥ 90%
- 行覆盖率: ≥ 90%
- 语句覆盖率: ≥ 90%

## 5. 验收标准

### 5.1 功能验收

- [ ] 所有核心异常类正常工作
- [ ] 异常过滤器正确捕获和转换异常
- [ ] 消息提供器正常工作
- [ ] 模块配置正确应用

### 5.2 质量验收

- [ ] 所有单元测试通过（覆盖率 ≥ 90%）
- [ ] 编译无错误
- [ ] ESLint 无警告
- [ ] 完整的 TSDoc 注释（中文）

### 5.3 文档验收

- [ ] README.md 完整
- [ ] CHANGELOG.md 完整
- [ ] API 文档完整
- [ ] 示例代码可运行

### 5.4 集成验收

- [ ] 在 `apps/fastify-api` 中集成验证
- [ ] 所有端点正常工作
- [ ] 异常处理符合预期

## 6. 风险和注意事项

### 6.1 技术风险

1. **依赖风险**: 确保所有依赖项正确配置
2. **类型兼容性**: 确保 TypeScript 类型完全兼容
3. **ES Module 兼容**: 确保 Jest 配置支持 ES Module

### 6.2 业务风险

1. **功能缺失**: 确保迁移后功能完整
2. **性能影响**: 验证无性能回归
3. **向后兼容**: 确保现有代码无需修改

## 7. 成功指标

1. ✅ 独立库成功创建
2. ✅ 所有测试通过（覆盖率 ≥ 90%）
3. ✅ 应用集成验证通过
4. ✅ 文档完整
5. ✅ 宪章 100% 合规
