# 重叠内容详细分析报告

**生成时间**: 2025-10-14T18:47:56.200Z  
**分析工具**: analyze-overlap.js

## 概览

- **hybrid-archi 项目数**: 749
- **isolation-model 项目数**: 19
- **重叠项目数**: 4

## 重叠内容详情

### TenantId (class)

**hybrid-archi 位置**: `libs/hybrid-archi/src/domain/value-objects/ids/tenant-id.vo.ts`

```typescript
export class TenantId
```

**isolation-model 位置**: `libs/isolation-model/src/value-objects/entity-id.vo.ts`

```typescript
export class TenantId
```

**建议处理方案**:

- 如果两个实现完全相同，建议统一到 isolation-model
- 如果实现不同，需要评估哪个更符合业务需求
- 考虑将通用实现移到 hybrid-archi，业务特定实现保留在 isolation-model

---

### TenantId (entity-id)

**hybrid-archi 位置**: `libs/hybrid-archi/src/domain/value-objects/ids/tenant-id.vo.ts`

```typescript
export class TenantId
```

**isolation-model 位置**: `libs/isolation-model/src/value-objects/entity-id.vo.ts`

```typescript
export class TenantId
```

**建议处理方案**:

- 如果两个实现完全相同，建议统一到 isolation-model
- 如果实现不同，需要评估哪个更符合业务需求
- 考虑将通用实现移到 hybrid-archi，业务特定实现保留在 isolation-model

---

### UserId (class)

**hybrid-archi 位置**: `libs/hybrid-archi/src/domain/value-objects/ids/user-id.vo.ts`

```typescript
export class UserId
```

**isolation-model 位置**: `libs/isolation-model/src/value-objects/user-id.vo.ts`

```typescript
export class UserId
```

**建议处理方案**:

- 如果两个实现完全相同，建议统一到 isolation-model
- 如果实现不同，需要评估哪个更符合业务需求
- 考虑将通用实现移到 hybrid-archi，业务特定实现保留在 isolation-model

---

### UserId (entity-id)

**hybrid-archi 位置**: `libs/hybrid-archi/src/domain/value-objects/ids/user-id.vo.ts`

```typescript
export class UserId
```

**isolation-model 位置**: `libs/isolation-model/src/value-objects/user-id.vo.ts`

```typescript
export class UserId
```

**建议处理方案**:

- 如果两个实现完全相同，建议统一到 isolation-model
- 如果实现不同，需要评估哪个更符合业务需求
- 考虑将通用实现移到 hybrid-archi，业务特定实现保留在 isolation-model

---

## 模块内容统计

### hybrid-archi 项目类型分布

- **class**: 739 个
- **value-object**: 8 个
- **entity-id**: 2 个

### isolation-model 项目类型分布

- **class**: 16 个
- **entity-id**: 3 个

## 建议

1. **立即处理重叠内容**: 重叠的 4 个项目需要明确归属
2. **建立清晰的模块边界**: 确保每个模块的职责明确
3. **统一命名规范**: 避免未来出现类似重叠
4. **文档化模块职责**: 为每个模块建立清晰的职责文档

## 下一步行动

1. 评估每个重叠项目的业务重要性
2. 决定保留哪个实现
3. 更新相关依赖和导入
4. 运行测试确保功能正常
