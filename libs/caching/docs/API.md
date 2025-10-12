# @hl8/caching API 参考

本文档包含 `@hl8/caching` 所有公共 API 的完整参考。

## 目录

- [模块配置](#模块配置)
- [CacheService](#cacheservice)
- [装饰器](#装饰器)
- [CacheMetricsService](#cachemetricsservice)
- [工具函数](#工具函数)
- [类型定义](#类型定义)

---

## 模块配置

### CachingModule.forRoot()

同步配置缓存模块。

**签名**:

```typescript
static forRoot(options: CachingModuleOptions): DynamicModule
```

**参数**:

```typescript
interface CachingModuleOptions {
  redis: RedisOptions;
  ttl?: number;
  keyPrefix?: string;
}

interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `redis.host` | string | 是 | - | Redis 主机地址 |
| `redis.port` | number | 是 | - | Redis 端口 |
| `redis.password` | string | 否 | - | Redis 密码 |
| `redis.db` | number | 否 | 0 | Redis 数据库编号 |
| `redis.maxRetriesPerRequest` | number | 否 | 3 | 每个请求最大重试次数 |
| `ttl` | number | 否 | 3600 | 默认 TTL（秒） |
| `keyPrefix` | string | 否 | 'hl8:cache:' | 缓存键前缀 |

**示例**:

```typescript
@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'secret',
        db: 0,
      },
      ttl: 3600,
      keyPrefix: 'myapp:cache:',
    }),
  ],
})
export class AppModule {}
```

---

### CachingModule.forRootAsync()

异步配置缓存模块（支持依赖注入）。

**签名**:

```typescript
static forRootAsync(options: CachingModuleAsyncOptions): DynamicModule
```

**参数**:

```typescript
interface CachingModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<CachingModuleOptions> | CachingModuleOptions;
}
```

**示例**:

```typescript
@Module({
  imports: [
    CachingModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
        ttl: config.get('CACHE_TTL'),
      }),
    }),
  ],
})
export class AppModule {}
```

---

## CacheService

核心缓存服务，提供缓存的 CRUD 操作。

### get()

获取缓存值。

**签名**:

```typescript
async get<T>(namespace: string, key: string): Promise<T | undefined>
```

**参数**:

- `namespace` (string): 命名空间，用于组织缓存键
- `key` (string): 缓存键

**返回值**:

- `Promise<T | undefined>`: 缓存值，不存在时返回 undefined

**示例**:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}
  
  async getUserById(id: string): Promise<User | null> {
    // 尝试从缓存获取
    const cached = await this.cacheService.get<User>('user', id);
    if (cached) {
      return cached;
    }
    
    // 从数据库查询
    const user = await this.repository.findOne(id);
    
    // 存入缓存
    if (user) {
      await this.cacheService.set('user', id, user, 1800);
    }
    
    return user;
  }
}
```

---

### set()

设置缓存值。

**签名**:

```typescript
async set<T>(
  namespace: string,
  key: string,
  value: T,
  ttl?: number
): Promise<void>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键
- `value` (T): 要缓存的值
- `ttl` (number, 可选): 过期时间（秒），默认使用配置的 TTL

**返回值**:

- `Promise<void>`

**示例**:

```typescript
// 使用默认 TTL
await cacheService.set('user', '123', userObject);

// 自定义 TTL（30 分钟）
await cacheService.set('user', '123', userObject, 1800);

// 短期缓存（5 分钟）
await cacheService.set('temp', 'data', tempData, 300);
```

---

### del()

删除缓存。

**签名**:

```typescript
async del(namespace: string, key: string): Promise<void>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键

**返回值**:

- `Promise<void>`

**示例**:

```typescript
// 删除单个缓存
await cacheService.del('user', '123');

// 更新数据后删除缓存
async updateUser(id: string, data: UpdateUserDto) {
  await this.repository.update(id, data);
  await this.cacheService.del('user', id);
}
```

---

### exists()

检查缓存是否存在。

**签名**:

```typescript
async exists(namespace: string, key: string): Promise<boolean>
```

**参数**:

- `namespace` (string): 命名空间
- `key` (string): 缓存键

**返回值**:

- `Promise<boolean>`: 存在返回 true，否则返回 false

**示例**:

```typescript
const hasCache = await cacheService.exists('user', '123');

if (hasCache) {
  console.log('缓存已存在');
} else {
  console.log('缓存不存在，需要查询数据库');
}
```

---

### clear()

清空缓存（支持模式匹配）。

**签名**:

```typescript
async clear(pattern?: string): Promise<void>
```

**参数**:

- `pattern` (string, 可选): 匹配模式（支持 * 通配符），不提供则清空所有缓存

**返回值**:

- `Promise<void>`

**示例**:

```typescript
// 清空所有用户缓存
await cacheService.clear('user:*');

// 清空特定前缀的缓存
await cacheService.clear('temp:*');

// 清空所有缓存（危险操作！）
await cacheService.clear();
```

**注意**:

- 使用 Redis SCAN 命令，不会阻塞 Redis
- 批量删除时使用游标分页
- 谨慎使用无参数的 clear()

---

## 装饰器

### @Cacheable()

自动缓存方法返回值。

**签名**:

```typescript
@Cacheable(namespace: string, options?: CacheableOptions)
```

**参数**:

```typescript
interface CacheableOptions {
  keyGenerator?: (...args: any[]) => string;
  ttl?: number;
  condition?: (...args: any[]) => boolean;
  cacheNull?: boolean;
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `namespace` | string | - | 命名空间 |
| `keyGenerator` | function | 使用第一个参数 | 自定义键生成函数 |
| `ttl` | number | 配置的默认值 | 过期时间（秒） |
| `condition` | function | - | 条件函数，返回 false 时不缓存 |
| `cacheNull` | boolean | false | 是否缓存 null 值 |

**示例**:

```typescript
@Injectable()
export class UserService {
  // 基础用法
  @Cacheable('user')
  async getUserById(id: string): Promise<User> {
    return this.repository.findOne(id);
  }
  
  // 自定义键
  @Cacheable('user', {
    keyGenerator: (id: string) => `profile:${id}`,
  })
  async getUserProfile(id: string): Promise<UserProfile> {
    return this.repository.findProfile(id);
  }
  
  // 自定义 TTL
  @Cacheable('user', {
    ttl: 1800, // 30 分钟
  })
  async getActiveUsers(): Promise<User[]> {
    return this.repository.findActive();
  }
  
  // 条件缓存
  @Cacheable('user', {
    condition: (id: string) => id !== 'admin', // 不缓存 admin
  })
  async getUserData(id: string): Promise<any> {
    return this.fetchUserData(id);
  }
  
  // 缓存 null 值
  @Cacheable('user', {
    cacheNull: true, // 防止缓存穿透
  })
  async findUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }
}
```

---

### @CacheEvict()

自动清除缓存。

**签名**:

```typescript
@CacheEvict(namespace: string, options?: CacheEvictOptions)
```

**参数**:

```typescript
interface CacheEvictOptions {
  keyGenerator?: (...args: any[]) => string;
  allEntries?: boolean;
  beforeInvocation?: boolean;
  condition?: (...args: any[]) => boolean;
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `namespace` | string | - | 命名空间 |
| `keyGenerator` | function | 使用第一个参数 | 自定义键生成函数 |
| `allEntries` | boolean | false | 是否清除所有缓存 |
| `beforeInvocation` | boolean | false | 是否在方法执行前清除 |
| `condition` | function | - | 条件函数，返回 false 时不清除 |

**示例**:

```typescript
@Injectable()
export class UserService {
  // 更新后清除缓存
  @CacheEvict('user')
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.repository.update(id, data);
  }
  
  // 删除前清除缓存
  @CacheEvict('user', {
    beforeInvocation: true,
  })
  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
  }
  
  // 清除所有用户缓存
  @CacheEvict('user', {
    allEntries: true,
  })
  async resetAllUsers(): Promise<void> {
    await this.repository.truncate();
  }
  
  // 条件清除
  @CacheEvict('user', {
    condition: (id: string) => id !== 'system',
  })
  async modifyUser(id: string): Promise<void> {
    // ...
  }
}
```

---

### @CachePut()

强制更新缓存（始终执行方法）。

**签名**:

```typescript
@CachePut(namespace: string, options?: CachePutOptions)
```

**参数**:

```typescript
interface CachePutOptions {
  keyGenerator?: (...args: any[]) => string;
  ttl?: number;
  condition?: (...args: any[]) => boolean;
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `namespace` | string | - | 命名空间 |
| `keyGenerator` | function | 使用第一个参数 | 自定义键生成函数 |
| `ttl` | number | 配置的默认值 | 过期时间（秒） |
| `condition` | function | - | 条件函数，返回 false 时不更新 |

**示例**:

```typescript
@Injectable()
export class UserService {
  @Cacheable('user')
  async getUserById(id: string): Promise<User> {
    return this.repository.findOne(id);
  }
  
  // 更新数据并刷新缓存
  @CachePut('user')
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.repository.update(id, data);
    // 缓存自动更新，getUserById 将获取最新数据
    return user;
  }
  
  // 定时刷新缓存
  @CachePut('user', {
    keyGenerator: (id: string) => id,
    ttl: 3600,
  })
  @Cron('0 */5 * * * *') // 每 5 分钟
  async refreshUserCache(id: string): Promise<User> {
    return this.repository.findOne(id);
  }
}
```

**与 @Cacheable 的区别**:

- `@Cacheable`：检查缓存 → 命中则返回，未命中则执行方法并缓存
- `@CachePut`：始终执行方法 → 强制更新缓存

---

## CacheMetricsService

性能监控服务。

### recordHit()

记录缓存命中。

**签名**:

```typescript
recordHit(latency: number): void
```

**参数**:

- `latency` (number): 操作延迟（毫秒）

**示例**:

```typescript
const startTime = Date.now();
const value = await redis.get(key);
const latency = Date.now() - startTime;

if (value) {
  metricsService.recordHit(latency);
}
```

---

### recordMiss()

记录缓存未命中。

**签名**:

```typescript
recordMiss(latency: number): void
```

---

### recordError()

记录缓存错误。

**签名**:

```typescript
recordError(latency: number): void
```

---

### getHitRate()

获取缓存命中率。

**签名**:

```typescript
getHitRate(): number
```

**返回值**:

- `number`: 命中率（0-1）

**示例**:

```typescript
const hitRate = metricsService.getHitRate();
console.log(`命中率: ${(hitRate * 100).toFixed(2)}%`);
```

---

### getAverageLatency()

获取平均延迟。

**签名**:

```typescript
getAverageLatency(): number
```

**返回值**:

- `number`: 平均延迟（毫秒）

---

### getMetrics()

获取完整的性能指标。

**签名**:

```typescript
getMetrics(): CacheMetrics
```

**返回值**:

```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
  averageLatency: number;
  totalOperations: number;
}
```

**示例**:

```typescript
const metrics = metricsService.getMetrics();

console.log(`命中: ${metrics.hits}`);
console.log(`未命中: ${metrics.misses}`);
console.log(`错误: ${metrics.errors}`);
console.log(`命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
console.log(`总操作: ${metrics.totalOperations}`);
```

---

### reset()

重置所有指标。

**签名**:

```typescript
reset(): void
```

**示例**:

```typescript
// 定时重置（每天）
@Cron('0 0 * * *')
resetMetrics() {
  const metrics = this.metricsService.getMetrics();
  this.logger.log(`日报 | 命中率: ${(metrics.hitRate * 100).toFixed(2)}%`);
  this.metricsService.reset();
}
```

---

## 工具函数

### serialize()

序列化值为字符串。

**签名**:

```typescript
function serialize(value: any): string
```

**参数**:

- `value` (any): 要序列化的值

**返回值**:

- `string`: 序列化后的字符串

**支持的类型**:

- 基本类型（string, number, boolean, null, undefined）
- 对象和数组
- 顶层 Date 对象
- 顶层 RegExp 对象

**示例**:

```typescript
const obj = {
  name: 'John',
  age: 30,
  createdAt: new Date(),
};

const serialized = serialize(obj);
await redis.set('user:123', serialized);
```

---

### deserialize()

反序列化字符串为值。

**签名**:

```typescript
function deserialize<T = any>(value: string): T
```

**参数**:

- `value` (string): 要反序列化的字符串

**返回值**:

- `T`: 反序列化后的值

**示例**:

```typescript
const cached = await redis.get('user:123');
if (cached) {
  const user = deserialize<User>(cached);
  console.log(user.name);
}
```

---

### isSerializable()

检查值是否可序列化。

**签名**:

```typescript
function isSerializable(value: any): boolean
```

**返回值**:

- `boolean`: 可序列化返回 true

**示例**:

```typescript
if (isSerializable(obj)) {
  await cacheService.set('key', 'value', obj);
}
```

---

### generateKey()

生成缓存键。

**签名**:

```typescript
function generateKey(parts: (string | number | null | undefined)[]): string
```

**参数**:

- `parts`: 键的各个部分

**返回值**:

- `string`: 生成的缓存键（用冒号连接）

**示例**:

```typescript
const key = generateKey(['user', 'profile', userId]);
// 结果: "user:profile:123"

// 自动过滤空值
const key = generateKey(['user', '', null, 'list']);
// 结果: "user:list"
```

---

### sanitizeKey()

清理缓存键中的非法字符。

**签名**:

```typescript
function sanitizeKey(key: string): string
```

**参数**:

- `key` (string): 要清理的键

**返回值**:

- `string`: 清理后的键

**示例**:

```typescript
const clean = sanitizeKey('user name @123');
// 结果: "username123"
```

---

### isValidKey()

验证缓存键是否有效。

**签名**:

```typescript
function isValidKey(key: string): boolean
```

**返回值**:

- `boolean`: 键有效返回 true

**示例**:

```typescript
isValidKey('user:profile:123'); // true
isValidKey('user name');         // false
```

---

### generatePattern()

生成模式匹配键。

**签名**:

```typescript
function generatePattern(prefix: string, pattern: string): string
```

**参数**:

- `prefix` (string): 键前缀
- `pattern` (string): 匹配模式（支持 * 通配符）

**返回值**:

- `string`: 模式匹配键

**示例**:

```typescript
const pattern = generatePattern('cache', 'user:*');
// 结果: "cache:user:*"
```

---

## 类型定义

### CachingModuleOptions

```typescript
interface CachingModuleOptions {
  redis: RedisOptions;
  ttl?: number;
  keyPrefix?: string;
}
```

---

### RedisOptions

```typescript
interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}
```

---

### CacheMetrics

```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
  averageLatency: number;
  totalOperations: number;
}
```

---

### CacheLevel

```typescript
enum CacheLevel {
  PLATFORM = 'PLATFORM',
  TENANT = 'TENANT',
  ORGANIZATION = 'ORGANIZATION',
  DEPARTMENT = 'DEPARTMENT',
  USER = 'USER',
}
```

---

## 更新日志

查看 [CHANGELOG.md](../CHANGELOG.md) 了解版本更新历史。

---

**更新日期**: 2025-10-12  
**版本**: v1.0.0
