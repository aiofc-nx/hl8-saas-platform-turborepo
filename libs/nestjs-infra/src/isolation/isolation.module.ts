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
  static forRoot(options: IsolationModuleOptions = {}): DynamicModule {
    return {
      module: IsolationModule,
      global: options.global !== false,
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
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
    consumer.apply(IsolationExtractionMiddleware).forRoutes('*');
  }
}

