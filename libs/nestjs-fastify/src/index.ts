/**
 * @hl8/nestjs-fastify - Fastify 专用的企业级基础设施模块
 *
 * @description 专门为 Fastify 优化的 NestJS 基础设施模块
 * 基于 @hl8/nestjs-infra，针对 Fastify 适配器进行优化
 *
 * @packageDocumentation
 */

// Fastify 专用模块
export { FastifyExceptionModule } from './exceptions/exception.module.js';
export { FastifyHttpExceptionFilter } from './exceptions/filters/fastify-http-exception.filter.js';
export { FastifyAnyExceptionFilter } from './exceptions/filters/fastify-any-exception.filter.js';

export { FastifyLoggingModule } from './logging/logging.module.js';
export { FastifyLoggerService } from './logging/fastify-logger.service.js';

// 从 @hl8/nestjs-infra 复用的模块
export * from './core/index.js';

// 版本信息
export const version = '0.1.0';

