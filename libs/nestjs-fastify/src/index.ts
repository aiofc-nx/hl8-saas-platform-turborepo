/**
 * @hl8/nestjs-fastify - Fastify 专用的企业级基础设施模块
 *
 * @description 专门为 Fastify 优化的 NestJS 基础设施模块
 * 基于 @hl8/nestjs-infra，针对 Fastify 适配器进行优化
 *
 * @packageDocumentation
 */

// ============================================================
// Fastify 适配器（企业级增强）
// ============================================================

/**
 * 企业级 Fastify 适配器
 */
export { EnterpriseFastifyAdapter } from './fastify/enterprise-fastify.adapter.js';
export type { EnterpriseFastifyAdapterOptions } from './fastify/enterprise-fastify.adapter.js';

/**
 * Fastify 配置
 */
export {
  DEFAULT_FASTIFY_CONFIG,
  DEV_FASTIFY_CONFIG,
  PROD_FASTIFY_CONFIG,
} from './fastify/config/fastify.config.js';

/**
 * Fastify 监控服务
 */
export { HealthCheckService } from './fastify/monitoring/health-check.service.js';
export type { HealthCheckResult, ComponentHealth } from './fastify/monitoring/health-check.service.js';
export { PerformanceMonitorService } from './fastify/monitoring/performance-monitor.service.js';
export type { PerformanceMetrics, RouteMetrics } from './fastify/monitoring/performance-monitor.service.js';

// ============================================================
// Fastify 专用模块
// ============================================================

/**
 * 异常处理（Fastify 优化）
 */
export { FastifyExceptionModule } from './exceptions/exception.module.js';
export { FastifyHttpExceptionFilter } from './exceptions/filters/fastify-http-exception.filter.js';
export { FastifyAnyExceptionFilter } from './exceptions/filters/fastify-any-exception.filter.js';

/**
 * 日志（Fastify Pino 原生集成）
 */
export { FastifyLoggingModule } from './logging/logging.module.js';
export { FastifyLoggerService } from './logging/fastify-logger.service.js';

// ============================================================
// 版本信息
// ============================================================
export const version = '0.1.0';

// ============================================================
// 注意
// ============================================================
// 通用模块（如 CachingModule, IsolationModule）应该从 @hl8/nestjs-infra 导入
// 本包只包含 Fastify 专用的功能

