# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-12

### 🎉 首次发布

完整实现企业级 NestJS 缓存库，支持自动多层级数据隔离。

### ✨ Added

#### 核心功能

- **CachingModule**: NestJS 动态模块，支持同步和异步配置
- **CacheService**: 核心缓存服务（get, set, del, exists, clear）
- **RedisService**: Redis 连接管理（连接池、自动重连、健康检查）
- **CacheMetricsService**: 性能监控服务（命中率、延迟统计）

#### 装饰器

- **@Cacheable**: 自动缓存方法返回值
  - 支持自定义键生成器
  - 支持自定义 TTL
  - 支持条件缓存
  - 支持 null 值缓存
- **@CacheEvict**: 自动清除缓存
  - 支持单键清除
  - 支持批量清除（allEntries）
  - 支持执行前/后清除
  - 支持条件清除
- **@CachePut**: 强制更新缓存
  - 始终执行方法
  - 自动更新缓存

#### 领域模型

- **CacheKey**: 值对象，封装缓存键生成逻辑
  - 自动组合隔离上下文
  - 支持模式匹配（\*）
  - 键长度限制（256字符）
- **CacheEntry**: 值对象，封装缓存条目
  - 自动序列化/反序列化
  - TTL 管理
  - 过期检测

#### 工具函数

- **serialize/deserialize**: 序列化工具
  - 支持基本类型
  - 支持 Date 对象
  - 支持 RegExp 对象
  - 循环引用检测
- **generateKey/sanitizeKey/isValidKey**: 键生成工具
  - 自动清理非法字符
  - 键验证
  - 模式生成

#### 多层级隔离

- 支持 5 级隔离：Platform/Tenant/Organization/Department/User
- 自动从 CLS 读取隔离上下文
- 零侵入式设计

#### 性能优化

- Flyweight 模式（ID 值对象）
- 批量操作（Redis SCAN）
- 连接池管理
- 实时性能监控

#### 类型安全

- TypeScript strict mode
- 完整的类型定义
- 泛型支持

### 📚 Documentation

- [x] 架构设计文档 (ARCHITECTURE.md)
- [x] API 参考文档 (API.md)
- [x] README.md
- [x] CHANGELOG.md

### 🧪 Testing

- 140 个单元测试（100% 通过）
- 监控模块：100% 覆盖率
- 工具模块：89.47% 覆盖率
- 领域层：78.94% 覆盖率

### 📦 Dependencies

- **@hl8/isolation-model**: ^1.0.0（零依赖领域模型）
- **ioredis**: ^5.4.2（Redis 客户端）
- **nestjs-cls**: ^6.0.1（CLS 管理）

### 🏗️ Architecture

- Clean Architecture + DDD
- 充血模型（Rich Domain Model）
- AOP（面向切面编程）
- 工厂方法模式
- 策略模式
- 装饰器模式

---

## [Unreleased]

### Planned

- [ ] Prometheus metrics exporter
- [ ] 集成测试示例
- [ ] 更多序列化后端（MessagePack）
- [ ] 更多存储后端（Memcached）

---

## 版本说明

### 版本号规则

遵循 [Semantic Versioning](https://semver.org/)：

- **Major (1.x.x)**: 破坏性变更
- **Minor (x.1.x)**: 新增功能（向后兼容）
- **Patch (x.x.1)**: Bug 修复（向后兼容）

### 发布周期

- **Major**: 根据需要
- **Minor**: 每月一次
- **Patch**: 根据需要

---

## 贡献指南

查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解如何贡献。

---

## License

MIT

[1.0.0]: https://github.com/your-org/hl8/releases/tag/nestjs-caching-v1.0.0
[Unreleased]: https://github.com/your-org/hl8/compare/nestjs-caching-v1.0.0...HEAD
