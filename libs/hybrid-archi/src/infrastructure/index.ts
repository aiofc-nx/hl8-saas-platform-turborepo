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
export { FastifyLoggerService } from "@hl8/nestjs-fastify";
export { TypedConfigModule } from "@hl8/config";
// 暂时注释，等待 messaging 模块实现
// export {
//   MessagingService,
//   EventService,
//   TaskService,
//   MessagingModule,
// } from "@hl8/messaging";
export { 
  IsolationContextService, 
  MultiLevelIsolationService,
  IsolationModule 
} from "@hl8/nestjs-isolation";
export {
  DatabaseModule,
} from "@hl8/database";

// 通用基础设施功能组件
export * from "./common/index.js";

// 基础设施层常量
export * from "./constants.js";

// 端口适配器（应用层端口适配器）
export * from "./adapters/ports/index.js";

// 仓储适配器（领域层仓储适配器）
export * from "./adapters/repositories/index.js";

// 领域服务适配器（领域层服务适配器）
export * from "./adapters/services/index.js";

// 事件存储适配器（事件溯源适配器）
export * from "./adapters/event-store/index.js";

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
