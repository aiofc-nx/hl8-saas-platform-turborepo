/**
 * 应用层模块
 *
 * @description 配置应用层的所有组件，包括用例服务、应用服务、CQRS组件等
 *
 * ## 业务规则
 *
 * ### 模块配置规则
 * - 所有应用层组件都应该通过依赖注入配置
 * - 模块应该提供清晰的组件边界
 * - 模块应该支持测试时的模拟替换
 * - 模块应该支持环境特定的配置
 *
 * ### 依赖注入规则
 * - 使用接口类型进行依赖注入，确保松耦合
 * - 所有依赖都应该是可选的，支持部分功能
 * - 依赖注入应该支持测试时的模拟替换
 * - 依赖注入应该支持环境特定的实现
 *
 * ### 组件组织规则
 * - 用例服务集合：统一管理相关用例
 * - 应用服务：协调多个用例服务
 * - CQRS组件：命令和查询处理器
 * - 事件处理器：处理领域事件
 * - 基础设施服务：事件总线、事务管理器、缓存服务
 *
 * @example
 * ```typescript
 * // 在应用中使用
 * @Module({
 *   imports: [ApplicationModule],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 *
 * @since 1.0.0
 */

import { Module } from "@nestjs/common";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 用例服务
import { CreateUserUseCase } from "./use-cases/user/create-user.use-case.js";
import { UpdateUserUseCase } from "./use-cases/user/update-user.use-case.js";
import { DeleteUserUseCase } from "./use-cases/user/delete-user.use-case.js";
import { GetUserUseCase } from "./use-cases/user/get-user.use-case.js";
import { GetUserListUseCase } from "./use-cases/user/get-user-list.use-case.js";
import { ActivateUserUseCase } from "./use-cases/user/activate-user.use-case.js";
import { DeactivateUserUseCase } from "./use-cases/user/deactivate-user.use-case.js";

import { CreateTenantUseCase } from "./use-cases/tenant/create-tenant.use-case.js";
import { UpdateTenantUseCase } from "./use-cases/tenant/update-tenant.use-case.js";
import { DeleteTenantUseCase } from "./use-cases/tenant/delete-tenant.use-case.js";
import { GetTenantUseCase } from "./use-cases/tenant/get-tenant.use-case.js";
import { GetTenantsUseCase } from "./use-cases/tenant/get-tenants.use-case.js";
import { ActivateTenantUseCase } from "./use-cases/tenant/activate-tenant.use-case.js";
import { DeactivateTenantUseCase } from "./use-cases/tenant/deactivate-tenant.use-case.js";

// 用例服务集合
import { UserUseCaseServices } from "./services/user-use-case-services.js";
import { TenantUseCaseServices } from "./services/tenant-use-case-services.js";
import { OrganizationUseCaseServices } from "./services/organization-use-case-services.js";

// 应用服务
import { UserApplicationService } from "./services/user-application.service.js";
import { TenantApplicationService } from "./services/tenant-application.service.js";

// CQRS组件
import { CreateTenantCommandHandler } from "./cqrs/handlers/command-handlers/tenant-command-handlers.js";
import { UpdateTenantCommandHandler } from "./cqrs/handlers/command-handlers/tenant-command-handlers.js";
import { DeleteTenantCommandHandler } from "./cqrs/handlers/command-handlers/tenant-command-handlers.js";
import { ActivateTenantCommandHandler } from "./cqrs/handlers/command-handlers/tenant-command-handlers.js";
import { DeactivateTenantCommandHandler } from "./cqrs/handlers/command-handlers/tenant-command-handlers.js";

import { GetTenantQueryHandler } from "./cqrs/handlers/query-handlers/tenant-query-handlers.js";
import { GetTenantsQueryHandler } from "./cqrs/handlers/query-handlers/tenant-query-handlers.js";

// 事件处理器
import { UserCreatedEventHandler } from "./cqrs/handlers/event-handlers/user-event-handlers.js";
import { UserUpdatedEventHandler } from "./cqrs/handlers/event-handlers/user-event-handlers.js";
import { UserDeletedEventHandler } from "./cqrs/handlers/event-handlers/user-event-handlers.js";

// 基础设施服务
import { EventBus } from "./ports/event-bus.js";
import { TransactionManager } from "./ports/transaction-manager.js";
import { CacheService } from "./ports/cache-service.js";

// 仓储接口（需要根据实际实现进行调整）
import type { IUserRepository } from "../domain/repositories/user.repository.js";
import type { ITenantRepository } from "../domain/repositories/tenant.repository.js";
import type { IOrganizationRepository } from "../domain/repositories/organization.repository.js";

// 外部服务接口（需要根据实际实现进行调整）
import type { IEmailService } from "./ports/email-service.interface.js";
import type { IAuditService } from "./ports/audit-service.interface.js";
import type { INotificationService } from "./ports/notification-service.interface.js";

/**
 * 应用层模块
 *
 * @description 配置应用层的所有组件，包括用例服务、应用服务、CQRS组件等
 */
@Module({
  providers: [
    // 基础设施服务
    {
      provide: "IEventBus",
      useFactory: (logger: FastifyLoggerService) => new EventBus(logger),
      inject: [FastifyLoggerService],
    },
    {
      provide: "ITransactionManager",
      useFactory: (logger: FastifyLoggerService) => new TransactionManager(logger),
      inject: [FastifyLoggerService],
    },
    {
      provide: "ICacheService",
      useFactory: (logger: FastifyLoggerService) => new CacheService(logger),
      inject: [FastifyLoggerService],
    },

    // 用例服务
    {
      provide: "ICreateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new CreateUserUseCase(userRepository, eventBus, transactionManager, logger),
      inject: ["IUserRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IUpdateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new UpdateUserUseCase(userRepository, eventBus, transactionManager, logger),
      inject: ["IUserRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IDeleteUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new DeleteUserUseCase(userRepository, eventBus, transactionManager, logger),
      inject: ["IUserRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IGetUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetUserUseCase(userRepository, cacheService, logger),
      inject: ["IUserRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IGetUserListUseCase",
      useFactory: (
        userRepository: IUserRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetUserListUseCase(userRepository, cacheService, logger),
      inject: ["IUserRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IActivateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new ActivateUserUseCase(userRepository, eventBus, transactionManager, logger),
      inject: ["IUserRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IDeactivateUserUseCase",
      useFactory: (
        userRepository: IUserRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new DeactivateUserUseCase(userRepository, eventBus, transactionManager, logger),
      inject: ["IUserRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },

    // 租户用例服务
    {
      provide: "ICreateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new CreateTenantUseCase(tenantRepository, eventBus, transactionManager, logger),
      inject: ["ITenantRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IUpdateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new UpdateTenantUseCase(tenantRepository, eventBus, transactionManager, logger),
      inject: ["ITenantRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IDeleteTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new DeleteTenantUseCase(tenantRepository, eventBus, transactionManager, logger),
      inject: ["ITenantRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IGetTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetTenantUseCase(tenantRepository, cacheService, logger),
      inject: ["ITenantRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IGetTenantsUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        cacheService: any,
        logger: FastifyLoggerService,
      ) => new GetTenantsUseCase(tenantRepository, cacheService, logger),
      inject: ["ITenantRepository", "ICacheService", FastifyLoggerService],
    },
    {
      provide: "IActivateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new ActivateTenantUseCase(tenantRepository, eventBus, transactionManager, logger),
      inject: ["ITenantRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },
    {
      provide: "IDeactivateTenantUseCase",
      useFactory: (
        tenantRepository: ITenantRepository,
        eventBus: any,
        transactionManager: any,
        logger: FastifyLoggerService,
      ) => new DeactivateTenantUseCase(tenantRepository, eventBus, transactionManager, logger),
      inject: ["ITenantRepository", "IEventBus", "ITransactionManager", FastifyLoggerService],
    },

    // 用例服务集合
    {
      provide: "UserUseCaseServices",
      useFactory: (
        createUserUseCase: any,
        updateUserUseCase: any,
        deleteUserUseCase: any,
        getUserUseCase: any,
        getUserListUseCase: any,
        activateUserUseCase: any,
        deactivateUserUseCase: any,
        logger: FastifyLoggerService,
      ) => new UserUseCaseServices(
        createUserUseCase,
        updateUserUseCase,
        deleteUserUseCase,
        getUserUseCase,
        getUserListUseCase,
        activateUserUseCase,
        deactivateUserUseCase,
        logger,
      ),
      inject: [
        "ICreateUserUseCase",
        "IUpdateUserUseCase",
        "IDeleteUserUseCase",
        "IGetUserUseCase",
        "IGetUserListUseCase",
        "IActivateUserUseCase",
        "IDeactivateUserUseCase",
        FastifyLoggerService,
      ],
    },
    {
      provide: "TenantUseCaseServices",
      useFactory: (
        createTenantUseCase: any,
        updateTenantUseCase: any,
        deleteTenantUseCase: any,
        getTenantUseCase: any,
        getTenantsUseCase: any,
        activateTenantUseCase: any,
        deactivateTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new TenantUseCaseServices(
        createTenantUseCase,
        updateTenantUseCase,
        deleteTenantUseCase,
        getTenantUseCase,
        getTenantsUseCase,
        activateTenantUseCase,
        deactivateTenantUseCase,
        logger,
      ),
      inject: [
        "ICreateTenantUseCase",
        "IUpdateTenantUseCase",
        "IDeleteTenantUseCase",
        "IGetTenantUseCase",
        "IGetTenantsUseCase",
        "IActivateTenantUseCase",
        "IDeactivateTenantUseCase",
        FastifyLoggerService,
      ],
    },

    // 应用服务
    {
      provide: "UserApplicationService",
      useFactory: (
        userUseCaseServices: UserUseCaseServices,
        tenantUseCaseServices: TenantUseCaseServices,
        logger: FastifyLoggerService,
      ) => new UserApplicationService(userUseCaseServices, tenantUseCaseServices, logger),
      inject: ["UserUseCaseServices", "TenantUseCaseServices", FastifyLoggerService],
    },
    {
      provide: "TenantApplicationService",
      useFactory: (
        tenantUseCaseServices: TenantUseCaseServices,
        userUseCaseServices: UserUseCaseServices,
        logger: FastifyLoggerService,
      ) => new TenantApplicationService(tenantUseCaseServices, userUseCaseServices, logger),
      inject: ["TenantUseCaseServices", "UserUseCaseServices", FastifyLoggerService],
    },

    // CQRS命令处理器
    {
      provide: "CreateTenantCommandHandler",
      useFactory: (
        createTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new CreateTenantCommandHandler(createTenantUseCase, logger),
      inject: ["ICreateTenantUseCase", FastifyLoggerService],
    },
    {
      provide: "UpdateTenantCommandHandler",
      useFactory: (
        updateTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new UpdateTenantCommandHandler(updateTenantUseCase, logger),
      inject: ["IUpdateTenantUseCase", FastifyLoggerService],
    },
    {
      provide: "DeleteTenantCommandHandler",
      useFactory: (
        deleteTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new DeleteTenantCommandHandler(deleteTenantUseCase, logger),
      inject: ["IDeleteTenantUseCase", FastifyLoggerService],
    },
    {
      provide: "ActivateTenantCommandHandler",
      useFactory: (
        activateTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new ActivateTenantCommandHandler(activateTenantUseCase, logger),
      inject: ["IActivateTenantUseCase", FastifyLoggerService],
    },
    {
      provide: "DeactivateTenantCommandHandler",
      useFactory: (
        deactivateTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new DeactivateTenantCommandHandler(deactivateTenantUseCase, logger),
      inject: ["IDeactivateTenantUseCase", FastifyLoggerService],
    },

    // CQRS查询处理器
    {
      provide: "GetTenantQueryHandler",
      useFactory: (
        getTenantUseCase: any,
        logger: FastifyLoggerService,
      ) => new GetTenantQueryHandler(getTenantUseCase, logger),
      inject: ["IGetTenantUseCase", FastifyLoggerService],
    },
    {
      provide: "GetTenantsQueryHandler",
      useFactory: (
        getTenantsUseCase: any,
        logger: FastifyLoggerService,
      ) => new GetTenantsQueryHandler(getTenantsUseCase, logger),
      inject: ["IGetTenantsUseCase", FastifyLoggerService],
    },

    // 事件处理器
    {
      provide: "UserCreatedEventHandler",
      useFactory: (
        emailService: IEmailService,
        auditService: IAuditService,
        notificationService: INotificationService,
        logger: FastifyLoggerService,
      ) => new UserCreatedEventHandler(emailService, auditService, notificationService, logger),
      inject: ["IEmailService", "IAuditService", "INotificationService", FastifyLoggerService],
    },
    {
      provide: "UserUpdatedEventHandler",
      useFactory: (
        auditService: IAuditService,
        notificationService: INotificationService,
        logger: FastifyLoggerService,
      ) => new UserUpdatedEventHandler(auditService, notificationService, logger),
      inject: ["IAuditService", "INotificationService", FastifyLoggerService],
    },
    {
      provide: "UserDeletedEventHandler",
      useFactory: (
        auditService: IAuditService,
        notificationService: INotificationService,
        logger: FastifyLoggerService,
      ) => new UserDeletedEventHandler(auditService, notificationService, logger),
      inject: ["IAuditService", "INotificationService", FastifyLoggerService],
    },
  ],
  exports: [
    // 应用服务
    "UserApplicationService",
    "TenantApplicationService",
    
    // 用例服务集合
    "UserUseCaseServices",
    "TenantUseCaseServices",
    
    // 基础设施服务
    "IEventBus",
    "ITransactionManager",
    "ICacheService",
    
    // CQRS组件
    "CreateTenantCommandHandler",
    "UpdateTenantCommandHandler",
    "DeleteTenantCommandHandler",
    "ActivateTenantCommandHandler",
    "DeactivateTenantCommandHandler",
    "GetTenantQueryHandler",
    "GetTenantsQueryHandler",
    
    // 事件处理器
    "UserCreatedEventHandler",
    "UserUpdatedEventHandler",
    "UserDeletedEventHandler",
  ],
})
export class ApplicationModule {}
