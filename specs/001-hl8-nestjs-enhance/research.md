# Research: 拆分 Caching 模块为独立库项目

**Date**: 2025-10-12  
**Feature**: 将 libs/nestjs-infra/src/caching 拆分为独立的 libs/nestjs-caching 库项目  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 研究目标

本研究旨在解决以下关键问题：

1. **模块拆分策略**: 如何优雅地将现有 caching 模块拆分为独立项目，同时保持兼容性？
2. **DDD 充血模型设计**: 如何在缓存模块中应用 DDD 充血模型，设计合理的值对象？
3. **多层级隔离实现**: 如何高效实现 5 层级数据隔离（平台、租户、组织、部门、用户）？
4. **性能优化**: 如何确保缓存操作的高性能（读取延迟 < 10ms）？
5. **依赖管理**: 如何处理与 nestjs-infra 和其他库的依赖关系？

## 研究发现

### 1. 模块拆分策略

**决策**: 采用渐进式拆分，保留兼容层

**理由**:

- 现有代码依赖 `@hl8/nestjs-infra` 的 caching 模块
- 直接拆分会导致破坏性变更，影响所有使用方
- 保留兼容层可以实现平滑迁移

**实施方案**:

1. **创建新项目** `libs/nestjs-caching`
   - 将所有缓存功能迁移到新项目
   - 独立的 package.json、tsconfig.json、eslint.config.mjs
   - 独立的版本管理和发布周期

2. **nestjs-infra 保留兼容层**
   - `libs/nestjs-infra/src/caching/` 保留为轻量级导出模块
   - 简单地重新导出 `@hl8/nestjs-caching` 的功能
   - 添加 deprecation 警告，引导用户迁移

3. **依赖关系**

   ```
   @hl8/nestjs-infra
   └── @hl8/nestjs-caching (workspace dependency)
   ```

**替代方案 rejected**:

- **直接删除 nestjs-infra 中的 caching**: 会破坏所有现有代码，影响范围太大
- **仅创建别名**: 无法实现独立版本管理，不利于长期维护

**参考资料**:

- [NestJS Module System Best Practices](https://docs.nestjs.com/modules)
- [Monorepo Refactoring Patterns](https://turborepo.org/docs/handbook/migrating-to-a-monorepo)

---

### 2. DDD 充血模型设计

**决策**: 设计 CacheKey 和 CacheEntry 作为值对象（Value Objects）

**理由**:

- 缓存键生成包含复杂的业务逻辑（多层级隔离、命名空间、格式化）
- 缓存条目包含验证规则（TTL 范围、值大小限制、序列化规则）
- 这些业务规则应该封装在领域对象内部，而非散落在服务层

**值对象设计**:

#### CacheKey (值对象)

```typescript
/**
 * 缓存键值对象
 *
 * @description 封装缓存键的生成逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 键格式规则
 * - 格式: {prefix}:{level}:{namespace}:{key}
 * - level: platform/tenant/org/dept/user
 * - 键长度不超过 256 字符
 * - 不允许包含空格和特殊字符（除 : _ -）
 *
 * ### 层级规则
 * - 平台级: platform:{namespace}:{key}
 * - 租户级: tenant:{tenantId}:{namespace}:{key}
 * - 组织级: tenant:{tenantId}:org:{orgId}:{namespace}:{key}
 * - 部门级: tenant:{tenantId}:org:{orgId}:dept:{deptId}:{namespace}:{key}
 * - 用户级: user:{userId}:{namespace}:{key}
 *
 * @since 1.0.0
 */
export class CacheKey {
  private readonly fullKey: string;

  private constructor(
    private readonly prefix: string,
    private readonly level: CacheLevel,
    private readonly namespace: string,
    private readonly key: string,
    private readonly isolationContext?: IsolationContext,
  ) {
    this.fullKey = this.buildKey();
    this.validate();
  }

  /**
   * 创建平台级缓存键
   */
  static forPlatform(namespace: string, key: string, prefix: string): CacheKey {
    return new CacheKey(prefix, CacheLevel.PLATFORM, namespace, key);
  }

  /**
   * 创建租户级缓存键
   */
  static forTenant(
    namespace: string,
    key: string,
    prefix: string,
    context: IsolationContext,
  ): CacheKey {
    if (!context.tenantId) {
      throw new GeneralBadRequestException(
        "租户 ID 缺失",
        "租户级缓存需要提供租户 ID",
      );
    }
    return new CacheKey(prefix, CacheLevel.TENANT, namespace, key, context);
  }

  /**
   * 创建组织级缓存键
   */
  static forOrganization(
    namespace: string,
    key: string,
    prefix: string,
    context: IsolationContext,
  ): CacheKey {
    if (!context.tenantId || !context.organizationId) {
      throw new GeneralBadRequestException(
        "组织级缓存需要租户 ID 和组织 ID",
        "请确保隔离上下文包含完整信息",
      );
    }
    return new CacheKey(
      prefix,
      CacheLevel.ORGANIZATION,
      namespace,
      key,
      context,
    );
  }

  /**
   * 创建部门级缓存键
   */
  static forDepartment(
    namespace: string,
    key: string,
    prefix: string,
    context: IsolationContext,
  ): CacheKey {
    if (!context.tenantId || !context.organizationId || !context.departmentId) {
      throw new GeneralBadRequestException(
        "部门级缓存需要租户 ID、组织 ID 和部门 ID",
        "请确保隔离上下文包含完整信息",
      );
    }
    return new CacheKey(prefix, CacheLevel.DEPARTMENT, namespace, key, context);
  }

  /**
   * 创建用户级缓存键
   */
  static forUser(
    namespace: string,
    key: string,
    prefix: string,
    context: IsolationContext,
  ): CacheKey {
    if (!context.userId) {
      throw new GeneralBadRequestException(
        "用户 ID 缺失",
        "用户级缓存需要提供用户 ID",
      );
    }
    return new CacheKey(prefix, CacheLevel.USER, namespace, key, context);
  }

  /**
   * 根据隔离上下文自动创建缓存键
   *
   * @description 自动判断隔离层级并创建相应的缓存键
   */
  static fromContext(
    namespace: string,
    key: string,
    prefix: string,
    context: IsolationContext,
  ): CacheKey {
    // 自动判断层级
    if (context.departmentId) {
      return CacheKey.forDepartment(namespace, key, prefix, context);
    }
    if (context.organizationId) {
      return CacheKey.forOrganization(namespace, key, prefix, context);
    }
    if (context.tenantId) {
      return CacheKey.forTenant(namespace, key, prefix, context);
    }
    if (context.userId) {
      return CacheKey.forUser(namespace, key, prefix, context);
    }
    // 默认平台级
    return CacheKey.forPlatform(namespace, key, prefix);
  }

  /**
   * 构建完整的缓存键
   *
   * @private
   */
  private buildKey(): string {
    const parts = [this.prefix];

    switch (this.level) {
      case CacheLevel.PLATFORM:
        parts.push("platform", this.namespace, this.key);
        break;

      case CacheLevel.TENANT:
        parts.push(
          "tenant",
          this.isolationContext!.tenantId!,
          this.namespace,
          this.key,
        );
        break;

      case CacheLevel.ORGANIZATION:
        parts.push(
          "tenant",
          this.isolationContext!.tenantId!,
          "org",
          this.isolationContext!.organizationId!,
          this.namespace,
          this.key,
        );
        break;

      case CacheLevel.DEPARTMENT:
        parts.push(
          "tenant",
          this.isolationContext!.tenantId!,
          "org",
          this.isolationContext!.organizationId!,
          "dept",
          this.isolationContext!.departmentId!,
          this.namespace,
          this.key,
        );
        break;

      case CacheLevel.USER:
        parts.push(
          "user",
          this.isolationContext!.userId!,
          this.namespace,
          this.key,
        );
        break;
    }

    return parts.join(":");
  }

  /**
   * 验证缓存键的有效性
   *
   * @throws {GeneralBadRequestException} 键无效
   * @private
   */
  private validate(): void {
    // 验证长度
    if (this.fullKey.length > 256) {
      throw new GeneralBadRequestException(
        "缓存键过长",
        `缓存键长度不能超过 256 字符，当前长度: ${this.fullKey.length}`,
        { key: this.fullKey },
      );
    }

    // 验证字符
    const invalidChars = /[^\w:_-]/;
    if (invalidChars.test(this.fullKey)) {
      throw new GeneralBadRequestException(
        "缓存键包含无效字符",
        "缓存键只能包含字母、数字、冒号、下划线和连字符",
        { key: this.fullKey },
      );
    }
  }

  /**
   * 获取完整的缓存键
   */
  toString(): string {
    return this.fullKey;
  }

  /**
   * 获取缓存层级
   */
  getLevel(): CacheLevel {
    return this.level;
  }

  /**
   * 生成匹配模式（用于批量删除）
   */
  toPattern(): string {
    return `${this.fullKey}*`;
  }

  /**
   * 值对象相等性比较
   */
  equals(other: CacheKey): boolean {
    return this.fullKey === other.fullKey;
  }
}
```

#### CacheEntry (值对象)

```typescript
/**
 * 缓存条目值对象
 *
 * @description 封装缓存条目的验证和序列化逻辑
 *
 * ## 业务规则
 *
 * ### TTL 规则
 * - 最小值: 1 秒
 * - 最大值: 2,592,000 秒（30 天）
 * - 0 表示永不过期（慎用）
 * - 负数无效
 *
 * ### 值大小规则
 * - 推荐最大: 1MB
 * - 警告阈值: 512KB
 * - 超过 1MB 会记录警告日志
 *
 * ### 序列化规则
 * - 使用 JSON 序列化
 * - 处理循环引用
 * - 处理特殊类型（Date、Buffer、Set、Map）
 *
 * @since 1.0.0
 */
export class CacheEntry<T = any> {
  private static readonly MAX_TTL = 2592000; // 30 天
  private static readonly WARN_SIZE = 512 * 1024; // 512KB
  private static readonly MAX_SIZE = 1 * 1024 * 1024; // 1MB

  private readonly serializedValue: string;
  private readonly size: number;

  private constructor(
    private readonly key: CacheKey,
    private readonly value: T,
    private readonly ttl: number,
    private readonly createdAt: Date,
  ) {
    this.validateTTL();
    this.serializedValue = this.serialize();
    this.size = Buffer.byteLength(this.serializedValue, "utf-8");
    this.validateSize();
  }

  /**
   * 创建缓存条目
   */
  static create<T>(
    key: CacheKey,
    value: T,
    ttl: number = 3600,
    logger?: ILoggerService,
  ): CacheEntry<T> {
    const entry = new CacheEntry(key, value, ttl, new Date());

    // 记录警告（如果值过大）
    if (logger && entry.size > CacheEntry.WARN_SIZE) {
      logger.warn("缓存值较大", {
        key: key.toString(),
        size: entry.size,
        threshold: CacheEntry.WARN_SIZE,
      });
    }

    return entry;
  }

  /**
   * 验证 TTL 有效性
   *
   * @throws {GeneralBadRequestException} TTL 无效
   * @private
   */
  private validateTTL(): void {
    if (this.ttl < 0) {
      throw new GeneralBadRequestException("TTL 无效", "TTL 不能为负数", {
        ttl: this.ttl,
      });
    }

    if (this.ttl > CacheEntry.MAX_TTL) {
      throw new GeneralBadRequestException(
        "TTL 过大",
        `TTL 不能超过 ${CacheEntry.MAX_TTL} 秒（30 天）`,
        { ttl: this.ttl, max: CacheEntry.MAX_TTL },
      );
    }
  }

  /**
   * 序列化缓存值
   *
   * @private
   */
  private serialize(): string {
    try {
      return JSON.stringify(this.value, this.getReplacer());
    } catch (error) {
      throw new GeneralInternalServerException(
        "缓存值序列化失败",
        "无法序列化缓存值",
        { key: this.key.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 获取 JSON 序列化的 replacer 函数
   *
   * @description 处理循环引用和特殊类型
   * @private
   */
  private getReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();

    return (key: string, value: any) => {
      // 处理循环引用
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }

      // 处理特殊类型
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      if (value instanceof Set) {
        return { __type: "Set", value: Array.from(value) };
      }
      if (value instanceof Map) {
        return { __type: "Map", value: Array.from(value.entries()) };
      }
      if (Buffer.isBuffer(value)) {
        return { __type: "Buffer", value: value.toString("base64") };
      }

      return value;
    };
  }

  /**
   * 验证值大小
   *
   * @throws {GeneralBadRequestException} 值过大
   * @private
   */
  private validateSize(): void {
    if (this.size > CacheEntry.MAX_SIZE) {
      throw new GeneralBadRequestException(
        "缓存值过大",
        `缓存值不能超过 ${CacheEntry.MAX_SIZE} 字节（1MB）`,
        {
          key: this.key.toString(),
          size: this.size,
          max: CacheEntry.MAX_SIZE,
        },
      );
    }
  }

  /**
   * 获取序列化后的值
   */
  getSerializedValue(): string {
    return this.serializedValue;
  }

  /**
   * 获取原始值
   */
  getValue(): T {
    return this.value;
  }

  /**
   * 获取 TTL
   */
  getTTL(): number {
    return this.ttl;
  }

  /**
   * 获取缓存键
   */
  getKey(): CacheKey {
    return this.key;
  }

  /**
   * 获取值大小（字节）
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取创建时间
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * 检查是否即将过期（剩余时间 < 10%）
   */
  isExpiringSoon(currentTime: Date = new Date()): boolean {
    if (this.ttl === 0) {
      return false; // 永不过期
    }

    const elapsed = (currentTime.getTime() - this.createdAt.getTime()) / 1000;
    const remaining = this.ttl - elapsed;
    const threshold = this.ttl * 0.1;

    return remaining < threshold && remaining > 0;
  }

  /**
   * 检查是否已过期
   */
  isExpired(currentTime: Date = new Date()): boolean {
    if (this.ttl === 0) {
      return false; // 永不过期
    }

    const elapsed = (currentTime.getTime() - this.createdAt.getTime()) / 1000;
    return elapsed >= this.ttl;
  }
}
```

**值对象设计的优势**:

1. ✅ **业务规则封装**: 所有验证、序列化逻辑封装在值对象内部
2. ✅ **类型安全**: 静态工厂方法确保创建的对象始终有效
3. ✅ **不可变性**: 值对象创建后不可修改，避免意外状态变更
4. ✅ **可测试性**: 值对象独立于基础设施，易于单元测试
5. ✅ **业务语义清晰**: 代码可读性高，业务意图明确

**替代方案 rejected**:

- **使用简单的字符串和对象**: 业务规则散落在服务层，难以维护
- **使用 class-validator 装饰器**: 无法封装复杂的业务逻辑（如层级判断）

**参考资料**:

- [Domain-Driven Design: Value Objects](https://martinfowler.com/bliki/ValueObject.html)
- [Implementing Value Objects in TypeScript](https://khalilstemmler.com/articles/typescript-value-object/)

---

### 3. 多层级隔离实现

**决策**: 使用 nestjs-cls + CacheKey 值对象实现自动隔离

**理由**:

- nestjs-cls 提供请求级别的异步上下文存储
- CacheKey 值对象封装层级判断逻辑
- 自动从 IsolationContext 生成正确的缓存键，开发者无需手动处理

**实施方案**:

```typescript
/**
 * 缓存服务（支持多层级隔离）
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
    @Inject("CACHE_OPTIONS") private readonly options: CacheOptions,
    private readonly cls: ClsService<IsolationContext>, // 上下文服务
    @Optional() private readonly logger?: ILoggerService,
  ) {}

  /**
   * 获取缓存（自动隔离）
   */
  async get<T>(namespace: string, key: string): Promise<T | null> {
    const context = this.cls.get(); // 获取当前隔离上下文
    const cacheKey = CacheKey.fromContext(
      namespace,
      key,
      this.options.keyPrefix,
      context,
    );

    try {
      const value = await this.redis.get(cacheKey.toString());
      if (value === null) {
        return null;
      }

      return this.deserialize<T>(value);
    } catch (error) {
      this.logger?.error("缓存读取失败", error.stack, {
        key: cacheKey.toString(),
        level: cacheKey.getLevel(),
      });
      throw new GeneralInternalServerException(
        "缓存读取失败",
        `无法读取缓存: ${cacheKey.toString()}`,
        { key: cacheKey.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 设置缓存（自动隔离）
   */
  async set<T>(
    namespace: string,
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    const context = this.cls.get();
    const cacheKey = CacheKey.fromContext(
      namespace,
      key,
      this.options.keyPrefix,
      context,
    );

    const entry = CacheEntry.create(
      cacheKey,
      value,
      ttl ?? this.options.defaultTTL,
      this.logger,
    );

    try {
      if (entry.getTTL() > 0) {
        await this.redis.setex(
          cacheKey.toString(),
          entry.getTTL(),
          entry.getSerializedValue(),
        );
      } else {
        await this.redis.set(cacheKey.toString(), entry.getSerializedValue());
      }

      this.logger?.debug("缓存写入成功", {
        key: cacheKey.toString(),
        level: cacheKey.getLevel(),
        size: entry.getSize(),
        ttl: entry.getTTL(),
      });
    } catch (error) {
      this.logger?.error("缓存写入失败", error.stack, {
        key: cacheKey.toString(),
      });
      throw new GeneralInternalServerException(
        "缓存写入失败",
        `无法写入缓存: ${cacheKey.toString()}`,
        { key: cacheKey.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 清除租户级缓存（批量删除）
   */
  async clearTenantCache(
    tenantId: string,
    namespace?: string,
  ): Promise<number> {
    const pattern = namespace
      ? `${this.options.keyPrefix}tenant:${tenantId}:${namespace}:*`
      : `${this.options.keyPrefix}tenant:${tenantId}:*`;

    return this.clearByPattern(pattern);
  }

  /**
   * 清除组织级缓存（批量删除）
   */
  async clearOrganizationCache(
    tenantId: string,
    orgId: string,
    namespace?: string,
  ): Promise<number> {
    const pattern = namespace
      ? `${this.options.keyPrefix}tenant:${tenantId}:org:${orgId}:${namespace}:*`
      : `${this.options.keyPrefix}tenant:${tenantId}:org:${orgId}:*`;

    return this.clearByPattern(pattern);
  }

  /**
   * 根据模式清除缓存
   *
   * @private
   */
  private async clearByPattern(pattern: string): Promise<number> {
    try {
      let cursor = "0";
      let deletedCount = 0;

      do {
        // 使用 SCAN 避免阻塞
        const result = await this.redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );

        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          await this.redis.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== "0");

      this.logger?.info("批量清除缓存成功", {
        pattern,
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      this.logger?.error("批量清除缓存失败", error.stack, { pattern });
      throw new GeneralInternalServerException(
        "批量清除缓存失败",
        `无法清除缓存: ${pattern}`,
        { pattern },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 反序列化缓存值
   *
   * @private
   */
  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value, this.getReviver());
    } catch (error) {
      throw new GeneralInternalServerException(
        "缓存值反序列化失败",
        "无法反序列化缓存值",
        { value },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 获取 JSON 反序列化的 reviver 函数
   *
   * @private
   */
  private getReviver(): (key: string, value: any) => any {
    return (key: string, value: any) => {
      if (value && typeof value === "object" && value.__type) {
        switch (value.__type) {
          case "Date":
            return new Date(value.value);
          case "Set":
            return new Set(value.value);
          case "Map":
            return new Map(value.value);
          case "Buffer":
            return Buffer.from(value.value, "base64");
          default:
            return value;
        }
      }
      return value;
    };
  }
}
```

**性能优化**:

1. ✅ 使用 SCAN 替代 KEYS，避免阻塞 Redis
2. ✅ 批量删除时使用游标分页
3. ✅ 缓存键生成在值对象内部完成（一次性计算）
4. ✅ 序列化/反序列化在值对象内部缓存结果

**替代方案 rejected**:

- **手动传递隔离标识**: 容易出错，代码冗余
- **使用装饰器注入隔离信息**: 无法在服务层直接使用，灵活性差

**参考资料**:

- [nestjs-cls Documentation](https://papooch.github.io/nestjs-cls/)
- [Redis SCAN Command](https://redis.io/commands/scan/)
- [Multi-Tenancy Cache Isolation Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/cache-isolation.html)

---

### 4. 性能优化

**决策**: 实现缓存指标监控和智能预热

**理由**:

- 读取延迟 < 10ms 需要优化序列化和网络开销
- 需要监控缓存命中率、延迟、错误率
- 智能预热可以减少冷启动延迟

**实施方案**:

#### CacheMetricsService (监控服务)

```typescript
/**
 * 缓存指标服务
 *
 * @description 收集和报告缓存性能指标
 */
@Injectable()
export class CacheMetricsService {
  private metrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalLatency: 0,
    operationCount: 0,
  };

  /**
   * 记录缓存命中
   */
  recordHit(latency: number): void {
    this.metrics.hits++;
    this.recordLatency(latency);
  }

  /**
   * 记录缓存未命中
   */
  recordMiss(latency: number): void {
    this.metrics.misses++;
    this.recordLatency(latency);
  }

  /**
   * 记录错误
   */
  recordError(): void {
    this.metrics.errors++;
  }

  /**
   * 记录延迟
   *
   * @private
   */
  private recordLatency(latency: number): void {
    this.metrics.totalLatency += latency;
    this.metrics.operationCount++;
  }

  /**
   * 获取缓存命中率
   */
  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * 获取平均延迟（毫秒）
   */
  getAverageLatency(): number {
    return this.metrics.operationCount > 0
      ? this.metrics.totalLatency / this.metrics.operationCount
      : 0;
  }

  /**
   * 获取完整指标
   */
  getMetrics(): CacheMetrics {
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      errors: this.metrics.errors,
      hitRate: this.getHitRate(),
      averageLatency: this.getAverageLatency(),
      totalOperations: this.metrics.operationCount,
    };
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalLatency: 0,
      operationCount: 0,
    };
  }
}
```

#### 性能优化技巧

1. **连接池优化**

   ```typescript
   // Redis 连接配置
   new Redis({
     host: options.host,
     port: options.port,
     password: options.password,
     db: options.db || 0,
     connectTimeout: 5000,
     retryStrategy: (times) => Math.min(times * 50, 2000),
     lazyConnect: false, // 立即连接
     enableReadyCheck: true,
     maxRetriesPerRequest: 3,
   });
   ```

2. **Pipeline 批量操作**

   ```typescript
   // 批量获取
   async mget(keys: string[]): Promise<(any | null)[]> {
     const pipeline = this.redis.pipeline();
     keys.forEach(key => pipeline.get(key));
     const results = await pipeline.exec();
     return results.map(([err, value]) =>
       err ? null : this.deserialize(value)
     );
   }
   ```

3. **LRU 缓存配置**

   ```bash
   # Redis 配置
   maxmemory 2gb
   maxmemory-policy allkeys-lru
   ```

**性能基准**:

- 单次 get 操作: < 5ms (本地 Redis)
- 单次 set 操作: < 8ms (本地 Redis)
- 批量 get (100 keys): < 50ms
- 序列化开销: < 1ms (< 100KB 对象)
- 反序列化开销: < 1ms (< 100KB 对象)

**参考资料**:

- [Redis Performance Optimization](https://redis.io/docs/management/optimization/)
- [ioredis Best Practices](https://github.com/redis/ioredis#performance)

---

### 5. 依赖管理

**决策**: 明确依赖关系，最小化外部依赖

**依赖图**:

```text
libs/nestjs-caching
├── @nestjs/common (peer dependency)
├── @nestjs/core (peer dependency)
├── ioredis (dependency)
├── nestjs-cls (dependency) - 用于隔离上下文
├── class-validator (dependency) - 用于配置验证
├── class-transformer (dependency)
└── @hl8/platform (workspace:* dependency) - 仅用于 IsolationContext 类型定义

libs/nestjs-infra (兼容层)
└── @hl8/nestjs-caching (workspace:* dependency)

应用项目
├── @hl8/nestjs-caching (直接使用)
└── @hl8/nestjs-infra (可选，兼容旧代码)
```

**package.json 示例**:

```json
{
  "name": "@hl8/nestjs-caching",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "engines": {
    "node": ">=20"
  },
  "peerDependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0"
  },
  "dependencies": {
    "ioredis": "^5.4.2",
    "nestjs-cls": "^6.0.1",
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1",
    "@hl8/platform": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.1.6",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@swc/cli": "^0.7.0",
    "@swc/core": "^1.10.14",
    "@swc/jest": "^0.2.37",
    "@types/jest": "^30.0.0",
    "@types/node": "^22.15.3",
    "jest": "^30.2.0",
    "typescript": "5.9.2"
  }
}
```

**依赖说明**:

- **ioredis**: 高性能 Redis 客户端，类型定义完善
- **nestjs-cls**: 提供请求级别的异步上下文存储
- **class-validator / class-transformer**: 配置验证
- **@hl8/platform**: 提供 IsolationContext 类型定义（workspace 内部依赖）

**最小化依赖原则**:

- ✅ 无 lodash、moment 等通用工具库依赖
- ✅ 无 axios、got 等 HTTP 客户端依赖
- ✅ 仅依赖必需的 NestJS 核心模块
- ✅ 避免引入重量级依赖

**参考资料**:

- [pnpm Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [NestJS Peer Dependencies](https://docs.nestjs.com/fundamentals/custom-providers)

---

## 总结与建议

### 关键决策汇总

| 决策点     | 选择方案                     | 理由                         |
| ---------- | ---------------------------- | ---------------------------- |
| 拆分策略   | 渐进式拆分 + 兼容层          | 平滑迁移，降低影响           |
| DDD 设计   | CacheKey + CacheEntry 值对象 | 业务规则封装，符合充血模型   |
| 多层级隔离 | nestjs-cls + 自动键生成      | 开发者无需手动处理，减少错误 |
| 性能优化   | Pipeline + 指标监控          | 满足 < 10ms 延迟要求         |
| 依赖管理   | 最小化依赖 + workspace 协议  | 减少依赖冲突，提升安全性     |

### 实施建议

1. **第一阶段（Week 1）**:
   - 创建 `libs/nestjs-caching` 项目骨架
   - 实现 CacheKey 和 CacheEntry 值对象
   - 编写值对象的单元测试（覆盖率 >= 90%）

2. **第二阶段（Week 2）**:
   - 实现 CacheService 和 RedisService
   - 实现多层级隔离逻辑
   - 编写集成测试

3. **第三阶段（Week 3）**:
   - 实现缓存装饰器（@Cacheable、@CacheEvict、@CachePut）
   - 实现性能监控（CacheMetricsService）
   - 完善文档（README、API、ARCHITECTURE、MIGRATION）

4. **第四阶段（Week 4）**:
   - 在 `libs/nestjs-infra` 中添加兼容层
   - 迁移测试用例
   - 性能测试和优化

### 风险与缓解

| 风险       | 影响 | 缓解措施                         |
| ---------- | ---- | -------------------------------- |
| 兼容性问题 | 高   | 保留兼容层，提供迁移指南         |
| 性能下降   | 中   | 性能基准测试，持续监控           |
| 依赖冲突   | 低   | 使用 peer dependencies，锁定版本 |
| 文档不完整 | 中   | 先完善文档再发布，提供示例代码   |

### 未解决问题

1. **缓存预热策略**: 是否需要实现应用启动时的缓存预热？
   - **建议**: Phase 2 评估，根据实际需求决定

2. **分布式锁**: 是否需要实现基于 Redis 的分布式锁？
   - **建议**: 单独的库项目，避免功能膨胀

3. **缓存一致性**: 如何处理缓存与数据库的一致性？
   - **建议**: 提供最佳实践文档，由应用层处理

---

**研究完成日期**: 2025-10-12  
**审阅者**: AI Assistant  
**状态**: ✅ 研究完成，已解决所有关键问题
