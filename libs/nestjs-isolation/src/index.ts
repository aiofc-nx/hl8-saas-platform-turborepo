/**
 * @hl8/nestjs-isolation
 *
 * NestJS 数据隔离实现库
 *
 * ## 特性
 *
 * - 自动从请求头提取隔离上下文
 * - 提供装饰器、守卫、中间件
 * - 基于 nestjs-cls 实现请求级上下文
 * - 支持 Fastify 和 Express
 *
 * ## 依赖
 *
 * - @hl8/isolation-model - 纯领域模型库（零依赖）
 * - NestJS >= 11.0
 * - nestjs-cls >= 6.0
 *
 * @module @hl8/nestjs-isolation
 * @since 1.0.0
 */

// 模块
export { IsolationModule } from './isolation.module.js';

// 服务
export { IsolationContextService } from './services/isolation-context.service.js';
export { MultiLevelIsolationService } from './services/multi-level-isolation.service.js';

// 中间件
export { IsolationExtractionMiddleware } from './middleware/isolation-extraction.middleware.js';

// 装饰器
export * from './decorators/index.js';

// 守卫
export { IsolationGuard } from './guards/isolation.guard.js';
