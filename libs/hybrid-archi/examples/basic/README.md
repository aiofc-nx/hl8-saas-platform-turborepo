# 基础示例

本目录包含 hybrid-archi 的基础使用示例，帮助你快速理解核心概念。

## 📚 示例列表

1. **值对象示例** (`value-object.example.ts`)
   - 展示如何创建不可变的值对象
   - 展示值对象的相等性比较
   - 展示值对象的验证逻辑

2. **实体示例** (`entity.example.ts`)
   - 展示如何创建充血模型的实体
   - 展示实体的业务方法
   - 展示实体的生命周期管理

3. **聚合根示例** (`aggregate-root.example.ts`)
   - 展示如何创建聚合根
   - 展示聚合根管理一致性边界
   - 展示领域事件的发布

4. **领域事件示例** (`domain-event.example.ts`)
   - 展示如何定义领域事件
   - 展示事件的元数据管理

## 🚀 运行示例

```bash
# 运行所有基础示例
ts-node examples/basic/value-object.example.ts
ts-node examples/basic/entity.example.ts
ts-node examples/basic/aggregate-root.example.ts
ts-node examples/basic/domain-event.example.ts
```

## 📖 学习路径

建议按以下顺序学习：

1. 值对象 → 理解不可变性和验证
2. 实体 → 理解充血模型和业务逻辑
3. 聚合根 → 理解一致性边界和事件
4. 领域事件 → 理解事件驱动架构
