# @hl8/nestjs-fastify

Fastify 专用的企业级基础设施模块，提供速率限制、安全头、CORS、压缩、Metrics 等功能。

## 特性

### ✅ 速率限制（Rate Limiting）
- 多策略支持（IP、租户、用户、自定义）
- Redis 和内存双存储
- 声明式装饰器
- 自动降级和错误处理
- 标准 RFC 6585 响应头

### ✅ 安全头（Helmet）
- 集成 @fastify/helmet
- CSP 策略配置
- HSTS、X-Frame-Options 等
- 默认安全配置

### ✅ CORS 配置
- 灵活的 Origin 配置
- 支持凭证
- 自定义请求头和响应头

### ✅ 响应压缩
- 支持 br、gzip、deflate
- 可配置压缩阈值
- 自动内容类型检测

### ✅ Prometheus Metrics
- HTTP 请求计数
- 响应时间直方图
- 错误率统计
- 租户级别指标
- `/metrics` 端点

### ✅ 异常处理（已有）
- RFC7807 格式
- Fastify 优化

### ✅ 日志（已有）
- 零开销日志
- 复用 Fastify Pino

## 安装

```bash
pnpm add @hl8/nestjs-fastify
```

## 使用

### 速率限制

```typescript
import { RateLimitModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    RateLimitModule.forRoot({
      max: 100,
      timeWindow: 60000,  // 100 次/分钟
    }),
  ],
})
export class AppModule {}
```

装饰器用法：

```typescript
import { RateLimit, RateLimitByTenant } from '@hl8/nestjs-fastify';

@Controller('users')
@RateLimit({ max: 1000, timeWindow: 60000 })
export class UserController {
  @Post()
  @RateLimit({ max: 10, timeWindow: 60000 })
  create() {}
}
```

### 安全头（Helmet）

```typescript
import { SecurityModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    SecurityModule.forRoot({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  ],
})
export class AppModule {}
```

### CORS

```typescript
import { CorsModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    CorsModule.forRoot({
      origin: ['https://app.example.com'],
      credentials: true,
    }),
  ],
})
export class AppModule {}
```

### 压缩

```typescript
import { CompressionModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    CompressionModule.forRoot({
      threshold: 1024,  // 1KB
      encodings: ['br', 'gzip', 'deflate'],
    }),
  ],
})
export class AppModule {}
```

### Prometheus Metrics

```typescript
import { MetricsModule } from '@hl8/nestjs-fastify';

@Module({
  imports: [
    MetricsModule.forRoot({
      defaultLabels: {
        app: 'my-app',
      },
      includeTenantMetrics: true,
    }),
  ],
})
export class AppModule {}
```

访问 `http://localhost:3000/metrics` 查看指标。

## 完整示例

```typescript
import {
  RateLimitModule,
  SecurityModule,
  CorsModule,
  CompressionModule,
  MetricsModule,
} from '@hl8/nestjs-fastify';

@Module({
  imports: [
    // 速率限制
    RateLimitModule.forRoot({
      max: 1000,
      timeWindow: 60000,
      strategy: 'tenant',
      redis: redisClient,
    }),
    
    // 安全头
    SecurityModule.forRoot(),
    
    // CORS
    CorsModule.forRoot({
      origin: true,
      credentials: true,
    }),
    
    // 压缩
    CompressionModule.forRoot(),
    
    // Metrics
    MetricsModule.forRoot({
      includeTenantMetrics: true,
    }),
  ],
})
export class AppModule {}
```

## API 文档

详见各模块的 TypeScript 类型定义和 TSDoc 注释。

## License

MIT
