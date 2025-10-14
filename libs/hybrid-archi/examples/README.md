# hybrid-archi 示例代码

本目录包含 `@hl8/hybrid-archi` 模块的完整示例代码，帮助你快速掌握混合架构的开发模式。

## 📚 示例目录

### 1. 基础示例 (`basic/`)

展示核心概念的基础使用：

- **值对象示例** - Email、Money、Address
- **实体示例** - Product、Customer（充血模型）
- **聚合根示例** - Order、订单管理
- **领域事件示例** - 事件定义和发布

**适合人群**：刚接触 hybrid-archi 的开发者

```bash
cd examples/basic
ts-node value-object.example.ts
ts-node entity.example.ts
```

### 2. CQRS 示例 (`cqrs/`)

展示命令查询职责分离模式：

- **命令示例** - 创建、更新、删除命令
- **查询示例** - 查询处理和结果返回
- **事件处理器示例** - 事件订阅和处理
- **Saga 示例** - 分布式事务编排

**适合人群**：需要理解 CQRS 模式的开发者

```bash
cd examples/cqrs
ts-node command.example.ts
ts-node query.example.ts
```

### 3. 事件溯源示例 (`event-sourcing/`)

展示事件溯源模式：

- **事件存储示例** - 事件持久化
- **状态重建示例** - 从事件流重建聚合状态
- **快照示例** - 快照机制和性能优化
- **事件版本管理** - 事件版本控制

**适合人群**：需要实现事件溯源的开发者

```bash
cd examples/event-sourcing
ts-node event-store.example.ts
ts-node snapshot.example.ts
```

### 4. 完整业务示例 (`complete/user-management/`)

展示完整的用户管理业务模块：

- **完整的领域层** - 实体、聚合根、值对象、事件
- **完整的应用层** - 用例、CQRS、服务
- **完整的基础设施层** - 仓储实现、适配器
- **完整的接口层** - REST API、守卫、装饰器

**适合人群**：需要开发完整业务模块的开发者

```bash
cd examples/complete/user-management
nx serve user-management
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8
- TypeScript >= 5

### 运行示例

```bash
# 1. 安装依赖
pnpm install

# 2. 运行基础示例
cd packages/hybrid-archi/examples/basic
ts-node value-object.example.ts

# 3. 运行CQRS示例
cd ../cqrs
ts-node command.example.ts

# 4. 运行完整业务示例
cd ../complete/user-management
nx serve user-management
```

## 📖 学习路径

建议按以下顺序学习示例：

```
1. 基础示例 (basic/)
   ├── 值对象 → 理解不可变性
   ├── 实体 → 理解充血模型
   ├── 聚合根 → 理解一致性边界
   └── 领域事件 → 理解事件驱动

2. CQRS 示例 (cqrs/)
   ├── 命令 → 理解写操作
   ├── 查询 → 理解读操作
   ├── 事件 → 理解异步处理
   └── Saga → 理解分布式事务

3. 事件溯源示例 (event-sourcing/)
   ├── 事件存储 → 理解事件持久化
   ├── 状态重建 → 理解事件重放
   ├── 快照 → 理解性能优化
   └── 版本管理 → 理解事件演化

4. 完整业务示例 (complete/)
   └── 用户管理 → 理解完整业务流程
```

## 💡 示例特点

### ✅ 完整性

- 每个示例都是完整可运行的代码
- 包含详细的注释和说明
- 展示最佳实践和常见模式

### ✅ 渐进式

- 从简单到复杂，循序渐进
- 每个示例都建立在前一个基础上
- 适合不同层次的开发者

### ✅ 实用性

- 基于真实的业务场景
- 展示常见问题的解决方案
- 可以直接用于生产项目

## 📋 示例对照表

| 示例 | 难度 | 时间 | 学到的概念 |
|------|------|------|-----------|
| 值对象示例 | ⭐ | 15分钟 | 不可变性、验证 |
| 实体示例 | ⭐⭐ | 20分钟 | 充血模型、业务逻辑 |
| 聚合根示例 | ⭐⭐ | 25分钟 | 一致性边界、事件 |
| 命令示例 | ⭐⭐⭐ | 30分钟 | CQRS、命令处理 |
| 查询示例 | ⭐⭐⭐ | 30分钟 | 读写分离、查询优化 |
| 事件溯源示例 | ⭐⭐⭐⭐ | 45分钟 | 事件存储、状态重建 |
| 完整业务示例 | ⭐⭐⭐⭐⭐ | 2小时 | 完整架构、最佳实践 |

## 🔍 常见问题

### Q1: 示例代码可以用于生产环境吗？

**A**: 示例代码展示了正确的设计模式和最佳实践，但需要根据你的具体业务需求进行调整。建议：

- ✅ 学习和理解示例中的设计模式
- ✅ 根据实际需求调整业务逻辑
- ✅ 添加完整的错误处理和日志
- ✅ 进行充分的测试

### Q2: 如何调试示例代码？

**A**: 使用以下方法调试：

```bash
# 方法 1: 使用 ts-node 直接运行
ts-node --inspect examples/basic/value-object.example.ts

# 方法 2: 使用 VSCode 调试
# 在 .vscode/launch.json 中添加调试配置

# 方法 3: 编译后运行
tsc examples/basic/value-object.example.ts
node examples/basic/value-object.example.js
```

### Q3: 示例之间有依赖关系吗？

**A**: 示例按复杂度递增，但每个示例都是独立的：

- ✅ 每个示例都可以单独运行
- ✅ 基础示例提供了可复用的组件
- ✅ 后续示例会引用基础示例中的代码

## 🤝 贡献示例

欢迎贡献新的示例！请遵循以下规范：

1. **示例结构**：
   - 包含完整的代码和注释
   - 提供 README 说明
   - 添加运行说明

2. **代码质量**：
   - 遵循项目代码规范
   - 包含单元测试
   - 通过 lint 检查

3. **文档**：
   - 清晰的注释
   - 详细的说明
   - 运行截图（可选）

## 📞 获取帮助

如果在运行示例时遇到问题：

1. 查看示例目录中的 README
2. 检查控制台错误信息
3. 查看主项目文档
4. 提交 Issue

---

**祝学习愉快！** 🎉
