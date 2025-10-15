# 重叠内容处理策略

**文档版本**: 1.0  
**创建日期**: 2025-01-27  
**负责人**: HL8 开发团队

## 重叠内容概览

根据重叠内容分析工具的结果，发现以下重叠项目：

1. **TenantId** (class + entity-id)
2. **UserId** (class + entity-id)

## 处理策略

### 策略原则

1. **统一到 isolation-model**: 保留 isolation-model 中的实现，因为：
   - 使用了 Flyweight 模式，内存效率更高
   - 有更好的类型安全性（泛型支持）
   - 错误处理更完善
   - 代码结构更清晰

2. **移除 hybrid-archi 中的重复实现**: 删除 hybrid-archi 中的重复值对象

3. **建立依赖关系**: hybrid-archi 依赖 isolation-model 的值对象

### 具体处理方案

#### 1. TenantId 处理

**保留**: `libs/isolation-model/src/value-objects/tenant-id.vo.ts`  
**移除**: `libs/hybrid-archi/src/domain/value-objects/ids/tenant-id.vo.ts`

**理由**:

- isolation-model 的实现使用了 Flyweight 模式
- 有更好的内存管理和性能
- 类型安全性更好

#### 2. UserId 处理

**保留**: `libs/isolation-model/src/value-objects/user-id.vo.ts`  
**移除**: `libs/hybrid-archi/src/domain/value-objects/ids/user-id.vo.ts`

**理由**: 同上

#### 3. EntityId 基类处理

**保留**: `libs/isolation-model/src/value-objects/entity-id.vo.ts`  
**移除**: `libs/hybrid-archi/src/domain/value-objects/entity-id.ts`

**理由**:

- isolation-model 的实现更完整
- 有更好的错误处理机制
- 支持泛型类型安全

## 执行步骤

### 步骤 1: 更新依赖关系

1. 在 `libs/hybrid-archi/package.json` 中添加对 `@hl8/isolation-model` 的依赖
2. 在 `libs/hybrid-archi/tsconfig.json` 中添加路径映射

### 步骤 2: 移除重复文件

1. 删除 `libs/hybrid-archi/src/domain/value-objects/ids/tenant-id.vo.ts`
2. 删除 `libs/hybrid-archi/src/domain/value-objects/ids/user-id.vo.ts`
3. 删除 `libs/hybrid-archi/src/domain/value-objects/entity-id.ts`

### 步骤 3: 更新导入语句

1. 更新 `libs/hybrid-archi/src/domain/value-objects/ids/index.ts`
2. 更新所有引用这些值对象的文件

### 步骤 4: 更新导出

1. 更新 `libs/hybrid-archi/src/index.ts` 中的导出
2. 从 hybrid-archi 的导出中移除重复的值对象

### 步骤 5: 验证和测试

1. 运行构建测试
2. 运行单元测试
3. 验证功能正常

## 风险评估

### 低风险

- isolation-model 的实现已经经过测试
- 两个实现功能相同，只是内部结构不同

### 缓解措施

- 完整的测试覆盖
- 逐步迁移，分步验证
- 保留备份文件

## 验收标准

1. ✅ 构建成功，无编译错误
2. ✅ 所有测试通过
3. ✅ 功能行为保持一致
4. ✅ 模块边界清晰
5. ✅ 依赖关系正确

## 后续维护

1. 建立清晰的模块职责文档
2. 避免未来出现类似重叠
3. 统一命名规范
4. 定期检查模块边界

## 相关文档

- [重叠内容详细分析报告](../tools/overlap-analysis-detailed.md)
- [模块职责划分文档](./module-responsibilities.md)
- [架构设计文档](./architecture-design.md)
