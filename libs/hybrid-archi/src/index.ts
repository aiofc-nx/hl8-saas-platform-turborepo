import { TenantId } from "@hl8/isolation-model";
/**
 * Hybrid Architecture 模块精确导出文件
 *
 * 避免重复导出，使用精确的导出策略
 *
 * @description 为业务模块的开发提供统一的混合架构设计模式，以及提供通用的功能组件
 * @since 1.0.0
 */

// 通用功能层 (包含所有横切关注点)
export * from "./common/index.js";

// 基础设施层 - 只导出基础设施特有的接口
export {
  // 缓存相关
  CacheAdapter,
  CacheManager,
  CacheFactory,
  CacheService,
  CachingModule,
  // 数据库相关
  DatabaseAdapter,
  DatabaseFactory,
  DatabaseModule,
  // 消息队列相关
  MessageQueueAdapter,
  // 暂时注释，等待 messaging 模块实现
  // MessagingService,
  // EventService,
  // TaskService,
  // MessagingModule,
  // 日志相关
  FastifyLoggerService,
  // 多租户相关
  IsolationContextService,
  MultiLevelIsolationService,
  IsolationModule,
  // 配置相关
  TypedConfigModule,
  // 端口适配器
  PortAdaptersFactory,
  // 基础设施管理器
  InfrastructureManager,
  // 基础设施常量
  INFRASTRUCTURE_CONSTANTS,
} from "./infrastructure/index.js";

// 通用基础设施组件导出
export * from "./infrastructure/adapters/common/index.js";
export * from "./infrastructure/event-sourcing/common/index.js";
export * from "./infrastructure/event-driven/common/index.js";

// 应用层 - 只导出应用层特有的接口
export {
  // CQRS 相关
  CommandBus,
  QueryBus,
  EventBus,
  CQRSBus,
} from "./application/index.js";
export type {
  // 用例接口
  IUseCase,
} from "./application/index.js";
export type { ICommand, IQuery } from "./application/index.js";

// CQRS 基类
export { BaseCommand } from "./application/cqrs/commands/base/index.js";
export { BaseQuery } from "./application/cqrs/queries/base/index.js";

// CQRS 装饰器
export {
  CommandHandler,
  Command,
} from "./application/cqrs/commands/decorators/index.js";
export {
  QueryHandler,
  Query,
} from "./application/cqrs/queries/decorators/index.js";
// export { EventHandler, Event } from './application/cqrs/events/decorators'; // 暂时注释，等待实现

// CQRS 接口
export type { ICommandHandler } from "./application/cqrs/commands/handlers/index.js";
export type { IQueryHandler } from "./application/cqrs/queries/handlers/index.js";
// export type { IEventHandler } from './application/cqrs/events/handlers'; // 暂时注释，等待实现

// 通用应用层组件导出
export * from "./application/exceptions/common/index.js";
export * from "./application/interfaces/common/index.js";
export * from "./application/services/common/index.js";

// 领域层 - 只导出领域层特有的接口
export {
  // 基础实体
  BaseEntity,
  BaseAggregateRoot,
  TenantAwareAggregateRoot,
  BaseValueObject,
  // 领域事件
  BaseDomainEvent,
  // 领域服务
} from "./domain/index.js";
export type { DomainEvent, IDomainService } from "./domain/index.js";

// 审计信息类型
export type {
  IAuditInfo,
  IPartialAuditInfo,
} from "./domain/entities/base/audit-info.js";
export { AuditInfoBuilder } from "./domain/entities/base/audit-info.js";

// 仓储接口导出
export type {
  // 基础仓储接口
  IRepository,
  IRepositoryQueryOptions,
  IPaginatedResult,
  // 聚合根仓储接口
  IAggregateRepository,
  IAggregateSnapshot,
  IEventStoreRepository,
  IReadModelRepository,
} from "./domain/repositories/index.js";
export {
  BaseRepositoryError,
  ConcurrencyError,
  EntityNotFoundError,
  ValidationError,
} from "./domain/repositories/index.js";

// 通用值对象导出（EntityId已在domain中导出）
export * from "./domain/value-objects/common/index.js"; // 通用值对象库
export * from "./domain/value-objects/identities/index.js";
export * from "./domain/value-objects/ids/index.js";
export * from "./domain/value-objects/statuses/index.js";
export * from "./domain/value-objects/types/index.js";

// 通用验证器导出
export * from "./domain/validators/common/index.js";

// 接口层 - 只导出接口层特有的接口
export {
  // REST控制器
  BaseController,
  // 装饰器
  RequirePermissions,
  TenantContext,
  CurrentUser,
  CacheTTL,
  // 守卫
  JwtAuthGuard,
  PermissionGuard,
  TenantIsolationGuard,
  // 管道
  ValidationPipe,
  // GraphQL解析器
  BaseResolver,
  // WebSocket网关
  BaseGateway,
  // CLI命令
  CliBaseCommand,
  // 中间件
  LoggingMiddleware,
  // 验证器
  DataValidator,
  // 转换器
  DataTransformer,
} from "./interface/index.js";

// 通用接口层组件导出
export * from "./interface/guards/common/index.js";
export * from "./interface/decorators/common/index.js";
export * from "./interface/middleware/common/index.js";

// 通用枚举导出 - 使用明确重新导出避免冲突
export {
  UserStatus as CommonUserStatus,
  UserStatusUtils as CommonUserStatusUtils,
} from "./domain/enums/common/index.js";

// 通用类型导出
export * from "./domain/types/common/index.js";

// 通用接口层基类导出
export * from "./interface/base/index.js";

// 对外类型导出（为其他模块提供统一的类型接口）
export * from "./types/index.js";

// 从isolation-model重新导出ID值对象
export { EntityId, TenantId, UserId } from "@hl8/isolation-model";
