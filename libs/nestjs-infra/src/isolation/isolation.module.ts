/**
 * 数据隔离模块
 *
 * @description 提供5层级数据隔离功能
 *
 * @since 0.2.0
 */

import { Module, DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { IsolationContextService } from './services/isolation-context.service.js';
import { MultiLevelIsolationService } from './services/multi-level-isolation.service.js';
import { IsolationExtractionMiddleware } from './middleware/isolation-extraction.middleware.js';
import { IsolationGuard } from './guards/isolation.guard.js';

/**
 * 隔离模块选项
 */
export interface IsolationModuleOptions {
  /** 是否全局模块 */
  global?: boolean;
  /** 是否自动注册中间件 */
  autoRegisterMiddleware?: boolean;
}

/**
 * 数据隔离模块
 */
@Module({})
export class IsolationModule implements NestModule {
  private static moduleOptions: IsolationModuleOptions = {};

  static forRoot(options: IsolationModuleOptions = {}): DynamicModule {
    this.moduleOptions = options;

    return {
      module: IsolationModule,
      global: options.global !== false,
      imports: [
        ClsModule.forRoot({
          global: true,
          // 禁用 ClsModule 的自动中间件挂载
          // 改为手动控制，避免与 Fastify 中间件引擎冲突
          middleware: {
            mount: false,
          },
        }),
      ],
      providers: [
        IsolationContextService,
        MultiLevelIsolationService,
        IsolationExtractionMiddleware,
        IsolationGuard,
      ],
      exports: [IsolationContextService, MultiLevelIsolationService, IsolationGuard],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    // 仅在显式启用时才注册中间件
    if (IsolationModule.moduleOptions.autoRegisterMiddleware !== false) {
      consumer.apply(IsolationExtractionMiddleware).forRoutes('*');
    }
  }
}

