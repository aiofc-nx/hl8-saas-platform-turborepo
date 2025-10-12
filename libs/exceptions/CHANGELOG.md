# Changelog

## [0.1.0] - 2025-10-12

### 新增功能

#### 核心异常类

- `AbstractHttpException`: 符合 RFC7807 标准的异常基类
- `GeneralBadRequestException`: 400 错误（请求无效）
- `GeneralNotFoundException`: 404 错误（资源未找到）
- `GeneralInternalServerException`: 500 错误（服务器内部错误）
- `InvalidIsolationContextException`: 无效隔离上下文异常
- `TenantNotFoundException`: 租户未找到异常
- `UnauthorizedOrganizationException`: 未授权组织异常

#### 异常过滤器

- `HttpExceptionFilter`: HTTP 异常过滤器
  - 自动捕获 `AbstractHttpException` 类型的异常
  - 转换为 RFC7807 标准格式
  - 支持自定义消息提供器
  - 集成日志服务（4xx 为 warn，5xx 为 error）
  
- `AnyExceptionFilter`: 通用异常过滤器
  - 捕获所有未处理的异常
  - 自动转换为 500 错误
  - 生产环境自动脱敏
  - 开发环境包含详细堆栈信息

#### 消息提供器

- `ExceptionMessageProvider`: 消息提供器接口
- `DefaultMessageProvider`: 默认消息提供器实现
  - 支持自定义错误消息
  - 支持多语言（i18n）

#### 模块配置

- `ExceptionModule`: 异常处理模块
  - 支持同步配置（`forRoot`）
  - 支持异步配置（`forRootAsync`）
  - 可选注入日志服务
  - 可选注入消息提供器
  - 可配置生产环境模式
  - 可选注册全局过滤器

### 技术特性

- ✅ 完整的 TypeScript 类型定义
- ✅ ES Module 支持
- ✅ 符合 RFC7807 标准
- ✅ 完整的 TSDoc 注释（中文）
- ✅ 单元测试覆盖率 > 75%
- ✅ NestJS 10+ 兼容

### 文档

- README.md：完整的使用说明和 API 文档
- CHANGELOG.md：版本变更日志
- 完整的 TSDoc 注释

### 依赖

- @nestjs/common: ^10.0.0
- @nestjs/core: ^10.0.0
- rxjs: ^7.8.0

---

**注**: 这是初始版本，从 `@hl8/nestjs-infra` 拆分而来。
