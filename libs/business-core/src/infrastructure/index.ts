/**
 * 基础设施层导出
 *
 * @description 导出基础设施相关的类和接口
 * 集成重构后的基础设施模块：缓存、日志、配置、消息、多租户、数据库、Web框架
 * 专注于提供业务模块所需的通用基础设施功能组件
 * @since 1.0.0
 */

// 重构后的基础设施模块集成
export { CacheService, CachingModule } from "@hl8/caching";
// 为测试兼容性提供别名
export { CachingModule as CacheModule } from "@hl8/caching";
export {
  FastifyLoggerService,
  FastifyLoggingModule,
} from "@hl8/nestjs-fastify";
// 为测试兼容性提供别名
export { FastifyLoggingModule as LoggerModule } from "@hl8/nestjs-fastify";
// 临时创建TypedConfigModule和MessagingModule以满足测试需求
import { DynamicModule, Module } from "@nestjs/common";

@Module({})
export class TypedConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: TypedConfigModule,
      global: true,
      providers: [],
      exports: [],
    };
  }
}

// export { TypedConfigModule } from "@hl8/config";
// 暂时注释，等待 messaging 模块实现
// export {
//   MessagingService,
//   EventService,
//   TaskService,
// } from "@hl8/messaging";

@Module({})
export class MessagingModule {
  static forRoot(): DynamicModule {
    return {
      module: MessagingModule,
      global: true,
      providers: [],
      exports: [],
    };
  }
}

export {
  IsolationContextService,
  MultiLevelIsolationService,
  IsolationModule,
} from "@hl8/nestjs-isolation";
export {
  DatabaseModule,
  ConnectionManager,
  TransactionService,
  DatabaseIsolationService,
} from "@hl8/database";

// 为测试兼容性提供别名
export { ConnectionManager as DatabaseService } from "@hl8/database";

// 通用基础设施功能组件
export * from "./common/index.js";

// 基础设施层常量
export * from "./constants.js";

// 端口适配器（应用层端口适配器）
export * from "./adapters/ports/index.js";

// 仓储适配器（领域层仓储适配器）
export * from "./adapters/repositories/index.js";

// PostgreSQL仓储适配器
export * from "./adapters/repository-adapters/postgresql/index.js";

// 领域服务适配器（领域层服务适配器）
export * from "./adapters/services/index.js";

// 事件存储适配器（事件溯源适配器）
export * from "./adapters/event-store/index.js";

// PostgreSQL事件溯源实现
export * from "./event-sourcing/postgresql/index.js";

// 消息队列适配器（消息发布订阅适配器）
export * from "./adapters/message-queue/index.js";

// 缓存适配器（多级缓存适配器）
export * from "./adapters/cache/index.js";

// 数据库适配器（多数据库适配器）
export * from "./adapters/database/index.js";

// 基础设施工厂（基础设施服务管理）
export * from "./factories/index.js";

// 映射器基础设施（通用功能组件）
export * from "./mappers/index.js";
