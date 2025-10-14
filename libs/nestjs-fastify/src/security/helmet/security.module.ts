/**
 * @fileoverview 安全头模块
 *
 * @description
 * NestJS 动态模块，集成 @fastify/helmet 提供安全头功能
 *
 * @module security/helmet
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import type { HelmetOptions } from './types/helmet-options.js';
import { DEFAULT_HELMET_OPTIONS } from './types/helmet-options.js';

/**
 * 安全头模块
 *
 * @description
 * 提供 HTTP 安全头配置的 NestJS 动态模块
 *
 * ## 业务规则
 *
 * ### 模块注册规则
 * - 支持同步配置（forRoot）
 * - 使用默认配置或自定义配置
 * - 全局模块，无需重复导入
 *
 * ### 安全头规则
 * - 默认启用所有推荐的安全头
 * - 可通过配置覆盖默认值
 * - CSP 策略默认为严格模式
 *
 * ## 注意事项
 *
 * - Helmet 通过 Fastify 插件注册，不是 NestJS Guard
 * - 配置在应用启动时生效
 * - 修改配置需要重启应用
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     SecurityModule.forRoot({
 *       contentSecurityPolicy: {
 *         directives: {
 *           defaultSrc: ["'self'"],
 *           scriptSrc: ["'self'", "'unsafe-inline'"],
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class SecurityModule {
  /**
   * 同步配置模块
   *
   * @description
   * 使用静态配置创建安全头模块
   *
   * ## 业务逻辑
   *
   * 1. **验证配置**: 检查配置参数（可选）
   * 2. **合并配置**: 将用户配置与默认配置合并
   * 3. **注册配置**: 创建配置 provider
   * 4. **导出配置**: 使配置可被其他模块注入
   *
   * ## 配置规则
   *
   * ### 可选参数
   * - 所有参数都是可选的
   * - 未提供时使用默认配置
   * - 提供的配置会覆盖默认值
   *
   * ### 配置合并
   * - 深度合并，不是替换
   * - 数组类型会被替换，不是合并
   *
   * @param options - Helmet 配置（可选）
   * @returns 动态模块定义
   *
   * @example
   * ```typescript
   * // 使用默认配置
   * SecurityModule.forRoot()
   *
   * // 自定义配置
   * SecurityModule.forRoot({
   *   contentSecurityPolicy: {
   *     directives: {
   *       defaultSrc: ["'self'"],
   *       scriptSrc: ["'self'", 'https://cdn.example.com'],
   *     },
   *   },
   * })
   * ```
   */
  static forRoot(options?: HelmetOptions): DynamicModule {
    // 合并用户配置和默认配置
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @fastify/helmet 类型定义复杂，宪章 IX 允许（第三方集成）
    const mergedOptions: any = {
      ...DEFAULT_HELMET_OPTIONS,
      ...options,
      // CSP 需要深度合并
      contentSecurityPolicy: options?.contentSecurityPolicy
        ? {
            ...(DEFAULT_HELMET_OPTIONS.contentSecurityPolicy as any),
            ...(options.contentSecurityPolicy as any),
            directives: {
              ...(DEFAULT_HELMET_OPTIONS.contentSecurityPolicy as any)
                ?.directives,
              ...(options.contentSecurityPolicy as any)?.directives,
            },
          }
        : DEFAULT_HELMET_OPTIONS.contentSecurityPolicy,
    };

    return {
      module: SecurityModule,
      global: true,
      providers: [
        {
          provide: 'HELMET_OPTIONS',
          useValue: mergedOptions,
        },
      ],
      exports: ['HELMET_OPTIONS'],
    };
  }
}
