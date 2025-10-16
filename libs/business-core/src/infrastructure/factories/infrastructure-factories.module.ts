/**
 * 基础设施工厂模块
 *
 * 提供基础设施工厂的统一管理。
 * 作为通用功能组件，支持依赖注入和模块化配置。
 *
 * @description 基础设施工厂模块实现基础设施工厂管理
 * @since 1.0.0
 */

import { DynamicModule, Module, Provider } from "@nestjs/common";
import { CachingModule } from "@hl8/caching";
import { DatabaseModule } from "@hl8/database";
// import { MessagingModule } from "@hl8/messaging"; // 暂时注释，等待模块实现
import { IsolationModule } from "@hl8/nestjs-isolation";

import { InfrastructureFactory } from "./infrastructure.factory.js";
import { InfrastructureManager } from "./infrastructure.manager.js";

/**
 * 基础设施工厂模块选项
 */
export interface InfrastructureFactoriesModuleOptions {
  /** 是否启用基础设施工厂 */
  enableInfrastructureFactory?: boolean;
  /** 是否启用基础设施管理器 */
  enableInfrastructureManager?: boolean;
  /** 是否启用自动启动 */
  enableAutoStart?: boolean;
  /** 是否启用自动停止 */
  enableAutoStop?: boolean;
  /** 是否启用健康检查 */
  enableHealthCheck?: boolean;
  /** 是否启用统计收集 */
  enableStatistics?: boolean;
  /** 是否启用服务依赖检查 */
  enableDependencyCheck?: boolean;
}

/**
 * 基础设施工厂模块
 *
 * 提供基础设施工厂的统一管理
 */
@Module({})
export class InfrastructureFactoriesModule {
  /**
   * 创建基础设施工厂模块
   *
   * @param options - 模块选项
   * @returns 基础设施工厂模块
   */
  static forRoot(
    options: InfrastructureFactoriesModuleOptions = {},
  ): DynamicModule {
    const providers: Provider[] = [];
    const imports: DynamicModule[] = [];

    // 添加基础模块
    imports.push(
      // LoggerModule 已移除，使用 FastifyLoggerService
      CachingModule.forRoot({
        redis: {} as any,
      }),
      DatabaseModule.forRoot({
        connection: {} as any,
        entities: [],
      }),
      // MessagingModule 暂时注释，等待模块实现
      // MultiTenancyModule 已移除，使用 @hl8/nestjs-isolation
    );

    // 添加管理组件
    if (options.enableInfrastructureFactory !== false) {
      providers.push(InfrastructureFactory);
    }

    if (options.enableInfrastructureManager !== false) {
      providers.push(InfrastructureManager);
    }

    return {
      module: InfrastructureFactoriesModule,
      imports,
      providers,
      exports: providers,
    };
  }

  /**
   * 创建异步基础设施工厂模块
   *
   * @param options - 模块选项
   * @returns 基础设施工厂模块
   */
  static forRootAsync(
    options: InfrastructureFactoriesModuleOptions = {},
  ): DynamicModule {
    const providers: Provider[] = [];
    const imports: DynamicModule[] = [];

    // 添加基础模块
    imports.push(
      // LoggerModule 已移除，使用 FastifyLoggerService
      CachingModule.forRoot({
        redis: {} as any,
      }),
      DatabaseModule.forRoot({
        connection: {} as any,
        entities: [],
      }),
      // MessagingModule 暂时注释，等待模块实现
      // MultiTenancyModule 已移除，使用 @hl8/nestjs-isolation
    );

    // 添加管理组件
    if (options.enableInfrastructureFactory !== false) {
      providers.push(InfrastructureFactory);
    }

    if (options.enableInfrastructureManager !== false) {
      providers.push(InfrastructureManager);
    }

    return {
      module: InfrastructureFactoriesModule,
      imports,
      providers,
      exports: providers,
    };
  }
}
